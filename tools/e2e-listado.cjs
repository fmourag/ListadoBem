/**
 * E2E do app Listado Bem com navegador real (Playwright).
 *
 * Pre-requisito: app rodando em http://localhost:3001 (npm run dev ou build/start)
 * Uso: node tools/e2e-listado.cjs
 *
 * - confere a landing (aviso + CTA)
 * - cria um cadastro de teste pela API (pendente)
 * - abre /admin/moderacao, clica em Aprovar e confere a listagem publica
 * - cria outro, clica em Rejeitar e confere que NAO aparece
 * - apaga os registros de teste no final (mesmo em caso de falha)
 */
const { readFile } = require('node:fs/promises');
const { createRequire } = require('node:module');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const ENV = path.join(RAIZ, '.env.local');
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:3001';
const CPF_TESTE = '11144477735';

const req = createRequire(path.join(RAIZ, 'package.json'));
const { createClient } = req('@supabase/supabase-js');
const { chromium } = require('playwright');

function pegar(texto, nome) {
  const m = texto.match(new RegExp(`^[ \\t]*${nome}[ \\t]*=[ \\t]*([^\\r\\n]*)$`, 'm'));
  if (!m) return null;
  const valor = m[1].trim().replace(/^["']|["']$/g, '');
  return valor.length > 0 ? valor : null;
}

function payload(nome, email) {
  return {
    tipo_cadastro: 'comerciante',
    nome_completo: 'Teste E2E da Silva',
    nome_publico: nome,
    cpf_cnpj: '111.444.777-35',
    email,
    telefone: '(11) 99999-9999',
    categoria: 'alimentacao',
    descricao_atividade: 'Negocio de teste do fluxo completo com mais de quarenta caracteres.',
    endereco: {
      cep: '01001-000',
      logradouro: 'Rua Teste',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
      pais: 'Brasil',
    },
    situacao_boicote: 'Situacao de boicote ficticia do teste E2E com mais de quarenta caracteres.',
    referencias: [
      {
        tipo_fonte: 'jornal',
        nome_fonte: 'Jornal Teste',
        link_referencia: 'https://exemplo.com/materia-e2e',
        titulo_referencia: 'Materia do E2E sobre o boicote',
        data_publicacao: '2026-01-10',
      },
      {
        tipo_fonte: 'blog',
        nome_fonte: 'Blog Teste',
        link_referencia: 'https://exemplo.com/blog-e2e',
        titulo_referencia: 'Post do E2E sobre o boicote',
      },
    ],
    aceite_termos: true,
    aceite_aviso_nao_transferencia: true,
  };
}

async function main() {
  const env = await readFile(ENV, 'utf8');
  const url = pegar(env, 'NEXT_PUBLIC_SUPABASE_URL');
  const chaveServico = pegar(env, 'SUPABASE_SERVICE_ROLE_KEY');
  const segredo = pegar(env, 'ADMIN_SECRET');

  if (!url || !chaveServico || !segredo) {
    throw new Error('Configure URL, SUPABASE_SERVICE_ROLE_KEY e ADMIN_SECRET no .env.local');
  }

  const admin = createClient(url, chaveServico, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const criados = [];
  const falhas = [];
  const ok = (msg) => console.log('PASS  ' + msg);
  const falha = (msg) => {
    console.log('FAIL  ' + msg);
    falhas.push(msg);
  };

  const criar = async (nome, email) => {
    const resposta = await fetch(`${BASE}/api/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(nome, email)),
    });
    const corpo = await resposta.json().catch(() => ({}));
    if (resposta.status !== 201 || !corpo.ok) {
      throw new Error(`POST /api/cadastro falhou (${resposta.status}): ${corpo.mensagem ?? 'sem corpo'}`);
    }
    criados.push(corpo.id);
    return corpo.id;
  };

  const apagar = async (id) => {
    const { error } = await admin.from('cadastros_boicote').delete().eq('id', id);
    if (error) throw new Error('limpeza falhou: ' + error.message);
    const posicao = criados.indexOf(id);
    if (posicao >= 0) criados.splice(posicao, 1);
  };

  const navegador = await chromium.launch({ headless: true });
  const pagina = await navegador.newPage();

  try {
    // 0. Landing
    await pagina.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    (await pagina.getByText(/NÃO FAÇA TRANSFERÊNCIAS FINANCEIRAS/).count()) >= 1
      ? ok('landing mostra o aviso de nao transferencia')
      : falha('aviso ausente na landing');

    // 1. Aprovar
    const nomeA = 'Padaria E2E A';
    await criar(nomeA, 'e2e-a@example.com');

    await pagina.goto(`${BASE}/admin/moderacao?chave=${encodeURIComponent(segredo)}`, {
      waitUntil: 'domcontentloaded',
    });
    (await pagina.getByRole('heading', { name: 'Moderação de cadastros' }).count()) === 1
      ? ok('painel abriu com a chave correta')
      : falha('painel nao abriu com a chave correta');

    const cartaoA = pagina.locator('li', { hasText: nomeA }).first();
    (await cartaoA.count()) === 1
      ? ok('cadastro pendente aparece na moderacao')
      : falha('cadastro pendente nao apareceu');

    await cartaoA.getByRole('button', { name: 'Aprovar' }).click();
    await pagina.waitForURL(/ok=aprovado/, { timeout: 20000 });
    (await pagina.getByText('Cadastro aprovado').count()) >= 1
      ? ok('acao Aprovar confirmou')
      : falha('Aprovar nao confirmou');

    await pagina.goto(`${BASE}/listagem`, { waitUntil: 'domcontentloaded' });
    const publicadosA = pagina.locator('article', { hasText: nomeA });
    (await publicadosA.count()) === 1
      ? ok('aprovado aparece na listagem publica')
      : falha('aprovado NAO apareceu na listagem');

    const linksA = await publicadosA.locator('a[href*="exemplo.com"]').count();
    linksA >= 2 ? ok(`card mostra ${linksA} referencias`) : falha('referencias ausentes no card');

    // 2. Rejeitar
    await apagar(criados[0]);
    const nomeB = 'Padaria E2E B';
    await criar(nomeB, 'e2e-b@example.com');

    await pagina.goto(`${BASE}/admin/moderacao?chave=${encodeURIComponent(segredo)}`, {
      waitUntil: 'domcontentloaded',
    });
    const cartaoB = pagina.locator('li', { hasText: nomeB }).first();
    await cartaoB.getByRole('button', { name: 'Rejeitar' }).click();
    await pagina.waitForURL(/ok=rejeitado/, { timeout: 20000 });
    (await pagina.getByText('Cadastro rejeitado').count()) >= 1
      ? ok('acao Rejeitar confirmou')
      : falha('Rejeitar nao confirmou');

    await pagina.goto(`${BASE}/listagem`, { waitUntil: 'domcontentloaded' });
    (await pagina.locator('article', { hasText: nomeB }).count()) === 0
      ? ok('rejeitado NAO aparece na listagem')
      : falha('rejeitado apareceu indevidamente');
  } finally {
    await navegador.close();
    for (const id of [...criados]) {
      try {
        await apagar(id);
      } catch (erro) {
        console.error(erro.message);
      }
    }
    const { count } = await admin
      .from('cadastros_boicote')
      .select('id', { count: 'exact', head: true })
      .eq('cpf_cnpj', CPF_TESTE);
    console.log('cadastros de teste restantes:', count ?? 0);
  }

  if (falhas.length > 0) {
    console.log(`\nRESULTADO: ${falhas.length} falha(s).`);
    process.exitCode = 1;
  } else {
    console.log('\nRESULTADO: todos os testes passaram.');
  }
}

main().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
