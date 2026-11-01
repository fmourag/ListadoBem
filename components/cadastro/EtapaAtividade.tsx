import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { MapPin } from 'lucide-react';

import { CATEGORIAS, UFS } from '@/lib/constants';
import type { CadastroFormValues } from '@/lib/validation';

import { ErroCampo, mensagemDeErro } from './campos';

interface Props {
  register: UseFormRegister<CadastroFormValues>;
  errors: FieldErrors<CadastroFormValues>;
  valores: CadastroFormValues;
}

export function EtapaAtividade({ register, errors, valores }: Props) {
  return (
          <div className="space-y-5">
            <header className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 text-marinho-500" />
              <div>
                <h2 className="text-lg font-bold text-marinho-950">Atividade e endereço</h2>
                <p className="text-sm text-marinho-600">
                  Quanto mais claro, mais fácil alguém encontrar e comprar de você.
                </p>
              </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="categoria" className="label">
                  Categoria <span aria-hidden="true" className="text-perigo-600">*</span>
                </label>
                <select
                  id="categoria"
                  className={`input ${errors.categoria ? 'input-erro' : ''}`}
                  aria-invalid={Boolean(errors.categoria)}
                  aria-describedby={errors.categoria ? 'erro-categoria' : undefined}
                  {...register('categoria')}
                >
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria.valor} value={categoria.valor}>
                      {categoria.rotulo}
                    </option>
                  ))}
                </select>
                <ErroCampo id="erro-categoria" mensagem={mensagemDeErro(errors.categoria)} />
              </div>

              <div>
                <label htmlFor="link_midia" className="label">
                  Link de foto ou logo <span className="font-normal text-marinho-500">(opcional)</span>
                </label>
                <input
                  id="link_midia"
                  className={`input ${errors.link_midia ? 'input-erro' : ''}`}
                  placeholder="https://..."
                  aria-invalid={Boolean(errors.link_midia)}
                  {...register('link_midia')}
                />
                <ErroCampo id="erro-link-midia" mensagem={mensagemDeErro(errors.link_midia)} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="descricao_atividade" className="label">
                  Descrição da atividade <span aria-hidden="true" className="text-perigo-600">*</span>
                </label>
                <textarea
                  id="descricao_atividade"
                  rows={4}
                  className={`input ${errors.descricao_atividade ? 'input-erro' : ''}`}
                  placeholder="Ex.: confeitaria artesanal com doces por encomenda, entrega no bairro..."
                  aria-invalid={Boolean(errors.descricao_atividade)}
                  aria-describedby="contador-descricao erro-descricao"
                  {...register('descricao_atividade')}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <ErroCampo
                    id="erro-descricao"
                    mensagem={mensagemDeErro(errors.descricao_atividade)}
                  />
                  <p id="contador-descricao" className="ml-auto text-xs text-marinho-400">
                    {(valores.descricao_atividade ?? '').length}/1200
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="situacao_boicote" className="label">
                  O que aconteceu no boicote? <span aria-hidden="true" className="text-perigo-600">*</span>
                </label>
                <textarea
                  id="situacao_boicote"
                  rows={4}
                  className={`input ${errors.situacao_boicote ? 'input-erro' : ''}`}
                  placeholder="Descreva o episódio, quando ocorreu e como isso afetou seu negócio."
                  aria-invalid={Boolean(errors.situacao_boicote)}
                  aria-describedby="contador-situacao erro-situacao"
                  {...register('situacao_boicote')}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <ErroCampo
                    id="erro-situacao"
                    mensagem={mensagemDeErro(errors.situacao_boicote)}
                  />
                  <p id="contador-situacao" className="ml-auto text-xs text-marinho-400">
                    {(valores.situacao_boicote ?? '').length}/1500
                  </p>
                </div>
              </div>
            </div>

            <fieldset className="rounded-xl border border-marinho-100 bg-marinho-50/40 p-4">
              <legend className="px-1 text-sm font-bold text-marinho-900">Endereço de atendimento</legend>
              <div className="grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="cep" className="label">
                    CEP <span aria-hidden="true" className="text-perigo-600">*</span>
                  </label>
                  <input
                    id="cep"
                    inputMode="numeric"
                    className={`input ${errors.endereco?.cep ? 'input-erro' : ''}`}
                    placeholder="00000-000"
                    {...register('endereco.cep')}
                  />
                  <ErroCampo
                    id="erro-cep"
                    mensagem={mensagemDeErro(errors.endereco?.cep)}
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="logradouro" className="label">
                    Rua / avenida <span aria-hidden="true" className="text-perigo-600">*</span>
                  </label>
                  <input
                    id="logradouro"
                    className={`input ${errors.endereco?.logradouro ? 'input-erro' : ''}`}
                    {...register('endereco.logradouro')}
                  />
                  <ErroCampo
                    id="erro-logradouro"
                    mensagem={mensagemDeErro(errors.endereco?.logradouro)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="numero" className="label">
                    Número <span aria-hidden="true" className="text-perigo-600">*</span>
                  </label>
                  <input
                    id="numero"
                    className={`input ${errors.endereco?.numero ? 'input-erro' : ''}`}
                    {...register('endereco.numero')}
                  />
                  <ErroCampo
                    id="erro-numero"
                    mensagem={mensagemDeErro(errors.endereco?.numero)}
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="complemento" className="label">
                    Complemento
                  </label>
                  <input
                    id="complemento"
                    className="input"
                    placeholder="Sala, box, referência (opcional)"
                    {...register('endereco.complemento')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bairro" className="label">
                    Bairro <span aria-hidden="true" className="text-perigo-600">*</span>
                  </label>
                  <input
                    id="bairro"
                    className={`input ${errors.endereco?.bairro ? 'input-erro' : ''}`}
                    {...register('endereco.bairro')}
                  />
                  <ErroCampo
                    id="erro-bairro"
                    mensagem={mensagemDeErro(errors.endereco?.bairro)}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="cidade" className="label">
                    Cidade <span aria-hidden="true" className="text-perigo-600">*</span>
                  </label>
                  <input
                    id="cidade"
                    className={`input ${errors.endereco?.cidade ? 'input-erro' : ''}`}
                    {...register('endereco.cidade')}
                  />
                  <ErroCampo
                    id="erro-cidade"
                    mensagem={mensagemDeErro(errors.endereco?.cidade)}
                  />
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="estado" className="label">
                    UF <span aria-hidden="true" className="text-perigo-600">*</span>
                  </label>
                  <select id="estado" className="input" {...register('endereco.estado')}>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  <ErroCampo
                    id="erro-estado"
                    mensagem={mensagemDeErro(errors.endereco?.estado)}
                  />
                </div>
              </div>
            </fieldset>
          </div>
  );
}
