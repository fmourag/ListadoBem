/**
 * E2E da Content Security Policy.
 *
 * Pre-requisito: app rodando em http://localhost:3001
 * Uso: node tools/e2e-csp.cjs
 *
 * - confere o header CSP (enforce ou Report-Only) nas rotas principais
 * - confere diretivas essenciais (frame-ancestors 'none', connect-src Supabase,
 *   sem unsafe-eval em producao)
 * - navega e interage (login, formulario, QR) coletando violacoes no console
 */
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:3001';
const { chromium } = require('playwright');

const ROTAS = ['/', '/listagem', '/cadastro', '/apoie', '/termos', '/privacidade', '/admin/moderacao'];

function pegar(texto, nome) {
  const m = texto.match(new RegExp(`^[ \\t]*${nome}[ \\t]*=[ \\t]*([^\\r\\n]*)$`, 'm'));
  if (!m) return null;
  const valor = m[1].trim().replace(/^["']|["']$/g, '');
  return valor.length > 0 ? valor : null;
}

function violacao(texto) {
  return /content security policy|refused to (load|execute|connect|apply|frame)/i.test(texto);
}

(async () => {
  const env = await readFile(path.join(RAIZ, '.env.local'), 'utf8');
  const senha = pegar(env, 'ADMIN_SECRET');

  const navegador = await chromium.launch({ headless: true });
  const contexto = await navegador.newContext();
  const pagina = await contexto.newPage();

  const erros = [];
  const violacoes = [];
  pagina.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const texto = msg.text();
    erros.push(texto);
    if (violacao(texto)) violacoes.push(texto);
  });
  pagina.on('pageerror', (erro) => {
    erros.push(erro.message);
    if (violacao(erro.message)) violacoes.push(erro.message);
  });

  const falhas = [];
  const ok = (msg) => console.log('PASS  ' + msg);
  const falha = (msg) => {
    console.log('FAIL  ' + msg);
    falhas.push(msg);
  };

  try {
    for (const rota of ROTAS) {
      const resposta = await pagina.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
      const headers = resposta ? resposta.headers() : {};
      const enforce = headers['content-security-policy'];
      const report = headers['content-security-policy-report-only'];
      const valor = enforce || report;

      if (!valor) {
        falha(`${rota}: header CSP ausente`);
        continue;
      }

      const modo = enforce ? 'enforce' : 'Report-Only';
      valor.includes("frame-ancestors 'none'")
        ? ok(`${rota}: CSP ${modo} + frame-ancestors 'none'`)
        : falha(`${rota}: falta frame-ancestors 'none'`);

      if (rota === '/') {
        valor.includes('connect-src') && valor.includes('supabase.co')
          ? ok('connect-src inclui Supabase')
          : falha('connect-src sem Supabase');
        valor.includes("'unsafe-eval'")
          ? falha("CSP de producao contem 'unsafe-eval'")
          : ok("sem 'unsafe-eval' em producao");
      }
    }

    // Interacoes que exercitam hidratacao, Server Actions e assets.
    await pagina.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' });
    await pagina.fill('#nome_completo', 'Teste CSP da Silva');
    await pagina.fill('#nome_publico', 'Loja CSP');
    await pagina.fill('#email', 'csp@example.com');
    await pagina.getByRole('button', { name: 'Continuar' }).click();
    try {
      await pagina.locator('#cep').waitFor({ timeout: 10000 });
      ok('formulario hidratou e avancou sem bloqueio');
    } catch {
      falha('formulario nao respondeu');
    }

    if (senha) {
      await pagina.goto(`${BASE}/admin/moderacao`, { waitUntil: 'networkidle' });
      await pagina.fill('#senha', senha);
      await pagina.getByRole('button', { name: 'Acessar Painel' }).click();
      await pagina
        .getByRole('heading', { name: 'Moderação de cadastros' })
        .waitFor({ timeout: 20000 });
      ok('login por Server Action funcionou sob CSP');
    }

    await pagina.goto(`${BASE}/apoie`, { waitUntil: 'networkidle' });
    const qr = await pagina.request.get(`${BASE}/apoie/qr`);
    (qr.headers()['content-type'] ?? '').includes('image/svg+xml')
      ? ok('QR SVG carregado (img-src self)')
      : falha('QR nao retornou SVG');
  } finally {
    await contexto.close();
    await navegador.close();
  }

  if (violacoes.length > 0) {
    console.log('\nViolacoes de CSP:');
    for (const v of [...new Set(violacoes)]) console.log(' - ' + v);
    falhas.push(`${violacoes.length} violacao(oes) de CSP`);
  } else {
    console.log('\nPASS  nenhuma violacao de CSP no console');
  }

  if (falhas.length > 0) {
    console.log(`\nRESULTADO: ${falhas.length} falha(s).`);
    process.exitCode = 1;
  } else {
    console.log('\nRESULTADO: CSP OK.');
  }

  if (erros.length > 0) {
    console.log(`\n(console errors observados: ${erros.length})`);
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
