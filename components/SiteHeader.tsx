import Link from 'next/link';
import { PlusCircle, Store } from 'lucide-react';

import { fonteCursiva } from '@/lib/fonts';

import { LogoListaDoBem } from './LogoListaDoBem';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-marinho-800/40 bg-marinho-950/95 text-white backdrop-blur">
      <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3 sm:gap-4 sm:py-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-300 sm:gap-3"
          aria-label="Lista do Bem — página inicial"
        >
          <LogoListaDoBem
            id="header"
            className="h-11 w-11 shrink-0 drop-shadow-sm sm:h-14 sm:w-14"
          />
          <span className="min-w-0 leading-none">
            <span
              className={`${fonteCursiva.className} block text-[2rem] leading-[0.95] text-ouro-300 sm:text-[2.7rem]`}
            >
              Lista do Bem
            </span>
            <span className="mt-1.5 block text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-marinho-100 sm:text-[11px]">
              Proteja o Próximo da Intolerância
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap items-center gap-1 sm:gap-2.5"
        >
          <Link
            href="/listagem"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-marinho-100 transition hover:bg-marinho-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-300 max-[359px]:px-2 max-[359px]:text-xs sm:px-3.5 sm:py-2.5 sm:text-[15px]"
          >
            <Store aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            Ver estabelecimentos
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ouro-400 px-3 py-2 text-[13px] font-bold text-marinho-950 transition hover:bg-ouro-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-200 max-[359px]:px-2 max-[359px]:text-xs sm:px-4 sm:py-2.5 sm:text-[15px]"
          >
            <PlusCircle aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            Quero cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
