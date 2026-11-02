import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, MapPin, Search, SearchX, Store } from 'lucide-react';

import { AvisoNaoTransferencia } from '@/components/AvisoNaoTransferencia';
import { CardEstabelecimento } from '@/components/CardEstabelecimento';
import { CATEGORIAS, NOME_UF, UFS } from '@/lib/constants';
import { formatarCategoria } from '@/lib/format';
import { criarSupabaseServer, supabaseConfigurado } from '@/lib/supabase';
import type { EstabelecimentoListado } from '@/lib/tipos';

export const metadata: Metadata = {
  title: 'Estabelecimentos verificados',
  description:
    'Lista pública de comerciantes, prestadores de serviço, artesãos e figuras públicas com cadastro aprovado na Lista do Bem, com referências públicas verificáveis.',
};

/** A listagem é sempre dinâmica: nada é pré-renderizado sem consultar o RLS. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;
/** Garante que a consulta ao Supabase nunca venha do Data Cache do Next. */
export const fetchCache = 'force-no-store';

interface ListagemPageProps {
  searchParams?: Promise<{ categoria?: string; estado?: string; q?: string | string[] }>;
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Busca textual em nome, cidade, descrição e referências públicas. */
function combinaBusca(estabelecimento: EstabelecimentoListado, alvo: string): boolean {
  const partes = [
    estabelecimento.nome_publico,
    estabelecimento.descricao_atividade,
    estabelecimento.situacao_boicote ?? '',
    estabelecimento.endereco?.cidade ?? '',
    estabelecimento.endereco?.estado ?? '',
    ...(estabelecimento.referencias_publicas ?? []).flatMap((referencia) => [
      referencia.nome_fonte,
      referencia.titulo_referencia,
    ]),
  ];
  return normalizar(partes.join(' ')).includes(alvo);
}

const CONSULTA_PUBLICA = `
  id,
  nome_publico,
  tipo_cadastro,
  categoria,
  descricao_atividade,
  endereco,
  situacao_boicote,
  criado_em,
  referencias_publicas (
    id,
    tipo_fonte,
    nome_fonte,
    link_referencia,
    titulo_referencia,
    data_publicacao
  )
`;

export default async function ListagemPage({ searchParams }: ListagemPageProps) {
  const params = (await searchParams) ?? {};

  const categoriaSelecionada = CATEGORIAS.some(
    (categoria) => categoria.valor === params.categoria,
  )
    ? params.categoria
    : undefined;

  const estadoSelecionado = UFS.includes(params.estado as (typeof UFS)[number])
    ? params.estado
    : undefined;

  const qBruto = params.q;
  const termoBusca = (Array.isArray(qBruto) ? qBruto[0] : qBruto ?? '').trim().slice(0, 80);
  const buscaAtiva = termoBusca.length >= 2;
  const alvoBusca = buscaAtiva ? normalizar(termoBusca) : '';

  let estabelecimentos: EstabelecimentoListado[] = [];
  let erroConsulta: string | null = null;

  if (supabaseConfigurado()) {
    try {
      const supabase = criarSupabaseServer();

      let consulta = supabase
        .from('cadastros_boicote')
        .select(CONSULTA_PUBLICA)
        .eq('status', 'aprovado')
        .order('criado_em', { ascending: false })
        .limit(buscaAtiva ? 200 : 60);

      if (categoriaSelecionada) {
        consulta = consulta.eq('categoria', categoriaSelecionada);
      }

      if (estadoSelecionado) {
        consulta = consulta.eq('endereco->>estado', estadoSelecionado);
      }

      const { data, error } = await consulta;

      if (error) {
        erroConsulta = error.message;
      } else {
        estabelecimentos = (data ?? []) as unknown as EstabelecimentoListado[];
        if (buscaAtiva) {
          estabelecimentos = estabelecimentos
            .filter((estabelecimento) => combinaBusca(estabelecimento, alvoBusca))
            .slice(0, 60);
        }
      }
    } catch (erro) {
      erroConsulta = erro instanceof Error ? erro.message : 'Erro ao consultar o diretório.';
    }
  }

  const temFiltro = Boolean(categoriaSelecionada || estadoSelecionado || buscaAtiva);

  return (
    <>
      <AvisoNaoTransferencia variante="barra" />

      <div className="container-page py-10 sm:py-12">
        <header className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
            Diretório público
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-marinho-950 sm:text-4xl">
            Estabelecimentos verificados
          </h1>
          <p className="mt-3 text-base leading-relaxed text-marinho-600">
            Apenas cadastros <strong>aprovados</strong> aparecem aqui — todos com no mínimo duas
            referências públicas. Contato e pagamento acontecem direto com cada negócio.
          </p>
        </header>

        {!supabaseConfigurado() ? (
          <div role="alert" className="mt-6 rounded-xl border border-ouro-300 bg-ouro-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-marinho-950">
              <AlertTriangle aria-hidden="true" className="h-4 w-4 text-ouro-700" />
              Diretório ainda não conectado ao Supabase
            </p>
            <p className="mt-1 text-sm leading-relaxed text-marinho-700">
              Configure <code className="rounded bg-white px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
              <code className="rounded bg-white px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> em{' '}
              <code className="rounded bg-white px-1 py-0.5">.env.local</code> para exibir os
              cadastros aprovados.
            </p>
          </div>
        ) : null}

        {erroConsulta ? (
          <div role="alert" className="mt-6 rounded-xl border border-perigo-200 bg-perigo-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-perigo-800">
              <AlertTriangle aria-hidden="true" className="h-4 w-4" />
              Não foi possível carregar a listagem agora
            </p>
            <p className="mt-1 text-sm leading-relaxed text-perigo-700">
              Tente atualizar a página em instantes. Detalhe técnico: {erroConsulta}
            </p>
          </div>
        ) : null}

        {/* Filtros: formulário GET nativo — funciona sem JavaScript no cliente. */}
        <form
          method="get"
          action="/listagem"
          className="card mt-6 grid gap-3 p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end"
          aria-label="Buscar e filtrar estabelecimentos"
        >
          <div>
            <label htmlFor="busca" className="label">
              Buscar
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marinho-400"
              />
              <input
                id="busca"
                name="q"
                type="search"
                maxLength={80}
                defaultValue={termoBusca}
                placeholder="Nome, cidade ou referência"
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filtro-categoria" className="label">
              Categoria
            </label>
            <select
              id="filtro-categoria"
              name="categoria"
              className="input"
              defaultValue={categoriaSelecionada ?? ''}
            >
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.valor} value={categoria.valor}>
                  {categoria.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-estado" className="label">
              Estado
            </label>
            <select
              id="filtro-estado"
              name="estado"
              className="input"
              defaultValue={estadoSelecionado ?? ''}
            >
              <option value="">Todos os estados</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf} — {NOME_UF[uf]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primario">
              Filtrar
            </button>
            <Link href="/listagem" className="btn-secundario">
              Limpar
            </Link>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-marinho-600" aria-live="polite">
            {estabelecimentos.length}{' '}
            {estabelecimentos.length === 1
              ? 'estabelecimento encontrado'
              : 'estabelecimentos encontrados'}
            {temFiltro ? ' com a busca/filtros atuais' : ''}
          </p>
          {temFiltro ? (
            <p className="text-xs font-semibold text-marinho-500">
              {[
                termoBusca ? `“${termoBusca}”` : null,
                categoriaSelecionada ? formatarCategoria(categoriaSelecionada) : null,
                estadoSelecionado ? estadoSelecionado : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
        </div>

        {estabelecimentos.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {estabelecimentos.map((estabelecimento) => (
              <li key={estabelecimento.id} className="h-full">
                <CardEstabelecimento estabelecimento={estabelecimento} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mt-4 flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marinho-50">
              {temFiltro ? (
                <SearchX aria-hidden="true" className="h-6 w-6 text-marinho-500" />
              ) : (
                <Store aria-hidden="true" className="h-6 w-6 text-marinho-500" />
              )}
            </span>
            <h2 className="text-lg font-bold text-marinho-950">
              {temFiltro
                ? 'Nenhum estabelecimento com esses filtros'
                : 'Ainda não há estabelecimentos aprovados'}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-marinho-600">
              {temFiltro
                ? 'Tente outro termo, categoria ou estado — ou limpe a busca para ver o diretório completo.'
                : 'Seja um dos primeiros: cadastre seu negócio com duas referências públicas e ajude a formar a rede.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {temFiltro ? (
                <Link href="/listagem" className="btn-secundario">
                  Limpar filtros
                </Link>
              ) : null}
              <Link href="/cadastro" className="btn-primario">
                Quero cadastrar
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
              <MapPin aria-hidden="true" className="h-5 w-5 text-marinho-500" />
              Como usar o diretório com segurança
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-marinho-700">
              <li className="flex gap-2">
                <span className="font-bold text-esmeralda-700">1.</span>
                Abra as referências públicas e confirme o contexto do boicote.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-esmeralda-700">2.</span>
                Use apenas os canais oficiais divulgados pelo próprio estabelecimento.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-esmeralda-700">3.</span>
                Combine e pague direto com ele, como faria sem a plataforma.
              </li>
            </ol>
          </div>
          <AvisoNaoTransferencia variante="destaque" />
        </div>
      </div>
    </>
  );
}


