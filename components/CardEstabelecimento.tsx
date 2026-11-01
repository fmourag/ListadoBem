import { BadgeCheck, ExternalLink, MapPin, ShieldAlert } from 'lucide-react';

import { dominioDoLink, formatarCategoria, formatarCidadeEstado, formatarData, formatarTipoCadastro } from '@/lib/format';
import type { EstabelecimentoListado } from '@/lib/tipos';

interface CardEstabelecimentoProps {
  estabelecimento: EstabelecimentoListado;
}

/**
 * Card público da listagem. Só recebe registros com status "aprovado"
 * (filtro aplicado na consulta e reforçado pelo RLS no Supabase).
 */
export function CardEstabelecimento({ estabelecimento }: CardEstabelecimentoProps) {
  const {
    nome_publico,
    categoria,
    tipo_cadastro,
    descricao_atividade,
    endereco,
    situacao_boicote,
    referencias_publicas,
  } = estabelecimento;

  const referencias = referencias_publicas ?? [];
  const visiveis = referencias.slice(0, 3);
  const restantes = referencias.length - visiveis.length;

  return (
    <article className="card flex h-full flex-col gap-4 p-5 transition hover:border-marinho-200 hover:shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-esmeralda-50 text-esmeralda-800 ring-1 ring-inset ring-esmeralda-200">
          {formatarCategoria(categoria)}
        </span>
        <span className="badge bg-marinho-50 text-marinho-700 ring-1 ring-inset ring-marinho-200">
          {formatarTipoCadastro(tipo_cadastro)}
        </span>
        <span
          className="badge bg-ouro-100 text-ouro-900 ring-1 ring-inset ring-ouro-300"
          title="Referências públicas verificáveis apresentadas no cadastro"
        >
          <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
          {referencias.length} {referencias.length === 1 ? 'referência' : 'referências'}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-bold leading-snug text-marinho-950">{nome_publico}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-marinho-600">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-marinho-400" />
          {formatarCidadeEstado(endereco)}
        </p>
      </div>

      <p className="line-clamp-4 text-sm leading-relaxed text-marinho-700">
        {descricao_atividade}
      </p>

      {situacao_boicote ? (
        <details className="group rounded-lg border border-marinho-100 bg-marinho-50/60 px-3 py-2">
          <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wide text-marinho-600 marker:content-none">
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
              Contexto do boicote
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">{situacao_boicote}</p>
        </details>
      ) : null}

      <div className="mt-auto space-y-2 border-t border-marinho-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-marinho-500">
          Referências públicas
        </p>
        <ul className="space-y-2">
          {visiveis.map((referencia) => (
            <li key={referencia.id}>
              <a
                href={referencia.link_referencia}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`Abrir referência em nova aba: ${referencia.titulo_referencia}`}
                className="group inline-flex items-start gap-1.5 text-sm text-marinho-700 underline decoration-marinho-200 underline-offset-2 transition hover:text-marinho-950 hover:decoration-marinho-500"
              >
                <ExternalLink
                  aria-hidden="true"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-marinho-400 group-hover:text-marinho-600"
                />
                <span className="line-clamp-2">
                  {referencia.titulo_referencia}
                  <span className="text-marinho-500">
                    {' '}
                    · {referencia.nome_fonte} · {dominioDoLink(referencia.link_referencia)}
                    {referencia.data_publicacao
                      ? ` · ${formatarData(referencia.data_publicacao) ?? referencia.data_publicacao}`
                      : ''}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        {restantes > 0 ? (
          <p className="text-xs font-medium text-marinho-500">
            + {restantes} outra{restantes > 1 ? 's' : ''} referência{restantes > 1 ? 's' : ''} no
            cadastro
          </p>
        ) : null}
      </div>

      <p className="rounded-lg bg-marinho-50 px-3 py-2 text-xs font-medium leading-relaxed text-marinho-700">
        Contato e pagamento acontecem <strong>direto com o estabelecimento</strong>. A plataforma
        não intermedeia valores nem recebe transferências.
      </p>
    </article>
  );
}
