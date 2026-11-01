import { AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * Texto oficial do aviso. Deve ser idêntico a
 * `AVISO_NAO_TRANSFERENCIA` em `packages/shared/src/types.ts`.
 */
export const TEXTO_AVISO_NAO_TRANSFERENCIA =
  '⚠️ NÃO FAÇA TRANSFERÊNCIAS FINANCEIRAS. Esta plataforma NÃO processa pagamentos. Apoie consumindo diretamente os produtos/serviços do estabelecimento.';

/**
 * `compact`/`full` são os nomes canônicos pedidos na especificação.
 * `barra`/`destaque`/`compacto` continuam aceitos para não quebrar as páginas
 * que já usavam os nomes anteriores.
 */
type Variante = 'compact' | 'full' | 'barra' | 'destaque' | 'compacto';

export interface AvisoNaoTransferenciaProps {
  variante?: Variante;
  className?: string;
}

/**
 * Aviso de segurança obrigatório e repetido em todo o produto.
 * Aparece no topo da home, no rodapé, na listagem, no cadastro e na moderação.
 * Não é decorativo: é a regra de negócio central da plataforma.
 */
export function AvisoNaoTransferencia({
  variante = 'barra',
  className = '',
}: AvisoNaoTransferenciaProps) {
  if (variante === 'compact' || variante === 'compacto') {
    return (
      <p
        className={`flex items-start gap-2 text-xs font-semibold leading-relaxed text-ouro-200 ${className}`}
      >
        <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ouro-300" />
        <span>{TEXTO_AVISO_NAO_TRANSFERENCIA}</span>
      </p>
    );
  }

  if (variante === 'full' || variante === 'destaque') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={`rounded-2xl border-2 border-perigo-700 bg-perigo-700 p-5 text-white shadow-card sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-7 w-7 shrink-0 text-ouro-300" />
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-wide text-ouro-300">
              Aviso obrigatório de segurança
            </p>
            <p className="text-base font-bold leading-relaxed sm:text-lg">
              {TEXTO_AVISO_NAO_TRANSFERENCIA}
            </p>
            <p className="text-sm leading-relaxed text-perigo-100">
              Se alguém pedir PIX, TED, boleto ou depósito em nome desta plataforma, é golpe.
              Combine e pague <strong>somente</strong> direto com o estabelecimento, na loja ou
              pelos canais oficiais dele.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`border-y-2 border-perigo-700 bg-ouro-300 ${className}`}
    >
      <div className="container-page flex items-start gap-3 py-2.5 text-marinho-950">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-perigo-700" />
        <p className="text-xs font-bold uppercase leading-snug tracking-wide sm:text-sm">
          {TEXTO_AVISO_NAO_TRANSFERENCIA}
        </p>
      </div>
    </div>
  );
}
