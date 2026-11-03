import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Inbox,
  KeyRound,
  Lock,
  LogOut,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

import { AvisoNaoTransferencia } from '@/components/AvisoNaoTransferencia';
import { adminConfigurado, verifyAdminSession } from '@/lib/admin-auth';
import { formatarCategoria, formatarDataHora, formatarTipoCadastro } from '@/lib/format';
import {
  criarSupabaseAdmin,
  SupabaseAdminConfigError,
  supabaseAdminConfigurado,
} from '@/lib/supabase-admin';

import { aprovarCadastro, loginAdmin, logoutAdmin, rejeitarCadastro } from './actions';

/**
 * Painel de moderação — protegido por ADMIN_SECRET (verificação simples).
 *
 * Só existe no servidor: usa o cliente com service role para ler cadastros
 * pendentes (o anon não os enxerga) e para executar as Server Actions.
 * Nunca é indexado e não deve ser divulgado.
 */

export const metadata: Metadata = {
  title: 'Moderação de cadastros',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface ModeracaoPageProps {
  searchParams?: Promise<{ ok?: string; erro?: string }>;
}

interface Pendente {
  id: string;
  nome_publico: string;
  tipo_cadastro: string;
  categoria: string;
  endereco: { cidade?: string; estado?: string } | null;
  criado_em: string;
  referencias_publicas: Array<{
    id: string;
    nome_fonte: string;
    link_referencia: string;
  }>;
}

const MENSAGENS_ERRO: Record<string, string> = {
  credenciais: 'Credenciais inválidas. Confira a senha e tente novamente.',
  limite: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
  sessao: 'Sua sessão expirou. Entre novamente para continuar.',
  config:
    'SUPABASE_SERVICE_ROLE_KEY não configurada. Defina a variável (server-side) para moderar cadastros.',
  'id-invalido': 'Identificador de cadastro inválido.',
};

function localDoCadastro(pendente: Pendente): string {
  const partes = [pendente.endereco?.cidade, pendente.endereco?.estado].filter(
    (parte): parte is string => Boolean(parte),
  );
  return partes.length > 0 ? partes.join(' — ') : 'Local não informado';
}

function Aviso({ tom, titulo, texto }: { tom: 'sucesso' | 'erro'; titulo: string; texto: string }) {
  const sucesso = tom === 'sucesso';
  return (
    <div
      role="status"
      className={`mt-5 flex items-start gap-2 rounded-xl border p-4 ${
        sucesso
          ? 'border-esmeralda-200 bg-esmeralda-50 text-esmeralda-900'
          : 'border-perigo-200 bg-perigo-50 text-perigo-900'
      }`}
    >
      {sucesso ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div>
        <p className="text-sm font-bold">{titulo}</p>
        <p className="mt-0.5 text-sm leading-relaxed">{texto}</p>
      </div>
    </div>
  );
}

export default async function ModeracaoPage({ searchParams }: ModeracaoPageProps) {
  const params = (await searchParams) ?? {};
  const autenticado = await verifyAdminSession();

  const custoDeAcesso = (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg">
        <div className="card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-marinho-100">
            <KeyRound aria-hidden="true" className="h-5 w-5 text-marinho-700" />
          </span>
          <h1 className="mt-4 text-xl font-black text-marinho-950">Área restrita</h1>
          <p className="mt-1 text-sm leading-relaxed text-marinho-600">
            Informe a senha de moderação para ver e aprovar cadastros pendentes. A sessão dura
            1 hora e fica em cookie seguro — a senha nunca vai para a URL.
          </p>

          {['credenciais', 'sessao', 'limite'].includes(params.erro ?? '') ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-perigo-200 bg-perigo-50 px-3 py-2 text-sm font-semibold text-perigo-800"
            >
              {MENSAGENS_ERRO[params.erro ?? '']}
            </p>
          ) : null}

          <form action={loginAdmin} className="mt-5 space-y-3">
            <div>
              <label htmlFor="senha" className="label">
                Senha de acesso
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••••••"
              />
            </div>
            <button type="submit" className="btn-primario w-full">
              <Lock aria-hidden="true" className="h-4 w-4" />
              Acessar Painel
            </button>
          </form>
        </div>

        <div className="mt-5">
          <AvisoNaoTransferencia variante="compact" className="!text-marinho-600" />
        </div>
      </div>
    </div>
  );

  if (!adminConfigurado()) {
    return (
      <div className="container-page py-12">
        <div className="mx-auto max-w-lg">
          <div className="card border-ouro-300 bg-ouro-50 p-6">
            <h1 className="flex items-center gap-2 text-lg font-black text-marinho-950">
              <ShieldAlert aria-hidden="true" className="h-5 w-5 text-ouro-700" />
              Painel desativado
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-marinho-800">
              A variável <code className="rounded bg-white px-1">ADMIN_SECRET</code> não está
              definida neste ambiente. Adicione-a em{' '}
              <code className="rounded bg-white px-1">.env.local</code> (ou nas variáveis
              da Vercel) e reinicie o servidor.
            </p>
            <Link href="/" className="btn-secundario mt-4">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Voltar para a landing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return custoDeAcesso;
  }

  let pendentes: Pendente[] = [];
  let erroConsulta: string | null = null;

  if (supabaseAdminConfigurado()) {
    try {
      const supabase = criarSupabaseAdmin();
      const { data, error } = await supabase
        .from('cadastros_boicote')
        .select(
          'id, nome_publico, tipo_cadastro, categoria, endereco, criado_em, referencias_publicas ( id, nome_fonte, link_referencia )',
        )
        .eq('status', 'pendente')
        .order('criado_em', { ascending: true })
        .limit(50);

      if (error) {
        erroConsulta = error.message;
      } else {
        pendentes = (data ?? []) as unknown as Pendente[];
      }
    } catch (erro) {
      erroConsulta =
        erro instanceof SupabaseAdminConfigError
          ? 'config'
          : erro instanceof Error
            ? erro.message
            : 'Erro ao consultar cadastros.';
    }
  }

  const semServiceRole = !supabaseAdminConfigurado();
  const mensagemErro = params.erro
    ? (MENSAGENS_ERRO[params.erro] ?? params.erro)
    : null;

  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
            Área administrativa
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-marinho-950 sm:text-3xl">
            Moderação de cadastros
          </h1>
          <p className="mt-1 text-sm text-marinho-600">
            {pendentes.length} cadastro{pendentes.length === 1 ? '' : 's'} pendente
            {pendentes.length === 1 ? '' : 's'} de análise. Aprovar publica; rejeitar mantém fora.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/dashboard" className="btn-secundario">Dashboard</Link>
          <Link href="/listagem" className="btn-secundario">
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            Ver listagem pública
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="btn-secundario">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </header>

      {params.ok ? (
        <Aviso
          tom="sucesso"
          titulo={params.ok === 'aprovado' ? 'Cadastro aprovado' : 'Cadastro rejeitado'}
          texto={
            params.ok === 'aprovado'
              ? 'O cadastro já está visível na listagem pública.'
              : 'O cadastro continua fora do diretório.'
          }
        />
      ) : null}

      {mensagemErro ? (
        <Aviso tom="erro" titulo="Não foi possível concluir" texto={mensagemErro} />
      ) : null}

      {semServiceRole ? (
        <div className="card mt-6 border-ouro-300 bg-ouro-50 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
            <ShieldAlert aria-hidden="true" className="h-5 w-5 text-ouro-700" />
            Falta configurar a service role
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-marinho-800">
            Para listar cadastros pendentes e aprovar/rejeitar, defina{' '}
            <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> em{' '}
            <code className="rounded bg-white px-1">.env.local</code>. A chave é usada
            apenas aqui no servidor (<code className="rounded bg-white px-1">lib/supabase-admin.ts</code>{' '}
            é <code className="rounded bg-white px-1">server-only</code>).
          </p>
        </div>
      ) : null}

      {erroConsulta && erroConsulta !== 'config' ? (
        <Aviso tom="erro" titulo="Erro ao consultar pendentes" texto={erroConsulta} />
      ) : null}

      {pendentes.length === 0 && !semServiceRole && !erroConsulta ? (
        <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marinho-50">
            <Inbox aria-hidden="true" className="h-6 w-6 text-marinho-500" />
          </span>
          <h2 className="text-lg font-bold text-marinho-950">Nenhum cadastro pendente</h2>
          <p className="max-w-md text-sm leading-relaxed text-marinho-600">
            Tudo em dia. Novos cadastros enviados pelo formulário aparecem aqui com status
            <span className="mx-1 rounded bg-ouro-100 px-1.5 py-0.5 text-xs font-bold text-ouro-900">
              pendente
            </span>
            .
          </p>
        </div>
      ) : null}

      {pendentes.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {pendentes.map((pendente) => (
            <li key={pendente.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-marinho-50 text-marinho-700 ring-1 ring-inset ring-marinho-200">
                      {formatarTipoCadastro(pendente.tipo_cadastro)}
                    </span>
                    <span className="badge bg-esmeralda-50 text-esmeralda-800 ring-1 ring-inset ring-esmeralda-200">
                      {formatarCategoria(pendente.categoria)}
                    </span>
                    <span className="badge bg-ouro-100 text-ouro-900 ring-1 ring-inset ring-ouro-300">
                      <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                      pendente
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-marinho-950">
                    {pendente.nome_publico}
                  </h2>
                  <p className="mt-0.5 text-sm text-marinho-600">
                    {localDoCadastro(pendente)}
                    {pendente.criado_em
                      ? ` · enviado em ${formatarDataHora(pendente.criado_em) ?? pendente.criado_em}`
                      : ''}
                  </p>
                </div>

                <div className="flex gap-2">
                  <form action={aprovarCadastro}>
                    <input type="hidden" name="id" value={pendente.id} />
                    <button type="submit" className="btn-verde">
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                      Aprovar
                    </button>
                  </form>
                  <form action={rejeitarCadastro}>
                    <input type="hidden" name="id" value={pendente.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-perigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-perigo-700 shadow-sm transition hover:bg-perigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perigo-500 focus-visible:ring-offset-2"
                    >
                      <XCircle aria-hidden="true" className="h-4 w-4" />
                      Rejeitar
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-marinho-100 bg-marinho-50/60 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-marinho-600">
                  <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  {pendente.referencias_publicas?.length ?? 0} referência
                  {(pendente.referencias_publicas?.length ?? 0) === 1 ? '' : 's'} pública
                  {(pendente.referencias_publicas?.length ?? 0) === 1 ? '' : 's'}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {(pendente.referencias_publicas ?? []).map((referencia) => (
                    <li key={referencia.id}>
                      <a
                        href={referencia.link_referencia}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-start gap-1.5 text-sm text-marinho-700 underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950"
                      >
                        <ExternalLink
                          aria-hidden="true"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-marinho-400"
                        />
                        {referencia.nome_fonte}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8">
        <AvisoNaoTransferencia variante="compact" className="!text-marinho-500" />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-marinho-500">
        Sessão por cookie <code className="rounded bg-marinho-50 px-1">HttpOnly</code>,{' '}
        <code className="rounded bg-marinho-50 px-1">Secure</code> e{' '}
        <code className="rounded bg-marinho-50 px-1">SameSite=Strict</code>, com validade de 1
        hora. Em produção, proteja também por Cloudflare Access, Vercel Password Protection ou SSO.
      </p>
    </div>
  );
}

