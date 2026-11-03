import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { UserRound } from 'lucide-react';

import { TIPOS_CADASTRO } from '@/lib/constants';
import type { CadastroFormValues } from '@/lib/validation';

import { ErroCampo, mensagemDeErro } from './campos';

interface Props {
  register: UseFormRegister<CadastroFormValues>;
  errors: FieldErrors<CadastroFormValues>;
  tipoSelecionado: CadastroFormValues['tipo_cadastro'];
}

export function EtapaDados({ register, errors, tipoSelecionado }: Props) {
  return (
    <div className="space-y-5">
      <header className="flex items-start gap-2">
        <UserRound aria-hidden="true" className="mt-0.5 h-5 w-5 text-marinho-500" />
        <div>
          <h2 className="text-lg font-bold text-marinho-950">Dados básicos</h2>
          <p className="text-sm text-marinho-600">
            Seus dados de contato não aparecem publicamente; servem para a análise do cadastro.
          </p>
        </div>
      </header>

      <fieldset>
        <legend className="label">Tipo de cadastro</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TIPOS_CADASTRO.map((tipo) => {
            const marcado = tipoSelecionado === tipo.valor;
            return (
              <label
                key={tipo.valor}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition ${
                  marcado
                    ? 'border-marinho-800 bg-marinho-50 ring-1 ring-marinho-800'
                    : 'border-marinho-200 bg-white hover:border-marinho-300'
                }`}
              >
                <input
                  type="radio"
                  value={tipo.valor}
                  className="mt-1 h-4 w-4 accent-marinho-900"
                  {...register('tipo_cadastro')}
                />
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-marinho-950">{tipo.rotulo}</span>
                  <span className="block text-xs text-marinho-600">{tipo.descricao}</span>
                </span>
              </label>
            );
          })}
        </div>
        <ErroCampo id="erro-tipo-cadastro" mensagem={mensagemDeErro(errors.tipo_cadastro)} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome_publico" className="label">
            Nome do estabelecimento, escritório ou entidade{' '}
            <span className="font-normal text-marinho-500">(opcional)</span>
          </label>
          <input
            id="nome_publico"
            className={`input ${errors.nome_publico ? 'input-erro' : ''}`}
            autoComplete="organization"
            placeholder="Ex.: Padaria do Bairro, Escritório Silva, Instituto..."
            aria-invalid={Boolean(errors.nome_publico)}
            aria-describedby={errors.nome_publico ? 'erro-nome-publico' : undefined}
            {...register('nome_publico')}
          />
          <ErroCampo id="erro-nome-publico" mensagem={mensagemDeErro(errors.nome_publico)} />
        </div>

        <div>
          <label htmlFor="nome_completo" className="label">
            Nome do profissional, comerciante ou responsável{' '}
            <span className="font-normal text-marinho-500">(opcional)</span>
          </label>
          <input
            id="nome_completo"
            className={`input ${errors.nome_completo ? 'input-erro' : ''}`}
            autoComplete="name"
            placeholder="Ex.: Maria Silva"
            aria-invalid={Boolean(errors.nome_completo)}
            aria-describedby={errors.nome_completo ? 'erro-nome-completo' : undefined}
            {...register('nome_completo')}
          />
          <ErroCampo id="erro-nome-completo" mensagem={mensagemDeErro(errors.nome_completo)} />
        </div>

        <p className="text-xs leading-relaxed text-marinho-500 sm:col-span-2">
          Informe pelo menos um dos dois nomes. O nome público é o que aparece na listagem.
        </p>

        <div>
          <label htmlFor="cpf_cnpj" className="label">
            CPF ou CNPJ <span className="font-normal text-marinho-500">(opcional)</span>
          </label>
          <input
            id="cpf_cnpj"
            className={`input ${errors.cpf_cnpj ? 'input-erro' : ''}`}
            inputMode="numeric"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            aria-invalid={Boolean(errors.cpf_cnpj)}
            aria-describedby="ajuda-cpf_cnpj erro-cpf-cnpj"
            {...register('cpf_cnpj')}
          />
          <p id="ajuda-cpf_cnpj" className="mt-1 text-xs text-marinho-500">
            Se informado, evita cadastros duplicados. Não é exibido publicamente.
          </p>
          <ErroCampo id="erro-cpf-cnpj" mensagem={mensagemDeErro(errors.cpf_cnpj)} />
        </div>

        <div>
          <label htmlFor="telefone" className="label">
            Telefone / WhatsApp
          </label>
          <input
            id="telefone"
            className={`input ${errors.telefone ? 'input-erro' : ''}`}
            inputMode="tel"
            placeholder="(00) 00000-0000"
            aria-invalid={Boolean(errors.telefone)}
            aria-describedby="ajuda-contato erro-telefone"
            {...register('telefone')}
          />
          <ErroCampo id="erro-telefone" mensagem={mensagemDeErro(errors.telefone)} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className={`input ${errors.email ? 'input-erro' : ''}`}
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="ajuda-contato erro-email"
            {...register('email')}
          />
          <ErroCampo id="erro-email" mensagem={mensagemDeErro(errors.email)} />
        </div>

        <p
          id="ajuda-contato"
          className="rounded-lg bg-marinho-50 px-3 py-2 text-xs font-semibold text-marinho-700 sm:col-span-2"
        >
          Informe <strong>pelo menos um</strong> contato: e-mail ou telefone/WhatsApp.
        </p>
      </div>
    </div>
  );
}
