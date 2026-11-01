/**
 * E2E das novas regras de contato (API):
 *  - CPF/CNPJ opcional
 *  - e-mail OU telefone obrigatório (pelo menos um)
 *
 * Pre-requisito: app rodando em http://localhost:3001
 * Uso: node tools/e2e-contato.cjs
 */
const { readFile } = require('node:fs/promises');
const { createRequire } = require('node:module');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:3001';

const req = createRequire(path.join(RAIZ, 'package.json'));
const { createClient } = req('@supabase/supabase-js');

function pegar(texto, nome) {
  const m = texto.match(new RegExp(`^[ \\t]*${nome}[ \\t]*=[ \\t]*([^\\r\\n]*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function payload(extra) {
  return {
    tipo_cadastro: 'acao_social',
    nome_completo: 'Teste Contato da Silva',
    nome_publico: 'Projeto Contato E2E',
    categoria: 'servicos',
    descricao_atividade:
      'Projeto social de teste com mais de quarenta caracteres para validar o cadastro.',
    endereco: {
      cep: '01001-000',
      logradouro: 'Rua Teste',
      numero: '10',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
    },
    situacao_boicote:
      'Situacao ficticia de boicote com mais de quarenta caracteres para o teste das regras.',
    referencias: [
      {
        tipo_fonte: 'jornal',
        nome_fonte: 'Jornal Teste',
        link_referencia: 'https://exemplo.com/contato-1',
        titulo_referencia: 'Materia sobre o boicote',
      },
      {
        tipo_fonte: 'blog',
        nome_fonte: 'Blog Teste',
        link_referencia: 'https://exemplo.com/contato-2',
        titulo_referencia: 'Post sobre o boicote',
      },
    ],
    aceite_termos: true,
    aceite_aviso_nao_transferencia: true,
    ...extra,
  };
}

async function postar(corpo) {
  const resposta = await fetch(`${BASE}/api/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const json = await resposta.json().catch(() => ({}));
  return { status: resposta.status, json };
}

(async () => {
  const env = await readFile(path.join(RAIZ, '.env.local'), 'utf8');
  const admin = createClient(
    pegar(env, 'NEXT_PUBLIC_SUPABASE_URL'),
    pegar(env, 'SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );

  const criados = [];
  const falhas = [];
  const ok = (m) => console.log('PASS  ' + m);
  const falha = (m) => {
    console.log('FAIL  ' + m);
    falhas.push(m);
  };

  const criar = async (rotulo, extra, statusEsperado) => {
    const { status, json } = await postar(payload(extra));
    if (status === statusEsperado) {
      ok(`${rotulo} → ${status}`);
    } else {
      falha(`${rotulo} → esperado ${statusEsperado}, veio ${status} (${json.mensagem ?? ''})`);
    }
    if (json.id) criados.push(json.id);
    return json;
  };

  try {
    await criar('somente e-mail (sem CPF, sem telefone)', { email: 'contato-email@example.com' }, 201);
    await criar('somente telefone (sem CPF, sem e-mail)', { telefone: '(11) 97777-6666' }, 201);
    await criar(
      'CPF válido + e-mail (tipo acao_social)',
      { cpf_cnpj: '111.444.777-35', email: 'contato-cpf@example.com' },
      201,
    );

    const semContato = await criar('sem e-mail e sem telefone', {}, 422);
    const erroEmail = semContato?.erros?.email?.[0] ?? '';
    erroEmail.includes('e-mail ou telefone')
      ? ok('mensagem de contato obrigatório no campo e-mail')
      : falha(`mensagem inesperada: ${erroEmail}`);

    await criar(
      'CPF inválido (opcional, mas validado quando informado)',
      { cpf_cnpj: '111.111.111-11', email: 'contato-invalido@example.com' },
      422,
    );
  } finally {
    for (const id of criados) {
      await admin.from('cadastros_boicote').delete().eq('id', id);
    }
    const { count } = await admin
      .from('cadastros_boicote')
      .select('id', { count: 'exact', head: true })
      .like('email', 'contato-%@example.com');
    console.log('cadastros de teste restantes:', count ?? 0);

    if (falhas.length > 0) {
      console.log(`\nRESULTADO: ${falhas.length} falha(s).`);
      process.exitCode = 1;
    } else {
      console.log('\nRESULTADO: regras de contato OK.');
    }
  }
})().catch((erro) => {
  console.error('FALHA:', erro.message);
  process.exitCode = 1;
});
