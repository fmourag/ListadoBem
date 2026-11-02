/**
 * Testes de seguranca do Lista do Bem (HTTP + navegador).
 *
 * Pre-requisitos: app em http://127.0.0.1:3001 e .env.local com as chaves.
 * Uso: node tools/security-check.cjs
 *
 * Rode com servidor recem-iniciado e por ultimo: o teste de forca bruta
 * bloqueia o IP por 15 min (throttle real do login).
 *
 * Nao cria cadastros: usa apenas leituras, payloads invalidos e login.
 */
const { readFile } = require('node:fs/promises');
const { createHmac } = require('node:crypto');
const path = require('node:path');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const BASE = process.env.SEC_BASE || 'http://127.0.0.1:3001';

let falhas = 0;
let passes = 0;

function ok(msg) {
  passes += 1;
  console.log('PASS  ' + msg);
}
function falha(msg) {
  falhas += 1;
  console.log('FAIL  ' + msg);
}

function lerEnv(texto) {
  const mapa = {};
  for (const linha of texto.split(/\r?\n/)) {
    const i = linha.indexOf('=');
    if (i < 0 || !/^[A-Z_]+$/.test(linha.slice(0, i))) continue;
    mapa[linha.slice(0, i)] = linha
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return mapa;
}

async function headers(caminho) {
  const resposta = await fetch(BASE + caminho, { redirect: 'manual' });
  return { resposta, headers: resposta.headers, corpo: await resposta.text() };
}

(async () => {
  const env = lerEnv(await readFile(path.join(RAIZ, '.env.local'), 'utf8'));
  const senha = env.ADMIN_SECRET;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Headers de seguranca
  for (const rota of ['/', '/admin/moderacao', '/apoie/qr']) {
    const { headers: h } = await headers(rota);
    const csp = h.get('content-security-policy') ?? '';
    if (csp.includes("frame-ancestors 'none'")) ok(`${rota}: CSP frame-ancestors 'none'`);
    else falha(`${rota}: CSP ausente/incorreta`);

    for (const [nome, esperado] of [
      ['x-content-type-options', 'nosniff'],
      ['x-frame-options', 'DENY'],
    ]) {
      h.get(nome) === esperado
        ? ok(`${rota}: ${nome}=${esperado}`)
        : falha(`${rota}: ${nome}=${h.get(nome)}`);
    }
    if ((h.get('strict-transport-security') ?? '').includes('max-age=')) {
      ok(`${rota}: HSTS presente`);
    } else {
      falha(`${rota}: HSTS ausente`);
    }
    if (h.get('x-powered-by') === null) ok(`${rota}: sem X-Powered-By`);
    else falha(`${rota}: X-Powered-By exposto`);
  }

  // 2. XSS refletido na busca
  {
    const alvo = encodeURIComponent('<script>alert(1)</script>');
    const { corpo } = await headers(`/listagem?q=${alvo}`);
    if (corpo.includes('<script>alert(1)</script>')) {
      falha('busca refletiu <script> sem escapar');
    } else if (corpo.includes('&lt;script&gt;')) {
      ok('busca escapa HTML refletido');
    } else {
      ok('busca nao reflete HTML bruto');
    }
  }

  // 3. API: metodos, JSON invalido, corpo grande e validacao
  {
    const get = await fetch(BASE + '/api/cadastro');
    get.status === 405 ? ok('GET /api/cadastro -> 405') : falha(`GET API -> ${get.status}`);

    const invalido = await fetch(BASE + '/api/cadastro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{quebrado',
    });
    invalido.status === 400 ? ok('JSON invalido -> 400') : falha(`JSON invalido -> ${invalido.status}`);

    const grande = await fetch(BASE + '/api/cadastro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"x":"' + 'a'.repeat(220000) + '"}',
    }).catch((erro) => ({ status: erro.message }));
    grande.status === 413 ? ok('corpo > 200 KB -> 413') : falha(`corpo grande -> ${grande.status}`);

    const vazio = await fetch(BASE + '/api/cadastro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    vazio.status === 422 ? ok('payload incompleto -> 422') : falha(`payload vazio -> ${vazio.status}`);
  }

  // 4. RLS com a chave anon
  if (supabaseUrl && anon) {
    const cab = { apikey: anon, Authorization: `Bearer ${anon}` };
    const pendentes = await fetch(
      `${supabaseUrl}/rest/v1/cadastros_boicote?select=id&status=eq.pendente&limit=5`,
      { headers: cab },
    );
    const lista = pendentes.ok ? await pendentes.json() : null;
    Array.isArray(lista) && lista.length === 0
      ? ok('anon nao enxerga cadastros pendentes')
      : falha('anon enxergou pendentes (RLS)');

    const patch = await fetch(
      `${supabaseUrl}/rest/v1/cadastros_boicote?id=eq.00000000-0000-0000-0000-000000000000`,
      {
        method: 'PATCH',
        headers: { ...cab, 'content-type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'aprovado' }),
      },
    );
    patch.status === 401 || patch.status === 403
      ? ok('anon nao atualiza cadastros (RLS)')
      : falha(`PATCH anon -> ${patch.status} (esperado 401/403)`);
  } else {
    console.log('SKIP  RLS: Supabase nao configurado no .env.local');
  }

  if (!senha) {
    console.log('SKIP  autenticacao: ADMIN_SECRET ausente');
  } else {
    const navegador = await chromium.launch({ headless: true });

    // 5. Login valido + flags do cookie
    {
      const contexto = await navegador.newContext();
      const pagina = await contexto.newPage();
      await pagina.goto(`${BASE}/admin/moderacao`, { waitUntil: 'networkidle' });
      await pagina.fill('#senha', senha);
      await pagina.getByRole('button', { name: 'Acessar Painel' }).click();
      await pagina
        .getByRole('heading', { name: 'Moderação de cadastros' })
        .waitFor({ timeout: 20000 });

      const cookie = (await contexto.cookies()).find((c) => c.name === 'admin_session');
      if (!cookie) {
        falha('cookie de sessao ausente');
      } else {
        const flags =
          cookie.httpOnly && cookie.secure && cookie.sameSite === 'Strict' && cookie.path === '/';
        flags ? ok('cookie HttpOnly/Secure/SameSite=Strict') : falha('flags do cookie incorretas');
        /^\d{1,12}\.[0-9a-f]{64}$/.test(cookie.value)
          ? ok('token no formato timestamp.assinatura')
          : falha('token sem timestamp/assinatura');
      }
      await contexto.close();
    }

    // 6. Token forjado e token expirado devem ser recusados
    const forjar = (timestamp) =>
      `${timestamp}.${createHmac('sha256', senha)
        .update(`listado-bem:admin-session:v1:${timestamp}`)
        .digest('hex')}`;
    const agora = Math.floor(Date.now() / 1000);

    for (const [rotulo, token] of [
      ['token forjado', `${agora}.${'a'.repeat(64)}`],
      ['token expirado', forjar(agora - 7200)],
    ]) {
      const contexto = await navegador.newContext({
        extraHTTPHeaders: { cookie: `admin_session=${token}` },
      });
      const pagina = await contexto.newPage();
      await pagina.goto(`${BASE}/admin/moderacao`, { waitUntil: 'domcontentloaded' });
      (await pagina.locator('#senha').count()) === 1
        ? ok(`${rotulo} recusado`)
        : falha(`${rotulo} aceito`);
      await contexto.close();
    }

    // 7. Forca bruta: 6a tentativa deve ser bloqueada
    {
      const contexto = await navegador.newContext();
      const pagina = await contexto.newPage();
      let mensagem = '';
      for (let i = 0; i < 6; i += 1) {
        await pagina.goto(`${BASE}/admin/moderacao`, { waitUntil: 'domcontentloaded' });
        await pagina.fill('#senha', 'senha-errada');
        await pagina.getByRole('button', { name: 'Acessar Painel' }).click();
        await pagina.waitForURL(/erro=(credenciais|limite)/, { timeout: 20000 });
        await pagina.waitForFunction(
          () =>
            document.body.innerText.includes('Credenciais inválidas') ||
            document.body.innerText.includes('Muitas tentativas'),
          { timeout: 20000 },
        );
        mensagem = await pagina.locator('body').innerText();
      }
      mensagem.includes('Muitas tentativas de login')
        ? ok('forca bruta bloqueada apos 5 falhas')
        : falha('login nao bloqueou forca bruta');
      await contexto.close();
    }

    await navegador.close();
  }

  console.log(`\n${passes} PASS · ${falhas} FAIL`);
  if (falhas > 0) {
    console.log('RESULTADO: seguranca FALHOU.');
    process.exitCode = 1;
  } else {
    console.log('RESULTADO: seguranca OK.');
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
