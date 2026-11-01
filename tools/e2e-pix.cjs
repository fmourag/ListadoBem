/**
 * E2E do fluxo de contribuição facultativa PIX.
 *
 * Pre-requisito: app rodando em http://localhost:3001
 * Uso: node tools/e2e-pix.cjs
 */
const { chromium } = require('playwright');

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:3001';
const CHAVE = '(21) 97194-3298';

/** CRC16-CCITT independente, para conferir o payload sem confiar no app. */
function crc16(dados) {
  let crc = 0xffff;
  for (let i = 0; i < dados.length; i += 1) {
    crc ^= dados.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Lê os tags TLV de primeiro nível. */
function tagsTlv(payload) {
  const tags = [];
  let i = 0;
  while (i + 4 <= payload.length) {
    const id = payload.slice(i, i + 2);
    const tamanho = Number.parseInt(payload.slice(i + 2, i + 4), 10);
    if (Number.isNaN(tamanho)) break;
    tags.push(id);
    i += 4 + tamanho;
  }
  return tags;
}

(async () => {
  const navegador = await chromium.launch({ headless: true });
  const contexto = await navegador.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const pagina = await contexto.newPage();
  const falhas = [];
  const ok = (m) => console.log('PASS  ' + m);
  const falha = (m) => {
    console.log('FAIL  ' + m);
    falhas.push(m);
  };

  try {
    await pagina.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

    (await pagina.getByRole('heading', { name: 'Apoie esta iniciativa' }).count()) === 1
      ? ok('landing mostra o card de apoio')
      : falha('card de apoio ausente na landing');

    (await pagina.getByText(CHAVE).count()) >= 1
      ? ok('chave PIX exibida')
      : falha('chave PIX nao exibida');

    const qr = pagina.locator('figure img');
    (await qr.count()) === 1 ? ok('QR Code servido como imagem') : falha('QR ausente');
    await qr.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const carregou = await qr.first().evaluate((img) => img.complete && img.naturalWidth > 0);
    carregou ? ok('QR carregou de /apoie/qr') : falha('QR nao carregou');
    const caixa = await qr.first().boundingBox();
    caixa && Math.round(caixa.width) === 200 && Math.round(caixa.height) === 200
      ? ok('QR com 200x200')
      : falha(`QR com tamanho inesperado: ${JSON.stringify(caixa)}`);

    await pagina.getByRole('button', { name: 'Copiar chave' }).click();
    await pagina.getByText('Copiado!').first().waitFor({ timeout: 5000 }).catch(() => {});
    const copiado = await pagina.evaluate(() => navigator.clipboard.readText());
    copiado === CHAVE ? ok('botao copia a chave para o clipboard') : falha(`clipboard: ${copiado}`);

    await pagina.getByRole('button', { name: 'Copiar código PIX' }).click();
    const payload = await pagina.evaluate(() => navigator.clipboard.readText());

    payload.startsWith('000201') && payload.includes('br.gov.bcb.pix')
      ? ok('payload com formato BR Code')
      : falha(`payload invalido: ${payload.slice(0, 40)}`);

    payload.includes('5303986') ? ok('moeda BRL (tag 53)') : falha('moeda BRL ausente');

    const tags = tagsTlv(payload);
    tags.includes('54')
      ? falha('payload tem valor fixo (tag 54) — deveria ser livre')
      : ok('sem valor fixo: pagador escolhe a quantia');

    const corpo = payload.slice(0, -4);
    payload.slice(-4) === crc16(corpo)
      ? ok('CRC16 do payload confere')
      : falha('CRC16 invalido');

    for (const clausula of [
      'Não é pagamento por cadastro',
      'Não é transferência para estabelecimentos',
      'Não é obrigatória',
      'Não desbloqueia benefícios',
      '100% voluntária',
    ]) {
      (await pagina.getByText(new RegExp(clausula, 'i')).count()) >= 1
        ? ok(`clausula presente: ${clausula}`)
        : falha(`clausula ausente: ${clausula}`);
    }

    await pagina.goto(`${BASE}/apoie`, { waitUntil: 'domcontentloaded' });
    (await pagina.getByRole('heading', { name: 'Apoie a manutenção desta iniciativa' }).count()) === 1
      ? ok('/apoie responde com a pagina dedicada')
      : falha('/apoie nao abriu');

    (await pagina.getByRole('link', { name: 'Apoie a iniciativa' }).count()) >= 1
      ? ok('rodape tem link para /apoie')
      : falha('rodape sem link para /apoie');
  } finally {
    await navegador.close();
    if (falhas.length > 0) {
      console.log(`\nRESULTADO: ${falhas.length} falha(s).`);
      process.exitCode = 1;
    } else {
      console.log('\nRESULTADO: fluxo PIX OK.');
    }
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});

