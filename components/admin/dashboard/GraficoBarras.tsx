import { BarChart3 } from 'lucide-react';

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

export function GraficoBarras({
  titulo,
  descricao,
  dados,
  cor,
}: {
  titulo: string;
  descricao: string;
  dados: { rotulo: string; valor: number }[];
  cor: string;
}) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const total = dados.reduce((soma, d) => soma + d.valor, 0);

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
            <BarChart3 aria-hidden="true" className="h-4 w-4 text-marinho-500" />
            {titulo}
          </h2>
          <p className="mt-1 text-xs text-marinho-500">{descricao}</p>
        </div>
        <span className="text-sm font-black text-marinho-800">{formatarNumero(total)}</span>
      </div>

      <div
        className="mt-5 flex h-32 items-end gap-1"
        role="img"
        aria-label={`${titulo}: ${total} no período`}
      >
        {dados.map((d) => (
          <div
            key={d.rotulo}
            className={`min-h-1 flex-1 rounded-t ${cor}`}
            style={{ height: `${Math.max(4, (d.valor / maximo) * 100)}%` }}
            title={`${d.rotulo}: ${d.valor}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-marinho-400">
        <span>{dados[0]?.rotulo}</span>
        <span>{dados[Math.floor(dados.length / 2)]?.rotulo}</span>
        <span>{dados[dados.length - 1]?.rotulo}</span>
      </div>
    </section>
  );
}
