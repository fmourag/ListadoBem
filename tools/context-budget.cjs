/**
 * Orcamento de CONTEXTO para agentes de IA.
 *
 * Uso: npm run context:budget
 *
 * Mede:
 *  - AGENTS.md (porta de entrada): bytes e tokens estimados (~4 chars/token)
 *  - maiores arquivos-fonte (linhas)
 *  - docs principais
 *
 * Falha (exit 1) se:
 *  - AGENTS.md passar de 6 KB ou ~1600 tokens
 *  - qualquer fonte passar de 400 linhas
 *  - README passar de 12 KB
 */
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');

const LIMITE_AGENTS_BYTES = 6 * 1024;
const LIMITE_AGENTS_TOKENS = 1600;
const LIMITE_ARQUIVO_LINHAS = 400;
const LIMITE_README_BYTES = 12 * 1024;

const PASTAS_FONTE = ['app', 'components', 'lib', 'tools'];
const EXTENSOES = new Set(['.ts', '.tsx', '.cjs']);

function listarFontes(dir) {
  const resultado = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === 'node_modules' || entrada.name === '.next') continue;
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      resultado.push(...listarFontes(completo));
    } else if (EXTENSOES.has(path.extname(entrada.name))) {
      resultado.push(completo);
    }
  }
  return resultado;
}

const rel = (p) => path.relative(RAIZ, p).replace(/\\/g, '/');

const agentsPath = path.join(RAIZ, 'AGENTS.md');
const agents = fs.readFileSync(agentsPath, 'utf8');
const agentsBytes = Buffer.byteLength(agents, 'utf8');
const agentsTokens = Math.ceil(agents.length / 4);

const fontes = PASTAS_FONTE.flatMap((pasta) => {
  const dir = path.join(RAIZ, pasta);
  return fs.existsSync(dir) ? listarFontes(dir) : [];
}).map((arquivo) => {
  const linhas = fs.readFileSync(arquivo, 'utf8').split(/\r?\n/).length;
  return { arquivo: rel(arquivo), linhas };
});

fontes.sort((a, b) => b.linhas - a.linhas);

const readmePath = path.join(RAIZ, 'README.md');
const readmeBytes = fs.existsSync(readmePath) ? fs.statSync(readmePath).size : 0;

const estouros = [];
if (agentsBytes > LIMITE_AGENTS_BYTES) estouros.push(`AGENTS.md ${agentsBytes} B > ${LIMITE_AGENTS_BYTES} B`);
if (agentsTokens > LIMITE_AGENTS_TOKENS) estouros.push(`AGENTS.md ~${agentsTokens} tokens > ${LIMITE_AGENTS_TOKENS}`);
for (const f of fontes) {
  if (f.linhas > LIMITE_ARQUIVO_LINHAS) {
    estouros.push(`${f.arquivo} ${f.linhas} linhas > ${LIMITE_ARQUIVO_LINHAS}`);
  }
}
if (readmeBytes > LIMITE_README_BYTES) estouros.push(`README.md ${readmeBytes} B > ${LIMITE_README_BYTES} B`);

console.log('Orcamento de contexto (agentes)\n');
console.log(`AGENTS.md: ${agentsBytes} B · ~${agentsTokens} tokens · ${agents.split(/\r?\n/).length} linhas`);
console.log(`README.md: ${(readmeBytes / 1024).toFixed(1)} KB`);
console.log('\nMaiores fontes (linhas):');
for (const f of fontes.slice(0, 6)) console.log(`  ${String(f.linhas).padStart(4)}  ${f.arquivo}`);
console.log(`\nFontes analisados: ${fontes.length} · total de linhas: ${fontes.reduce((s, f) => s + f.linhas, 0)}`);

console.log('');
if (estouros.length > 0) {
  console.log('ESTOUROU O ORCAMENTO:');
  for (const e of estouros) console.log(' - ' + e);
  process.exitCode = 1;
} else {
  console.log('Contexto dentro do orcamento.');
}
