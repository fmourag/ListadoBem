/**
 * Valida a service role key do .env.local sem alterar dados.
 *
 * Uso: npm run check:admin   (ou node tools/test-admin.cjs)
 *
 * - le NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do .env.local
 * - conta cadastros (inclui pendentes: prova que a service role ignora o RLS)
 * - faz UPDATE em UUID inexistente (prova permissao de escrita sem tocar em linhas)
 */
const { readFile } = require('node:fs/promises');
const { createRequire } = require('node:module');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const ENV = path.join(RAIZ, '.env.local');

const req = createRequire(path.join(RAIZ, 'package.json'));
const { createClient } = req('@supabase/supabase-js');

function pegar(texto, nome) {
  const m = texto.match(new RegExp(`^[ \\t]*${nome}[ \\t]*=[ \\t]*([^\\r\\n]*)$`, 'm'));
  if (!m) return null;
  const valor = m[1].trim().replace(/^["']|["']$/g, '');
  return valor.length > 0 ? valor : null;
}

async function main() {
  const bruto = await readFile(ENV, 'utf8');
  const url = pegar(bruto, 'NEXT_PUBLIC_SUPABASE_URL');
  const chave = pegar(bruto, 'SUPABASE_SERVICE_ROLE_KEY');

  console.log('url definida: ', Boolean(url));
  console.log(
    'service role: ',
    chave ? `${chave.slice(0, 10)}... (${chave.length} chars)` : 'AUSENTE',
  );

  if (!url || !chave) {
    console.error('Preencha SUPABASE_SERVICE_ROLE_KEY em .env.local antes de rodar.');
    process.exitCode = 2;
    return;
  }

  if (!chave.startsWith('sb_secret_') && !chave.startsWith('eyJ')) {
    console.warn('Aviso: formato inesperado (use "sb_secret_..." ou o JWT "service_role").');
  }

  const admin = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const leitura = await admin
    .from('cadastros_boicote')
    .select('id, status', { count: 'exact' })
    .limit(3);

  if (leitura.error) {
    console.error('LEITURA FALHOU:', leitura.error.message);
    process.exitCode = 1;
    return;
  }
  console.log('LEITURA OK - total de cadastros (todos os status):', leitura.count);
  console.log('amostra:', JSON.stringify(leitura.data));

  const escrita = await admin
    .from('cadastros_boicote')
    .update({ status: 'pendente' })
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .select('id');

  if (escrita.error) {
    console.error('UPDATE FALHOU:', escrita.error.message);
    process.exitCode = 1;
    return;
  }

  console.log('UPDATE OK (nenhuma linha alterada; escrita confirmada).');
  console.log('Painel /admin/moderacao pronto para listar e moderar.');
}

main().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
