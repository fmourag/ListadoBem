#!/usr/bin/env node
/**
 * Busca semanal de casos de boicote político.
 *
 * Fontes: RSS de notícias do Bing (sem chave de API).
 * Saída: relatório Markdown em relatorios/busca-semanal/AAAA-MM-DD.md.
 *
 * A rotina NÃO cadastra nem publica nada: ela apenas reúne candidatos para
 * revisão humana. Nome, cidade, categoria e referência continuam sendo
 * conferidos antes de qualquer inserção no banco.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const SAIDA = path.join(RAIZ, 'relatorios', 'busca-semanal');
const JANELA_DIAS = Number(process.env.BUSCA_DIAS || 10);
const MAX_POR_CONSULTA = Number(process.env.BUSCA_MAX || 20);

const CONSULTAS = [
  '"lista de boicote" Brasil',
  '"lista de boicote" empresários',
  '"lista de boicote" comerciantes',
  '"boicote político" comerciantes',
  '"lista de boicote" profissionais',
];

const EXCLUIR =
  /\b(futebol|clube|atleta|jogo|seleção|campeonato|big brother|bbb|reality show|novela)\b/i;
const CONTEXTO =
  /\b(comerci\w*|empres\w*|profissional\w*|estabelecimento\w*|loja\w*|restaurante\w*|advogad\w*|médic\w*|dentista\w*|lista\w*|negócio\w*|negocio\w*)\b/i;

function decodificar(texto) {
  return texto
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(item, nome) {
  const m = item.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`, 'i'));
  return m ? decodificar(m[1]) : '';
}

function linkPublicador(url) {
  try {
    const u = new URL(url);
    if (/(^|\.)bing\.com$/i.test(u.hostname) && u.searchParams.get('url')) {
      return u.searchParams.get('url');
    }
    return url;
  } catch {
    return null;
  }
}

function normalizarUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    for (const chave of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|oc$)/i.test(chave)) u.searchParams.delete(chave);
    }
    return u.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

async function consultar(consulta) {
  const url =
    'https://www.bing.com/news/search?q=' +
    encodeURIComponent(consulta) +
    '&format=rss&mkt=pt-br';
  const resposta = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; ListaDoBem/1.0)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!resposta.ok) throw new Error(`RSS respondeu ${resposta.status}`);
  return resposta.text();
}

function extrair(xml, consulta) {
  const agora = Date.now();
  const limite = agora - JANELA_DIAS * 24 * 60 * 60 * 1000;
  const itens = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, MAX_POR_CONSULTA);
  const saida = [];

  for (const [, item] of itens) {
    const titulo = tag(item, 'title');
    const descricao = tag(item, 'description');
    const publicado = Date.parse(tag(item, 'pubDate'));
    const link = linkPublicador(tag(item, 'link'));
    const url = link ? normalizarUrl(link) : null;
    if (!titulo || !url || !Number.isFinite(publicado)) continue;
    if (publicado < limite || publicado > agora + 24 * 60 * 60 * 1000) continue;

    const texto = `${titulo} ${descricao}`;
    if (!/\bboicote\b/i.test(texto)) continue;
    if (EXCLUIR.test(texto) || !CONTEXTO.test(texto)) continue;

    saida.push({
      titulo,
      url,
      fonte: new URL(url).hostname.replace(/^www\./, ''),
      publicado: new Date(publicado),
      consulta,
      descricao,
    });
  }
  return saida;
}

async function referenciasExistentes() {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !chave) return new Set();
  try {
    const r = await fetch(`${base}/rest/v1/referencias_publicas?select=link_referencia`, {
      headers: {
        apikey: chave,
        Authorization: `Bearer ${chave}`,
        'User-Agent': 'curl/8.5.0',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return new Set();
    const linhas = await r.json();
    return new Set(
      linhas.map((l) => normalizarUrl(l.link_referencia)).filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

function escaparCelula(texto) {
  return String(texto).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

async function principal() {
  const vistos = new Set();
  const casos = [];
  const falhas = [];

  for (const consulta of CONSULTAS) {
    try {
      const xml = await consultar(consulta);
      for (const caso of extrair(xml, consulta)) {
        if (vistos.has(caso.url)) continue;
        vistos.add(caso.url);
        casos.push(caso);
      }
    } catch (erro) {
      falhas.push(`${consulta}: ${erro.message}`);
    }
  }

  const existentes = await referenciasExistentes();
  const novos = casos.filter((c) => !existentes.has(c.url));
  novos.sort((a, b) => b.publicado - a.publicado);

  fs.mkdirSync(SAIDA, { recursive: true });
  const hoje = new Date();
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(hoje);
  const arquivo = path.join(SAIDA, `${iso}.md`);

  const linhas = [
    `# Busca semanal — ${formatarData(hoje)}`,
    '',
    `- Consultas: ${CONSULTAS.length}`,
    `- Janela: últimos ${JANELA_DIAS} dias`,
    `- Candidatos novos: **${novos.length}**`,
    `- Já usados como referência: ${casos.length - novos.length}`,
    '',
  ];

  if (falhas.length) {
    linhas.push('## Falhas de coleta', '', ...falhas.map((f) => `- ${f}`), '');
  }

  if (novos.length === 0) {
    linhas.push('Nenhuma matéria nova atendeu aos filtros nesta semana.', '');
  } else {
    linhas.push(
      '| Data | Fonte | Título | Link | Consulta |',
      '| --- | --- | --- | --- | --- |',
      ...novos.map(
        (c) =>
          `| ${formatarData(c.publicado)} | ${escaparCelula(c.fonte)} | ${escaparCelula(
            c.titulo,
          )} | [abrir](${c.url}) | ${escaparCelula(c.consulta)} |`,
      ),
      '',
    );
  }

  linhas.push(
    '> Candidatos para revisão. Nada é cadastrado ou publicado automaticamente:',
    '> confira nome, cidade, categoria e a matéria antes de inserir no banco.',
    '',
  );

  fs.writeFileSync(arquivo, linhas.join('\n'), 'utf8');
  console.log(`Relatório: ${path.relative(RAIZ, arquivo)}`);
  console.log(`Candidatos novos: ${novos.length}`);
  if (falhas.length) console.log(`Falhas: ${falhas.length}`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `candidatos=${novos.length}\nrelatorio=${arquivo}\n`,
    );
  }
}

principal().catch((erro) => {
  console.error('Falha na busca semanal:', erro.message);
  process.exitCode = 1;
});
