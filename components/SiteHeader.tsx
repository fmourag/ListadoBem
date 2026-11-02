import Link from 'next/link';
import { PlusCircle, Store } from 'lucide-react';

import { LogoRedeApoio } from './LogoRedeApoio';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-marinho-800/40 bg-marinho-950/95 text-white backdrop-blur">
      <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3 sm:gap-3 sm:py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-300 sm:gap-3"
          aria-label="Rede de Apoio — página inicial"
        >
          <LogoRedeApoio
            id="header"
            className="h-10 w-10 drop-shadow-sm sm:h-12 sm:w-12"
          />
          <span className="leading-tight">
            <span className="block text-[15px] font-black uppercase tracking-wide text-ouro-300 sm:text-lg">
              Rede de Apoio
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-marinho-200 sm:text-[13px]">
              Diretório de quem foi boicotado
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap items-center gap-1 sm:gap-2.5"
        >
          <Link
            href="/listagem"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-marinho-100 transition hover:bg-marinho-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-300 sm:px-3.5 sm:py-2.5 sm:text-[15px]"
          >
            <Store aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            Ver estabelecimentos
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ouro-400 px-3 py-2 text-[13px] font-bold text-marinho-950 transition hover:bg-ouro-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-200 sm:px-4 sm:py-2.5 sm:text-[15px]"
          >
            <PlusCircle aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            Quero me cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
