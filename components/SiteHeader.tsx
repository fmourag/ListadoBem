import Link from 'next/link';
import { HandHeart, PlusCircle, Store } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-marinho-800/40 bg-marinho-950/95 text-white backdrop-blur">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-300"
          aria-label="Rede de Apoio — página inicial"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-esmeralda-600">
            <HandHeart aria-hidden="true" className="h-5 w-5 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black uppercase tracking-wide text-ouro-300">
              Rede de Apoio
            </span>
            <span className="block text-[11px] font-medium text-marinho-200">
              Diretório de quem foi boicotado
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link
            href="/listagem"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-marinho-100 transition hover:bg-marinho-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-300"
          >
            <Store aria-hidden="true" className="h-4 w-4" />
            Ver estabelecimentos
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ouro-400 px-3 py-2 text-sm font-bold text-marinho-950 transition hover:bg-ouro-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ouro-200"
          >
            <PlusCircle aria-hidden="true" className="h-4 w-4" />
            Quero me cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
