/**
 * Mede o "orcamento de tokens" (bytes transferidos) do app em execucao.
 *
 * Uso: node tools/budget.cjs [baseUrl]
 *   baseUrl padrao: http://127.0.0.1:3001
 *
 * Conta HTML + JS + CSS que um navegador MODERNO baixa de fato:
 *  - ignora <script nomodule> (polyfills legados)
 *  - considera apenas <link rel="stylesheet"> para CSS
 * O orcamento e checado em bytes gzip (transferencia real), com o tamanho
 * sem compressao apenas como referencia. Sai com codigo 1 se estourar.
 */
const http = require('node:http');

const BASE = process.argv[2] || process.env.BUDGET_BASE || 'http://127.0.0.1:3001';

const ROTAS = [
  // Limites calibrados no Next 15 (payload RSC maior que no 14).
  // 19 KB: landing com as 5 clausulas legais + busca no HTML.
  { rota: '/', limiteHtml: 19 * 1024, limiteJs: 115 * 1024, limiteCss: 8 * 1024 },
  // 19 KB: listagem dinamica com busca, filtros e estado de erro.
  { rota: '/listagem', limiteHtml: 19 * 1024, limiteJs: 115 * 1024, limiteCss: 8 * 1024 },
  { rota: '/cadastro', limiteHtml: 11 * 1024, limiteJs: 165 * 1024, limiteCss: 8 * 1024 },
  // Paginas legais: conteudo longo em HTML, zero JS proprio.
  { rota: '/termos', limiteHtml: 12 * 1024, limiteJs: 115 * 1024, limiteCss: 8 * 1024 },
  { rota: '/privacidade', limiteHtml: 13 * 1024, limiteJs: 115 * 1024, limiteCss: 8 * 1024 },
];

function requisitar(url, encoding) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers: { 'Accept-Encoding': encoding } }, (res) => {
      const partes = [];
      res.on('data', (p) => partes.push(p));
      res.on('end', () => {
        const buffer = Buffer.concat(partes);
        resolve({
          status: res.statusCode,
          bytes: buffer.length,
          corpo: encoding === 'identity' ? buffer.toString('utf8') : null,
          encoding: res.headers['content-encoding'] || 'identity',
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

const kb = (bytes) => (bytes / 1024).toFixed(1) + ' KB';

/** Extrai assets que um navegador moderno carrega a partir do HTML. */
function extrairAssets(html) {
  const assets = new Set();

  for (const m of html.matchAll(/<script\b[^>]*>/gi)) {
    const tag = m[0];
    if (/nomodule/i.test(tag)) continue;
    const src = tag.match(/\bsrc="(\/_next\/static\/[^"]+)"/);
    if (src) assets.add(src[1]);
  }

  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel="stylesheet"/i.test(tag)) continue;
    const href = tag.match(/\bhref="(\/_next\/static\/[^"]+)"/);
    if (href) assets.add(href[1]);
  }

  return assets;
}

async function medirRota(config) {
  const url = BASE + config.rota;
  const html = await requisitar(url, 'identity');
  if (html.status !== 200) throw new Error(`${config.rota} respondeu ${html.status}`);
  const htmlGzip = await requisitar(url, 'gzip');

  const assets = extrairAssets(html.corpo);
  const somas = { js: 0, jsGzip: 0, css: 0, cssGzip: 0 };

  for (const asset of assets) {
    const raw = await requisitar(BASE + asset, 'identity');
    const gz = await requisitar(BASE + asset, 'gzip');
    if (asset.endsWith('.js')) {
      somas.js += raw.bytes;
      somas.jsGzip += gz.bytes;
    } else if (asset.endsWith('.css')) {
      somas.css += raw.bytes;
      somas.cssGzip += gz.bytes;
    }
  }

  const estouros = [];
  if (htmlGzip.bytes > config.limiteHtml) {
    estouros.push(`HTML gzip ${kb(htmlGzip.bytes)} > ${kb(config.limiteHtml)}`);
  }
  if (somas.jsGzip > config.limiteJs) {
    estouros.push(`JS gzip ${kb(somas.jsGzip)} > ${kb(config.limiteJs)}`);
  }
  if (somas.cssGzip > config.limiteCss) {
    estouros.push(`CSS gzip ${kb(somas.cssGzip)} > ${kb(config.limiteCss)}`);
  }

  return {
    rota: config.rota,
    html: html.bytes,
    htmlGzip: htmlGzip.bytes,
    ...somas,
    totalGzip: htmlGzip.bytes + somas.jsGzip + somas.cssGzip,
    assets: assets.size,
    estouros,
  };
}

(async () => {
  console.log(`Orcamento de payload (gzip, navegador moderno) — ${BASE}\n`);

  const resultados = [];
  for (const config of ROTAS) resultados.push(await medirRota(config));

  console.log('rota\tHTML\tgzHTML\tJS\tgzJS\tCSS\tgzCSS\tgzTotal\tassets');
  for (const r of resultados) {
    console.log(
      [
        r.rota,
        kb(r.html),
        kb(r.htmlGzip),
        kb(r.js),
        kb(r.jsGzip),
        kb(r.css),
        kb(r.cssGzip),
        kb(r.totalGzip),
        r.assets,
      ].join('\t'),
    );
  }

  const estouros = resultados.flatMap((r) => r.estouros.map((e) => `${r.rota}: ${e}`));
  console.log('');
  if (estouros.length > 0) {
    console.log('ESTOUROU O ORCAMENTO:');
    for (const e of estouros) console.log(' - ' + e);
    process.exitCode = 1;
  } else {
    console.log('Dentro do orcamento em todas as rotas.');
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});


