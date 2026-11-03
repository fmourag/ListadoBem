import Link from 'next/link';
import { Clock3 } from 'lucide-react';

import { formatarDataHora } from '@/lib/format';
import { ROTULO_STATUS, STATUS, type CadastroResumo, type Status } from '@/lib/dashboard';

const CLASSE_STATUS: Record<Status, string> = {
  pendente: 'bg-ouro-100 text-ouro-800',
  aprovado: 'bg-esmeralda-100 text-esmeralda-800',
  rejeitado: 'bg-perigo-100 text-perigo-800',
  suspenso: 'bg-marinho-100 text-marinho-700',
};

export function TabelaRecentes({ recentes }: { recentes: CadastroResumo[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-marinho-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
          <Clock3 aria-hidden="true" className="h-4 w-4 text-marinho-500" />
          Cadastros recentes
        </h2>
        <Link href="/admin/moderacao" className="text-xs font-bold text-esmeralda-800 underline">
          Abrir moderação
        </Link>
      </div>
      {recentes.length === 0 ? (
        <p className="px-5 py-6 text-sm text-marinho-500">Nenhum cadastro registrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-marinho-50 text-xs uppercase tracking-wide text-marinho-500">
              <tr>
                <th className="px-5 py-3 font-bold">Nome público</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marinho-100">
              {recentes.map((cadastro) => {
                const status = STATUS.includes(cadastro.status as Status)
                  ? (cadastro.status as Status)
                  : 'pendente';
                return (
                  <tr key={cadastro.id}>
                    <td className="max-w-[18rem] truncate px-5 py-3 font-semibold text-marinho-900">
                      {cadastro.nome_publico}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${CLASSE_STATUS[status]}`}>
                        {ROTULO_STATUS[status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-marinho-500">
                      {formatarDataHora(cadastro.criado_em) ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
