/**
 * Smoke test de deploy — somente HTTP (status, headers e conteúdo estático).
 *
 * Não acessa banco, não cria cadastros e não precisa de Supabase.
 *
 * Uso:
 *   node tools/smoke-deploy.cjs https://seu-dominio.vercel.app
 *   SMOKE_BASE=https://... node tools/smoke-deploy.cjs
 *
 * Sem argumento, testa http://127.0.0.1:3001.
 */
const BASE = (process.env.SMOKE_BASE || process.argv[2] || 'http://127.0.0.1:3001').replace(
  /\/+$/,
  '',
);

const TIMEOUT_MS = 15000;

/** Headers definidos em vercel.json só existem quando servidos pela Vercel. */
const LOCAL = /^(127\.0\.0\.1|localhost|\[::1\])$/.test(new URL(BASE).hostname);

let falhas = 0;
let passes = 0;
let pulados = 0;

function ok(msg) {
  passes += 1;
  console.log('PASS  ' + msg);
}

function falha(msg) {
  falhas += 1;
  console.log('FAIL  ' + msg);
}

async function obter(caminho, init) {
  const resposta = await fetch(BASE + caminho, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...init,
  });
  const corpo = await resposta.text();
  return { resposta, corpo, headers: resposta.headers };
}

function conferirStatus(rotulo, resposta, esperado) {
  resposta.status === esperado
    ? ok(`${rotulo} → ${resposta.status}`)
    : falha(`${rotulo} → ${resposta.status} (esperado ${esperado})`);
}

function conferirHeader(rotulo, headers, nome, predicao, descricao) {
  const valor = headers.get(nome);
  valor && predicao(valor)
    ? ok(`${rotulo}: ${nome} ${descricao}`)
    : falha(`${rotulo}: ${nome} ausente/incorreto (${valor ?? 'null'})`);
}

function conferirHtml(rotulo, headers) {
  conferirHeader(rotulo, headers, 'content-type', (v) => v.includes('text/html'), 'text/html');
  conferirHeader(rotulo, headers, 'content-security-policy', (v) => v.includes("frame-ancestors 'none'"), "frame-ancestors 'none'");
  headers.get('x-powered-by') === null
    ? ok(`${rotulo}: sem X-Powered-By`)
    : falha(`${rotulo}: X-Powered-By exposto`);

  if (LOCAL) {
    pulados += 3;
    console.log(`SKIP  ${rotulo}: headers do vercel.json (nosniff/referrer/permissions)`);
    return;
  }

  conferirHeader(rotulo, headers, 'x-content-type-options', (v) => v === 'nosniff', 'nosniff');
  conferirHeader(rotulo, headers, 'referrer-policy', (v) => v.length > 0, 'presente');
  conferirHeader(rotulo, headers, 'permissions-policy', (v) => v.length > 0, 'presente');
}

async function main() {
  console.log(`Smoke test: ${BASE}\n`);

  // 1. Landing
  {
    const { resposta, corpo, headers } = await obter('/');
    conferirStatus('GET /', resposta, 200);
    conferirHtml('GET /', headers);
    corpo.includes('NÃO FAÇA TRANSFERÊNCIAS FINANCEIRAS')
      ? ok('GET /: aviso de não transferência presente')
      : falha('GET /: aviso de não transferência ausente');
  }

  // 2. Páginas públicas
  for (const [caminho, trecho] of [
    ['/listagem', 'Estabelecimentos'],
    ['/cadastro', 'Ação social'],
    ['/termos', 'Termos de Uso'],
    ['/privacidade', 'Política de Privacidade'],
  ]) {
    const { resposta, corpo, headers } = await obter(caminho);
    conferirStatus(`GET ${caminho}`, resposta, 200);
    conferirHtml(`GET ${caminho}`, headers);
    corpo.includes(trecho)
      ? ok(`GET ${caminho}: conteúdo esperado`)
      : falha(`GET ${caminho}: trecho "${trecho}" ausente`);
  }

  // 3. Página de contribuição + QR
  {
    const { resposta, corpo, headers } = await obter('/apoie');
    conferirStatus('GET /apoie', resposta, 200);
    conferirHtml('GET /apoie', headers);
    corpo.includes('Apoie') ? ok('GET /apoie: conteúdo esperado') : falha('GET /apoie: conteúdo ausente');
  }
  {
    const { resposta, corpo, headers } = await obter('/apoie/qr');
    conferirStatus('GET /apoie/qr', resposta, 200);
    conferirHeader('GET /apoie/qr', headers, 'content-type', (v) => v.includes('image/svg+xml'), 'image/svg+xml');
    corpo.trimStart().startsWith('<svg') ? ok('GET /apoie/qr: corpo SVG') : falha('GET /apoie/qr: corpo não é SVG');
  }

  // 4. Admin deve pedir login (sem cookie)
  {
    const { resposta, corpo, headers } = await obter('/admin/moderacao');
    conferirStatus('GET /admin/moderacao', resposta, 200);
    conferirHtml('GET /admin/moderacao', headers);
    corpo.includes('Área restrita')
      ? ok('GET /admin/moderacao: exige login')
      : falha('GET /admin/moderacao: não exibiu login');
    corpo.includes('name="senha"')
      ? ok('GET /admin/moderacao: formulário de senha presente')
      : falha('GET /admin/moderacao: formulário de senha ausente');
  }

  // 5. API responde método não permitido em GET (sem tocar no banco)
  {
    const { resposta } = await obter('/api/cadastro');
    resposta.status === 405
      ? ok('GET /api/cadastro → 405 (método não permitido)')
      : falha(`GET /api/cadastro → ${resposta.status} (esperado 405)`);
  }

  console.log(`\n${passes} PASS · ${falhas} FAIL · ${pulados} SKIP`);
  if (falhas > 0) {
    console.log('RESULTADO: smoke test FALHOU.');
    process.exitCode = 1;
  } else {
    console.log('RESULTADO: smoke test OK.');
  }
}

main().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
