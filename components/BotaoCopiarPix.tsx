'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  valor: string;
  rotulo?: string;
  rotuloCopiado?: string;
  className?: string;
}

/**
 * Copia um valor para a área de transferência e confirma visualmente.
 * Feedback é local (sem toast) para não carregar JS extra na landing.
 */
export function BotaoCopiarPix({
  valor,
  rotulo = 'Copiar',
  rotuloCopiado = 'Copiado!',
  className = 'btn-secundario',
}: Props) {
  const [copiado, setCopiado] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function copiar() {
    setFalhou(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(valor);
      } else {
        const area = document.createElement('textarea');
        area.value = valor;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setFalhou(true);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={copiar} className={className} aria-live="polite">
        {copiado ? (
          <Check aria-hidden="true" className="h-4 w-4 text-esmeralda-600" />
        ) : (
          <Copy aria-hidden="true" className="h-4 w-4" />
        )}
        {copiado ? rotuloCopiado : rotulo}
      </button>
      {falhou ? (
        <span role="status" className="text-xs font-semibold text-perigo-700">
          Não foi possível copiar — selecione o texto manualmente.
        </span>
      ) : null}
    </span>
  );
}
