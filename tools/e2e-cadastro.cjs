/**
 * E2E do formulário completo (4 etapas) no navegador.
 *
 * Pre-requisito: app rodando em http://localhost:3001
 * Uso: node tools/e2e-cadastro.cjs
 *
 * Preenche a UI de verdade, envia, confere a tela de protocolo e apaga o
 * cadastro de teste (status pendente) via service role.
 */
const { readFile } = require('node:fs/promises');
const { createRequire } = require('node:module');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:3001';
const EMAIL_TESTE = 'formulario@example.com';

const req = createRequire(path.join(RAIZ, 'package.json'));
const { createClient } = req('@supabase/supabase-js');
const { chromium } = require('playwright');

function pegar(texto, nome) {
  const m = texto.match(new RegExp(`^[ \\t]*${nome}[ \\t]*=[ \\t]*([^\\r\\n]*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

(async () => {
  const env = await readFile(path.join(RAIZ, '.env.local'), 'utf8');
  const admin = createClient(pegar(env, 'NEXT_PUBLIC_SUPABASE_URL'), pegar(env, 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const navegador = await chromium.launch({ headless: true });
  const pagina = await navegador.newPage();
  const falhas = [];
  const ok = (m) => console.log('PASS  ' + m);
  const falha = (m) => {
    console.log('FAIL  ' + m);
    falhas.push(m);
  };

  try {
    await pagina.goto(`${BASE}/cadastro`, { waitUntil: 'domcontentloaded' });

    // Etapa 1
    await pagina.fill('#nome_completo', 'Teste Formulario da Silva');
    await pagina.fill('#nome_publico', 'Padaria Formulario E2E');
    await pagina.fill('#email', EMAIL_TESTE);
    await pagina.getByRole('button', { name: 'Continuar' }).click();

    const etapa2 = pagina.getByRole('heading', { name: 'Atividade e endereço' });
    (await etapa2.count()) === 1 ? ok('etapa 1 valida e avanca') : falha('nao avancou da etapa 1');

    // Etapa 2
    await pagina.fill(
      '#descricao_atividade',
      'Padaria artesanal de teste com fermentacao natural e mais de quarenta caracteres.',
    );
    await pagina.fill(
      '#situacao_boicote',
      'Situacao ficticia de boicote criada para o teste automatizado do formulario completo.',
    );
    await pagina.fill('#cep', '01001-000');
    await pagina.fill('#logradouro', 'Rua do Teste');
    await pagina.fill('#numero', '123');
    await pagina.fill('#bairro', 'Centro');
    await pagina.fill('#cidade', 'Sao Paulo');
    await pagina.getByRole('button', { name: 'Continuar' }).click();

    const etapa3 = pagina.getByRole('heading', { name: 'Referências públicas' });
    (await etapa3.count()) === 1 ? ok('etapa 2 valida e avanca') : falha('nao avancou da etapa 2');

    // Etapa 3 — uma referencia
    await pagina.fill('#referencias\\.0\\.nome_fonte', 'Jornal do Teste');
    await pagina.fill('#referencias\\.0\\.link_referencia', 'https://exemplo.com/materia-form');
    await pagina.fill('#referencias\\.0\\.titulo_referencia', 'Materia de teste sobre o boicote');
    await pagina.getByRole('button', { name: 'Continuar' }).click();

    const etapa4 = pagina.getByRole('heading', { name: 'Revisão e envio' });
    (await etapa4.count()) === 1 ? ok('etapa 3 valida e avanca') : falha('nao avancou da etapa 3');

    // Etapa 4
    await pagina.locator('input[name="aceite_termos"]').check();
    await pagina.locator('input[name="aceite_aviso_nao_transferencia"]').check();
    await pagina.getByRole('button', { name: 'Enviar cadastro para análise' }).click();

    const protocolo = pagina.getByRole('heading', { name: 'Cadastro recebido. Obrigado!' });
    await protocolo.waitFor({ timeout: 20000 }).catch(() => {});
    (await protocolo.count()) === 1 ? ok('envio conclui com protocolo') : falha('envio nao concluiu');

    const { data } = await admin
      .from('cadastros_boicote')
      .select('id, status, referencias_publicas(id)')
      .eq('email', EMAIL_TESTE)
      .maybeSingle();

    data?.status === 'pendente' ? ok('cadastro salvo como pendente') : falha('status inesperado');
    (data?.referencias_publicas?.length ?? 0) === 1
      ? ok('uma referencia gravada')
      : falha('referencias nao gravadas');

    if (data?.id) {
      await admin.from('cadastros_boicote').delete().eq('id', data.id);
      ok('dados de teste removidos');
    }
  } finally {
    await navegador.close();
    if (falhas.length > 0) {
      const { data } = await admin.from('cadastros_boicote').select('id').eq('email', EMAIL_TESTE);
      for (const linha of data ?? []) await admin.from('cadastros_boicote').delete().eq('id', linha.id);
      console.log(`\nRESULTADO: ${falhas.length} falha(s).`);
      process.exitCode = 1;
    } else {
      console.log('\nRESULTADO: formulario completo OK.');
    }
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});


