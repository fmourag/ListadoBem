import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import Link from 'next/link';
import { Send } from 'lucide-react';

import { AvisoNaoTransferencia } from '@/components/AvisoNaoTransferencia';
import { formatarCategoria, formatarCidadeEstado } from '@/lib/format';
import type { CadastroFormValues } from '@/lib/validation';

import { ErroCampo, mensagemDeErro } from './campos';

interface Props {
  register: UseFormRegister<CadastroFormValues>;
  errors: FieldErrors<CadastroFormValues>;
  valores: CadastroFormValues;
}

export function EtapaTermos({ register, errors, valores }: Props) {
  const totalReferencias = valores.referencias?.length ?? 0;
  return (
          <div className="space-y-5">
            <header className="flex items-start gap-2">
              <Send aria-hidden="true" className="mt-0.5 h-5 w-5 text-marinho-500" />
              <div>
                <h2 className="text-lg font-bold text-marinho-950">Revisão e envio</h2>
                <p className="text-sm text-marinho-600">
                  Confira o resumo. Depois de enviar, o cadastro fica <strong>pendente</strong> até
                  a verificação das referências.
                </p>
              </div>
            </header>

            <dl className="grid gap-3 rounded-xl border border-marinho-100 bg-marinho-50/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-marinho-500">
                  Nome público
                </dt>
                <dd className="font-semibold text-marinho-950">
                  {valores.nome_publico || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-marinho-500">
                  Categoria
                </dt>
                <dd className="font-semibold text-marinho-950">
                  {formatarCategoria(valores.categoria)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-marinho-500">
                  Local
                </dt>
                <dd className="font-semibold text-marinho-950">
                  {formatarCidadeEstado(valores.endereco)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-marinho-500">
                  Referências públicas
                </dt>
                <dd className="font-semibold text-marinho-950">{totalReferencias}</dd>
              </div>
            </dl>

            <AvisoNaoTransferencia variante="destaque" />

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-marinho-200 p-3 transition hover:border-marinho-300">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-marinho-900"
                  aria-invalid={Boolean(errors.aceite_termos)}
                  {...register('aceite_termos')}
                />
                <span className="text-sm leading-relaxed text-marinho-800">
                  Declaro que as informações e as referências são verdadeiras, que sou responsável
                  pelo conteúdo enviado e que aceito os{' '}
                  <Link
                    href="/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900"
                  >
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
              <ErroCampo id="erro-aceite-termos" mensagem={mensagemDeErro(errors.aceite_termos)} />

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ouro-300 bg-ouro-50 p-3 transition hover:border-ouro-400">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-marinho-900"
                  aria-invalid={Boolean(errors.aceite_aviso_nao_transferencia)}
                  {...register('aceite_aviso_nao_transferencia')}
                />
                <span className="text-sm font-semibold leading-relaxed text-marinho-900">
                  Entendi que a Lista do Bem é apenas um diretório: ela não processa pagamentos,
                  não recebe PIX/TED e não intermedeia a relação comercial. Vou combinar e pagar
                  diretamente com o estabelecimento.
                </span>
              </label>
              <ErroCampo
                id="erro-aceite-aviso"
                mensagem={mensagemDeErro(errors.aceite_aviso_nao_transferencia)}
              />
            </div>
          </div>
  );
}

