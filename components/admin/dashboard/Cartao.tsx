import type { LucideIcon } from 'lucide-react';

export function Cartao({
  titulo,
  valor,
  detalhe,
  icone: Icone,
  tom = 'marinho',
}: {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: LucideIcon;
  tom?: 'marinho' | 'esmeralda' | 'ouro' | 'perigo';
}) {
  const tons = {
    marinho: 'bg-marinho-100 text-marinho-700',
    esmeralda: 'bg-esmeralda-100 text-esmeralda-800',
    ouro: 'bg-ouro-100 text-ouro-800',
    perigo: 'bg-perigo-100 text-perigo-800',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-marinho-500">{titulo}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-marinho-950">{valor}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tons[tom]}`}>
          <Icone aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-marinho-500">{detalhe}</p>
    </div>
  );
}
