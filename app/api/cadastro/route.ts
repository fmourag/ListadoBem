import { NextResponse } from 'next/server';

import { criarSupabaseAdmin, SupabaseAdminConfigError } from '@/lib/supabase-admin';
import { criarSupabaseServer, SupabaseConfigError } from '@/lib/supabase';
import type { RespostaCadastro } from '@/lib/tipos';
import { cadastroSchema, somenteDigitos } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/cadastro
 *
 * Fluxo:
 *  1. valida o corpo com o MESMO schema Zod do formulário (o client não é confiável);
 *  2. limita tentativas por IP (proteção simples contra spam);
 *  3. verifica duplicidade de CPF/CNPJ (o índice UNIQUE do banco é a autoridade final);
 *  4. insere o cadastro com status "pendente" (nunca aceita status vindo do client);
 *  5. insere as referências públicas;
 *  6. em caso de falha parcial, tenta descartar o cadastro pendente via RPC.
 *
 * Segurança: a `SUPABASE_SERVICE_ROLE_KEY` é usada apenas aqui no servidor,
 * através de `lib/supabase-admin.ts` (marcado com `server-only`). Se ela não
 * estiver configurada, a rota opera em modo degradado com a ANON_KEY e o RLS.
 */

const LIMITE_POR_IP = 5;
const JANELA_MS = 60 * 60 * 1000;
const TAMANHO_MAXIMO_BYTES = 200_000;

const tentativasPorIp = new Map<string, { total: number; expiraEm: number }>();

function ipDaRequisicao(request: Request): string {
  const encaminhado = request.headers.get('x-forwarded-for');
  if (encaminhado) return encaminhado.split(',')[0]?.trim() || 'desconhecido';
  return request.headers.get('x-real-ip')?.trim() || 'desconhecido';
}

function excedeuLimite(ip: string): boolean {
  const agora = Date.now();
  const registro = tentativasPorIp.get(ip);

  if (!registro || registro.expiraEm < agora) {
    tentativasPorIp.set(ip, { total: 1, expiraEm: agora + JANELA_MS });
    return false;
  }

  registro.total += 1;
  return registro.total > LIMITE_POR_IP;
}

function resposta(
  corpo: RespostaCadastro,
  status: number,
): NextResponse<RespostaCadastro> {
  return NextResponse.json(corpo, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const tamanhoDeclarado = Number(request.headers.get('content-length') ?? 0);
  if (tamanhoDeclarado > TAMANHO_MAXIMO_BYTES) {
    return resposta(
      { ok: false, mensagem: 'Requisição muito grande. Reduza o texto enviado.' },
      413,
    );
  }

  let corpoBruto: unknown;
  try {
    corpoBruto = await request.json();
  } catch {
    return resposta(
      { ok: false, mensagem: 'Corpo da requisição inválido (JSON esperado).' },
      400,
    );
  }

  const analise = cadastroSchema.safeParse(corpoBruto);
  if (!analise.success) {
    return resposta(
      {
        ok: false,
        mensagem: 'Revise os campos destacados e tente novamente.',
        erros: analise.error.flatten().fieldErrors as unknown as Record<
          string,
          string[] | undefined
        >,
      },
      422,
    );
  }

  const ip = ipDaRequisicao(request);
  if (excedeuLimite(ip)) {
    return resposta(
      {
        ok: false,
        mensagem:
          'Muitas tentativas de cadastro em pouco tempo. Aguarde uma hora e tente novamente.',
      },
      429,
    );
  }

  let supabase;
  try {
    // Caminho principal: service role no servidor (vê pendentes e evita
    // depender das políticas de INSERT do anon).
    supabase = criarSupabaseAdmin();
  } catch (erro) {
    if (!(erro instanceof SupabaseAdminConfigError)) throw erro;

    // Modo degradado (ex.: dev local sem a chave): usa a ANON_KEY e o RLS.
    try {
      supabase = criarSupabaseServer();
      console.warn(
        '[api/cadastro] SUPABASE_SERVICE_ROLE_KEY ausente: inserindo via ANON_KEY (modo degradado).',
      );
    } catch (erroAnon) {
      if (erroAnon instanceof SupabaseConfigError) {
        return resposta(
          {
            ok: false,
            mensagem:
              'Serviço temporariamente indisponível: o Supabase não está configurado neste ambiente.',
          },
          503,
        );
      }
      throw erroAnon;
    }
  }

  const dados = analise.data;
  const documento = somenteDigitos(dados.cpf_cnpj);
  const cadastroId = crypto.randomUUID();

  // Com service role, a consulta enxerga cadastros pendentes também.
  // Em modo degradado, só os aprovados; a UNIQUE do banco cobre o resto.
  const { data: existente, error: erroConsulta } = await supabase
    .from('cadastros_boicote')
    .select('id')
    .eq('cpf_cnpj', documento)
    .maybeSingle();

  if (erroConsulta && erroConsulta.code !== 'PGRST116') {
    return resposta(
      {
        ok: false,
        mensagem: 'Não foi possível verificar o cadastro agora. Tente novamente em instantes.',
      },
      500,
    );
  }

  if (existente) {
    return resposta(
      {
        ok: false,
        mensagem:
          'Já existe um cadastro com este CPF/CNPJ. Se você precisa corrigir informações, fale com a equipe pelo e-mail de contato.',
      },
      409,
    );
  }

  const midia =
    dados.midia && dados.midia.length > 0
      ? dados.midia.map((item) => ({
          tipo: item.tipo,
          url: item.url,
          descricao: item.descricao ?? null,
        }))
      : dados.link_midia
        ? [{ tipo: 'logo', url: dados.link_midia, descricao: null }]
        : [];

  const { error: erroCadastro } = await supabase.from('cadastros_boicote').insert({
    id: cadastroId,
    tipo_cadastro: dados.tipo_cadastro,
    nome_completo: dados.nome_completo,
    nome_publico: dados.nome_publico,
    cpf_cnpj: documento,
    email: dados.email,
    telefone: dados.telefone,
    categoria: dados.categoria,
    descricao_atividade: dados.descricao_atividade,
    endereco: {
      cep: dados.endereco.cep,
      logradouro: dados.endereco.logradouro,
      numero: dados.endereco.numero,
      complemento: dados.endereco.complemento ?? null,
      bairro: dados.endereco.bairro,
      cidade: dados.endereco.cidade,
      estado: dados.endereco.estado,
      pais: dados.endereco.pais || 'Brasil',
    },
    situacao_boicote: dados.situacao_boicote,
    midia,
    // O status é SEMPRE definido pelo servidor. O client não pode aprovar a si mesmo.
    status: 'pendente',
  });

  if (erroCadastro) {
    if (erroCadastro.code === '23505') {
      return resposta(
        {
          ok: false,
          mensagem:
            'Já existe um cadastro com este CPF/CNPJ. Se você precisa corrigir informações, fale com a equipe pelo e-mail de contato.',
        },
        409,
      );
    }

    console.error('[api/cadastro] Falha ao inserir cadastro:', erroCadastro.message);
    return resposta(
      {
        ok: false,
        mensagem:
          'Não foi possível salvar o cadastro agora. Tente novamente em alguns minutos.',
      },
      500,
    );
  }

  const referencias = dados.referencias.map((referencia) => ({
    cadastro_id: cadastroId,
    tipo_fonte: referencia.tipo_fonte,
    nome_fonte: referencia.nome_fonte,
    link_referencia: referencia.link_referencia,
    titulo_referencia: referencia.titulo_referencia,
    data_publicacao: referencia.data_publicacao || null,
    descricao_contexto: referencia.descricao_contexto || null,
  }));

  const { error: erroReferencias } = await supabase
    .from('referencias_publicas')
    .insert(referencias);

  if (erroReferencias) {
    console.error('[api/cadastro] Falha ao inserir referências:', erroReferencias.message);

    // Compensação: remove o cadastro pendente recém-criado (função SECURITY DEFINER
    // que só apaga registro pendente, criado há menos de 15 minutos e com o mesmo CPF/CNPJ).
    try {
      await supabase.rpc('descartar_cadastro_pendente', {
        p_cadastro_id: cadastroId,
        p_cpf_cnpj: documento,
      });
    } catch {
      // Best effort: se a função não existir, o cadastro fica pendente e invisível
      // publicamente até a limpeza pela equipe.
    }

    return resposta(
      {
        ok: false,
        mensagem:
          'Não foi possível salvar as referências públicas. Revise os links e tente novamente.',
      },
      500,
    );
  }

  return resposta(
    {
      ok: true,
      id: cadastroId,
      status: 'pendente',
      mensagem:
        'Cadastro recebido! Ele passa por análise antes de ser publicado. A plataforma não cobra nenhum valor.',
    },
    201,
  );
}
