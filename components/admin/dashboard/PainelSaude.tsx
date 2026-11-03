import { CheckCircle2, Server, XCircle } from 'lucide-react';

import { adminConfigurado } from '@/lib/admin-auth';
import { supabaseAdminConfigurado } from '@/lib/supabase-admin';

export function PainelSaude({
  erroCadastros,
  eventosDisponiveis,
  versao,
  ambiente,
}: {
  erroCadastros: string | null;
  eventosDisponiveis: boolean;
  versao: string;
  ambiente: string;
}) {
  const linhas = [
    { rotulo: 'Supabase', valor: erroCadastros ? 'Falha' : 'OK', ok: !erroCadastros },
    {
      rotulo: 'Service role',
      valor: supabaseAdminConfigurado() ? 'OK' : 'Ausente',
      ok: supabaseAdminConfigurado(),
    },
    { rotulo: 'Admin', valor: adminConfigurado() ? 'OK' : 'Ausente', ok: adminConfigurado() },
    {
      rotulo: 'Eventos',
      valor: eventosDisponiveis ? 'OK' : 'Migração pendente',
      ok: eventosDisponiveis,
    },
    { rotulo: 'Versão', valor: versao, ok: true },
    { rotulo: 'Ambiente', valor: ambiente, ok: true },
  ];

  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
        <Server aria-hidden="true" className="h-4 w-4 text-marinho-500" />
        Funcionamento
      </h2>
      <dl className="mt-3 divide-y divide-marinho-100 text-sm">
        {linhas.map((linha) => (
          <div key={linha.rotulo} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-marinho-600">{linha.rotulo}</dt>
            <dd
              className={`inline-flex items-center gap-1.5 font-bold ${
                linha.ok ? 'text-esmeralda-800' : 'text-ouro-800'
              }`}
            >
              {linha.ok ? (
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              ) : (
                <XCircle aria-hidden="true" className="h-4 w-4" />
              )}
              {linha.valor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
