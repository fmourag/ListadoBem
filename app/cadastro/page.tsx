import type { Metadata } from 'next';
import { BadgeCheck, Clock3, ShieldCheck } from 'lucide-react';
import { Toaster } from 'sonner';

import { AvisoNaoTransferencia } from '@/components/AvisoNaoTransferencia';
import { FormularioCadastro } from '@/components/FormularioCadastro';

export const metadata: Metadata = {
  title: 'Cadastrar meu negócio',
  description:
    'Cadastre gratuitamente seu comércio, serviço, artesanato ou atuação pública vítima de boicote ideológico. É obrigatório apresentar pelo menos duas referências públicas verificáveis.',
};

export default function CadastroPage() {
  return (
    <>
      <AvisoNaoTransferencia variante="barra" />
      <Toaster richColors position="top-center" closeButton />

      <div className="container-page py-10 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <header>
            <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
              Cadastro gratuito
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-marinho-950 sm:text-4xl">
              Cadastre seu negócio na Lista do Bem
            </h1>
            <p className="mt-3 text-base leading-relaxed text-marinho-600">
              Preencha os quatro passos. O cadastro fica pendente até a verificação das
              referências públicas e só então aparece na listagem.
            </p>
          </header>

          <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-3">
            <li className="flex items-start gap-2 rounded-lg border border-esmeralda-100 bg-esmeralda-50 p-3 text-esmeralda-900">
              <BadgeCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>2 referências públicas obrigatórias</span>
            </li>
            <li className="flex items-start gap-2 rounded-lg border border-marinho-100 bg-marinho-50 p-3 text-marinho-800">
              <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Análise antes da publicação</span>
            </li>
            <li className="flex items-start gap-2 rounded-lg border border-ouro-200 bg-ouro-50 p-3 text-marinho-800">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Nenhum pagamento é cobrado</span>
            </li>
          </ul>

          <div className="mt-7">
            <FormularioCadastro />
          </div>

          <div className="mt-8">
            <AvisoNaoTransferencia variante="destaque" />
          </div>
        </div>
      </div>
    </>
  );
}


