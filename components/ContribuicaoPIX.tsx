import 'server-only';

import Link from 'next/link';
import { ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';

import { BotaoCopiarPix } from '@/components/BotaoCopiarPix';
import {
  CONTRIBUICAO_CUSTOS,
  CONTRIBUICAO_PONTOS,
  CONTRIBUICAO_SUBTITULO,
  CONTRIBUICAO_TITULO,
  PIX_BENEFICIARIO,
  PIX_CHAVE_EXIBICAO,
  PIX_CIDADE,
  PIX_PAYLOAD,
} from '@/lib/contribuicao';

interface Props {
  /** `compacta` é usada na landing; `completa` na página /apoie. */
  variante?: 'compacta' | 'completa';
}

/**
 * Card de contribuição facultativa via PIX.
 *
 * O QR é servido por `/apoie/qr` (SVG gerado no build a partir do payload
 * EMVCo em `lib/contribuicao.ts`), então o HTML não carrega a imagem inline
 * e o único JS desta árvore é o botão de copiar.
 */
export function ContribuicaoPIX({ variante = 'completa' }: Props) {
  const compacta = variante === 'compacta';

  return (
    <section
      aria-labelledby="apoio-iniciativa"
      className="rounded-2xl border border-marinho-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-esmeralda-50">
            <HeartHandshake aria-hidden="true" className="h-5 w-5 text-esmeralda-700" />
          </span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-esmeralda-700">
              Facultativo
            </p>
            <h2 id="apoio-iniciativa" className="text-xl font-black tracking-tight text-marinho-950">
              {CONTRIBUICAO_TITULO}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-marinho-600">
              {CONTRIBUICAO_SUBTITULO}
            </p>
          </div>
        </div>

        {compacta ? (
          <Link
            href="/apoie"
            className="inline-flex items-center gap-1 text-sm font-bold text-marinho-800 underline decoration-marinho-300 underline-offset-4 hover:text-marinho-950"
          >
            Entenda a contribuição
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[220px_1fr] sm:items-start">
        <figure className="mx-auto w-[216px] rounded-xl border border-marinho-100 bg-white p-2">
          <a
            href="/apoie/qr"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-esmeralda-500"
            aria-label="Abrir QR Code PIX em tamanho real"
          >
            <img
              src="/apoie/qr"
              alt="QR Code PIX para contribuição facultativa"
              width={200}
              height={200}
              loading="lazy"
              className="mx-auto h-[200px] w-[200px] max-w-none"
            />
          </a>
          <figcaption className="mt-2 text-center text-[11px] leading-snug text-marinho-500">
            Aponte a câmera do seu banco. O valor fica em aberto.
          </figcaption>
        </figure>

        <div className="space-y-3">
          <dl className="space-y-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="font-bold text-marinho-900">Chave PIX (celular):</dt>
              <dd className="select-all font-mono text-base font-semibold text-marinho-950">
                {PIX_CHAVE_EXIBICAO}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="font-bold text-marinho-900">Beneficiário:</dt>
              <dd className="text-marinho-700">
                {PIX_BENEFICIARIO} · {PIX_CIDADE}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <BotaoCopiarPix valor={PIX_CHAVE_EXIBICAO} rotulo="Copiar chave" />
            <BotaoCopiarPix
              valor={PIX_PAYLOAD}
              rotulo="Copiar código PIX"
              rotuloCopiado="Código copiado!"
            />
          </div>

          <ul className="grid gap-1.5 text-xs leading-relaxed text-marinho-700 sm:grid-cols-2">
            {CONTRIBUICAO_PONTOS.map((ponto) => (
              <li key={ponto} className="flex items-start gap-1.5">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-esmeralda-600"
                />
                <span>{ponto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {compacta ? null : (
        <div className="mt-5 rounded-xl bg-marinho-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-marinho-700">
            Para onde vai
          </p>
          <ul className="mt-2 grid gap-1 text-sm text-marinho-700 sm:grid-cols-2">
            {CONTRIBUICAO_CUSTOS.map((custo) => (
              <li key={custo}>{custo}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-marinho-500">
        O aviso de <strong>não fazer transferências financeiras</strong> continua valendo para os
        estabelecimentos cadastrados: combine e pague direto, nunca por intermediação da plataforma.
        Esta contribuição é para a manutenção do site, não para quem está listado.
      </p>
    </section>
  );
}

