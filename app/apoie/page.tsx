import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Gift, Server, ShieldCheck } from 'lucide-react';

import { ContribuicaoPIX } from '@/components/ContribuicaoPIX';
import {
  CONTRIBUICAO_CUSTOS,
  CONTRIBUICAO_PONTOS,
  PIX_CHAVE_EXIBICAO,
} from '@/lib/contribuicao';

export const metadata: Metadata = {
  title: 'Apoie a iniciativa',
  description:
    'Contribuição facultativa via PIX para manter servidor, domínio, hospedagem e desenvolvimento do diretório. Não é pagamento por cadastro nem transferência para estabelecimentos.',
};

export default function ApoiePage() {
  return (
    <div className="container-page py-10 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-marinho-600 hover:text-marinho-900"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para o início
        </Link>

        <header className="mt-4">
          <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
            Sustentabilidade
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-marinho-950 sm:text-4xl">
            Apoie a manutenção desta iniciativa
          </h1>
          <p className="mt-3 text-base leading-relaxed text-marinho-600">
            O diretório é e continuará sendo gratuito. Se ele ajuda você, uma contribuição
            facultativa de qualquer valor ajuda a pagar a infraestrutura. Nada muda no seu acesso:
            a listagem segue pública para todo mundo.
          </p>
        </header>

        <div className="mt-6">
          <ContribuicaoPIX variante="completa" />
        </div>

        <section className="mt-8" aria-labelledby="o-que-nao-e">
          <h2
            id="o-que-nao-e"
            className="flex items-center gap-2 text-lg font-bold text-marinho-950"
          >
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-esmeralda-600" />
            O que esta contribuição não é
          </h2>
          <ul className="mt-3 grid gap-2">
            {CONTRIBUICAO_PONTOS.map((ponto) => (
              <li
                key={ponto}
                className="rounded-lg border border-marinho-100 bg-white px-3 py-2 text-sm text-marinho-700"
              >
                {ponto}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-labelledby="para-onde-vai">
          <h2
            id="para-onde-vai"
            className="flex items-center gap-2 text-lg font-bold text-marinho-950"
          >
            <Server aria-hidden="true" className="h-5 w-5 text-marinho-500" />
            Para onde vai
          </h2>
          <ul className="mt-3 grid gap-2 text-sm text-marinho-700 sm:grid-cols-2">
            {CONTRIBUICAO_CUSTOS.map((custo) => (
              <li key={custo} className="rounded-lg bg-marinho-50 px-3 py-2">
                {custo}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-marinho-600">
            A chave usada é <strong>{PIX_CHAVE_EXIBICAO}</strong>. Confira sempre o beneficiário
            antes de confirmar no seu banco.
          </p>
        </section>

        <section className="mt-8 rounded-xl border border-marinho-100 bg-marinho-50/60 p-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
            <Gift aria-hidden="true" className="h-4 w-4 text-esmeralda-700" />
            Prefere ajudar de outro jeito?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-marinho-700">
            Divulgar o diretório e cadastrar seu negócio já ajudam bastante. Se você conhece alguém
            que foi boicotado, envie o link para essa pessoa se cadastrar — de graça.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/cadastro" className="btn-primario">
              Cadastrar meu negócio
            </Link>
            <Link href="/listagem" className="btn-secundario">
              Explorar o diretório
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
