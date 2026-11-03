import { TrendingUp } from 'lucide-react';

import { ROTULO_STATUS, STATUS, type Status } from '@/lib/dashboard';

export function DistribuicaoStatus({
  porStatus,
  total,
}: {
  porStatus: Record<Status, number>;
  total: number;
}) {
  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
        <TrendingUp aria-hidden="true" className="h-4 w-4 text-marinho-500" />
        Distribuição por status
      </h2>
      <div className="mt-4 space-y-4">
        {STATUS.map((status) => {
          const valor = porStatus[status];
          const percentual = total > 0 ? (valor / total) * 100 : 0;
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-marinho-800">{ROTULO_STATUS[status]}</span>
                <span className="font-black text-marinho-950">
                  {new Intl.NumberFormat('pt-BR').format(valor)}{' '}
                  <span className="text-xs font-semibold text-marinho-400">
                    ({percentual.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-marinho-100">
                <div
                  className={
                    status === 'aprovado'
                      ? 'h-full bg-esmeralda-500'
                      : status === 'pendente'
                        ? 'h-full bg-ouro-500'
                        : status === 'rejeitado'
                          ? 'h-full bg-perigo-500'
                          : 'h-full bg-marinho-400'
                  }
                  style={{ width: `${Math.max(percentual, valor > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
