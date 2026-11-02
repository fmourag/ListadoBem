/**
 * Checagem de responsividade (overflow horizontal) em larguras reais.
 *
 * Pre-requisito: app em http://127.0.0.1:3001
 * Uso: node tools/responsive-check.cjs
 */
const { chromium } = require('playwright');

const BASE = process.env.RESP_BASE || 'http://127.0.0.1:3001';
const LARGURAS = [320, 360, 390, 414, 768, 1024, 1280, 1440, 1920];
const ROTAS = ['/', '/listagem', '/cadastro', '/apoie', '/termos', '/privacidade', '/admin/moderacao'];

(async () => {
  const browser = await chromium.launch();
  const pagina = await browser.newPage();
  let falhas = 0;
  let checagens = 0;

  for (const largura of LARGURAS) {
    await pagina.setViewportSize({ width: largura, height: 900 });
    for (const rota of ROTAS) {
      checagens += 1;
      await pagina.goto(BASE + rota, { waitUntil: 'networkidle' });
      const resultado = await pagina.evaluate(() => {
        const excesso =
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
          window.innerWidth;
        const culpados = [];
        if (excesso > 1) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            if (getComputedStyle(el).position === 'fixed') continue;
            if (r.right > window.innerWidth + 1 || r.left < -1) {
              culpados.push(
                `${el.tagName.toLowerCase()} [${Math.round(r.left)}..${Math.round(r.right)}]`,
              );
            }
          }
        }
        return { excesso, culpados: culpados.slice(0, 5) };
      });

      if (resultado.excesso > 1) {
        falhas += 1;
        console.log(
          `FAIL  ${rota} @${largura}px (+${resultado.excesso}px) ${resultado.culpados.join(' | ')}`,
        );
      }
    }
  }

  await browser.close();

  if (falhas > 0) {
    console.log(`\nRESULTADO: ${falhas}/${checagens} combinacoes com overflow.`);
    process.exitCode = 1;
  } else {
    console.log(`RESULTADO: responsividade OK (${checagens} combinacoes).`);
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
