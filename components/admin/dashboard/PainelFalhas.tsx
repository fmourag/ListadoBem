import { AlertTriangle } from 'lucide-react';

import { formatarDataHora } from '@/lib/format';
import type { EventoResumo } from '@/lib/dashboard';

export function PainelFalhas({
  eventosDisponiveis,
  falhas,
}: {
  eventosDisponiveis: boolean;
  falhas: EventoResumo[];
}) {
  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
        <AlertTriangle aria-hidden="true" className="h-4 w-4 text-perigo-600" />
        Falhas recentes
      </h2>
      {!eventosDisponiveis ? (
        <p className="mt-2 text-xs leading-relaxed text-ouro-800">
          Rode <code className="rounded bg-ouro-50 px-1">supabase-migration-dashboard.sql</code>{' '}
          para ativar o registro de acessos e falhas.
        </p>
      ) : falhas.length === 0 ? (
        <p className="mt-2 text-sm text-marinho-500">Nenhuma falha registrada em 30 dias.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {falhas.map((falha, indice) => (
            <li key={`${falha.criado_em}-${indice}`} className="rounded-lg bg-perigo-50 p-2 text-xs">
              <p className="font-bold text-perigo-800">{falha.status ?? 'falha'}</p>
              <p className="text-marinho-600">
                {falha.rota ?? '—'} · {formatarDataHora(falha.criado_em) ?? '—'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
