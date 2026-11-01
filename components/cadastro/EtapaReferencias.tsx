import type {
  FieldErrors,
  UseFieldArrayReturn,
  UseFormRegister,
} from 'react-hook-form';
import { AlertTriangle, BadgeCheck, Plus, Trash2 } from 'lucide-react';

import { MAXIMO_REFERENCIAS, MINIMO_REFERENCIAS, TIPOS_FONTE } from '@/lib/constants';
import { referenciaVazia, type CadastroFormValues } from '@/lib/validation';

import { ErroCampo, mensagemDeErro } from './campos';

interface Props {
  register: UseFormRegister<CadastroFormValues>;
  errors: FieldErrors<CadastroFormValues>;
  referencias: UseFieldArrayReturn<CadastroFormValues, 'referencias'>;
  mensagemReferencias?: string;
}

export function EtapaReferencias({
  register,
  errors,
  referencias,
  mensagemReferencias,
}: Props) {
  const { fields, append, remove } = referencias;
  const totalReferencias = fields.length;
  return (
          <div className="space-y-5">
            <header className="flex items-start gap-2">
              <BadgeCheck aria-hidden="true" className="mt-0.5 h-5 w-5 text-marinho-500" />
              <div>
                <h2 className="text-lg font-bold text-marinho-950">Referências públicas</h2>
                <p className="text-sm leading-relaxed text-marinho-600">
                  Cadastros sem <strong>pelo menos {MINIMO_REFERENCIAS} referências públicas
                  verificáveis</strong> não são publicados. Vale link de jornal, blog de notícias,
                  perfil de parlamentar, jornalista ou personalidade pública que comprove o
                  boicote.
                </p>
              </div>
            </header>

            {mensagemReferencias ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-perigo-200 bg-perigo-50 px-3 py-2 text-sm font-semibold text-perigo-800"
              >
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {mensagemReferencias}
              </div>
            ) : null}

            <div className="space-y-4">
              {fields.map((campo, indice) => {
                const errosItens = (errors.referencias ?? []) as unknown as Array<
                  Record<string, { message?: string } | undefined> | undefined
                >;
                const errosItem = errosItens[indice];
                return (
                  <fieldset
                    key={campo.id}
                    className="rounded-xl border border-marinho-100 bg-white p-4 shadow-sm"
                  >
                    <legend className="flex items-center gap-2 px-1 text-sm font-bold text-marinho-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-marinho-900 text-xs text-white">
                        {indice + 1}
                      </span>
                      Referência pública
                    </legend>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`referencias.${indice}.tipo_fonte`} className="label">
                          Tipo de fonte
                        </label>
                        <select
                          id={`referencias.${indice}.tipo_fonte`}
                          className="input"
                          {...register(`referencias.${indice}.tipo_fonte`)}
                        >
                          {TIPOS_FONTE.map((fonte) => (
                            <option key={fonte.valor} value={fonte.valor}>
                              {fonte.rotulo}
                            </option>
                          ))}
                        </select>
                        <ErroCampo
                          id={`erro-ref-${indice}-tipo`}
                          mensagem={mensagemDeErro(errosItem?.tipo_fonte)}
                        />
                      </div>

                      <div>
                        <label htmlFor={`referencias.${indice}.nome_fonte`} className="label">
                          Nome da fonte
                        </label>
                        <input
                          id={`referencias.${indice}.nome_fonte`}
                          className={`input ${errosItem?.nome_fonte ? 'input-erro' : ''}`}
                          placeholder="Ex.: Folha de S.Paulo, @deputado_x"
                          {...register(`referencias.${indice}.nome_fonte`)}
                        />
                        <ErroCampo
                          id={`erro-ref-${indice}-nome`}
                          mensagem={mensagemDeErro(errosItem?.nome_fonte)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor={`referencias.${indice}.link_referencia`} className="label">
                          Link público (https://)
                        </label>
                        <input
                          id={`referencias.${indice}.link_referencia`}
                          type="url"
                          className={`input ${errosItem?.link_referencia ? 'input-erro' : ''}`}
                          placeholder="https://..."
                          {...register(`referencias.${indice}.link_referencia`)}
                        />
                        <ErroCampo
                          id={`erro-ref-${indice}-link`}
                          mensagem={mensagemDeErro(errosItem?.link_referencia)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor={`referencias.${indice}.titulo_referencia`} className="label">
                          Título da publicação
                        </label>
                        <input
                          id={`referencias.${indice}.titulo_referencia`}
                          className={`input ${errosItem?.titulo_referencia ? 'input-erro' : ''}`}
                          placeholder="Manchete ou título do post"
                          {...register(`referencias.${indice}.titulo_referencia`)}
                        />
                        <ErroCampo
                          id={`erro-ref-${indice}-titulo`}
                          mensagem={mensagemDeErro(errosItem?.titulo_referencia)}
                        />
                      </div>

                      <div>
                        <label htmlFor={`referencias.${indice}.data_publicacao`} className="label">
                          Data da publicação <span className="font-normal">(opcional)</span>
                        </label>
                        <input
                          id={`referencias.${indice}.data_publicacao`}
                          type="date"
                          className={`input ${errosItem?.data_publicacao ? 'input-erro' : ''}`}
                          {...register(`referencias.${indice}.data_publicacao`)}
                        />
                        <ErroCampo
                          id={`erro-ref-${indice}-data`}
                          mensagem={mensagemDeErro(errosItem?.data_publicacao)}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`referencias.${indice}.descricao_contexto`}
                          className="label"
                        >
                          Contexto <span className="font-normal">(opcional)</span>
                        </label>
                        <textarea
                          id={`referencias.${indice}.descricao_contexto`}
                          rows={2}
                          className="input"
                          placeholder="O que o link comprova?"
                          {...register(`referencias.${indice}.descricao_contexto`)}
                        />
                      </div>
                    </div>

                    {fields.length > MINIMO_REFERENCIAS ? (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => remove(indice)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-perigo-700 transition hover:bg-perigo-50"
                        >
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                          Remover referência {indice + 1}
                        </button>
                      </div>
                    ) : null}
                  </fieldset>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-marinho-600">
                {totalReferencias} de {MINIMO_REFERENCIAS} referências obrigatórias · máximo de{' '}
                {MAXIMO_REFERENCIAS}
              </p>
              <button
                type="button"
                onClick={() => append(referenciaVazia())}
                disabled={fields.length >= MAXIMO_REFERENCIAS}
                className="btn-secundario"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Adicionar referência
              </button>
            </div>
          </div>
  );
}
