'use client';

import Link from 'next/link';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, type FieldPath } from 'react-hook-form';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { EtapaAtividade } from '@/components/cadastro/EtapaAtividade';
import { EtapaDados } from '@/components/cadastro/EtapaDados';
import { EtapaReferencias } from '@/components/cadastro/EtapaReferencias';
import { EtapaTermos } from '@/components/cadastro/EtapaTermos';
import type { RespostaCadastro } from '@/lib/tipos';
import {
  cadastroSchema,
  valoresIniciaisCadastro,
  type CadastroFormValues,
} from '@/lib/validation';

const ETAPAS = [
  { titulo: 'Dados básicos', descricao: 'Quem você é e como falar com você.' },
  { titulo: 'Atividade e endereço', descricao: 'O que você oferece e onde atende.' },
  { titulo: 'Referências públicas', descricao: 'Pelo menos 1 prova verificável.' },
  { titulo: 'Termos e envio', descricao: 'Confirme os avisos e envie.' },
] as const;

type IndiceEtapa = 0 | 1 | 2 | 3;

const CAMPOS_DA_ETAPA: Record<IndiceEtapa, FieldPath<CadastroFormValues>[]> = {
  0: ['tipo_cadastro', 'nome_completo', 'nome_publico', 'cpf_cnpj', 'email', 'telefone'],
  1: ['categoria', 'descricao_atividade', 'endereco', 'situacao_boicote', 'link_midia'],
  2: ['referencias'],
  3: ['aceite_termos', 'aceite_aviso_nao_transferencia'],
};

export function FormularioCadastro() {
  const [etapa, setEtapa] = useState<IndiceEtapa>(0);
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: valoresIniciaisCadastro(),
    mode: 'onTouched',
  });

  const referencias = useFieldArray({
    control,
    name: 'referencias',
  });

  const valores = watch();
  const tipoSelecionado = valores.tipo_cadastro;
  const totalReferencias = valores.referencias?.length ?? 0;
  const erroRaizReferencias =
    errors.referencias as unknown as
      | { root?: { message?: string }; message?: string }
      | undefined;
  const mensagemReferencias =
    erroRaizReferencias?.root?.message ?? erroRaizReferencias?.message;

  async function avancar() {
    if (etapa === 0) {
      const nomeCompleto = (getValues('nome_completo') ?? '').trim();
      const nomePublico = (getValues('nome_publico') ?? '').trim();

      if (nomeCompleto === '' && nomePublico === '') {
        setError('nome_completo', {
          type: 'manual',
          message: 'Informe o nome do estabelecimento ou o nome do profissional.',
        });
        return;
      }
      if (nomeCompleto === '' && nomePublico.length < 5) {
        setError('nome_publico', {
          type: 'manual',
          message: 'Use pelo menos 5 caracteres no nome do estabelecimento.',
        });
        return;
      }
    }

    const valido = await trigger(CAMPOS_DA_ETAPA[etapa], { shouldFocus: true });
    if (!valido) {
      toast.error('Confira os campos destacados antes de continuar.');
      return;
    }
    setEtapa((atual) => Math.min(atual + 1, 3) as IndiceEtapa);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function voltar() {
    setEtapa((atual) => Math.max(atual - 1, 0) as IndiceEtapa);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function enviar(dados: CadastroFormValues) {
    try {
      const resposta = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const corpo = (await resposta.json().catch(() => null)) as RespostaCadastro | null;

      if (!resposta.ok || !corpo?.ok) {
        toast.error(corpo?.mensagem ?? 'Não foi possível enviar o cadastro. Tente novamente.');
        return;
      }

      setProtocolo(corpo.id ?? null);
      toast.success('Cadastro enviado! Ele passará por análise antes de ser publicado.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error(
        'Falha de conexão ao enviar o cadastro. Verifique sua internet e tente novamente.',
      );
    }
  }

  if (protocolo) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="card space-y-5 border-esmeralda-200 p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-esmeralda-100">
            <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-esmeralda-700" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-marinho-950">Cadastro recebido. Obrigado!</h2>
            <p className="mt-1 text-sm leading-relaxed text-marinho-700">
              Seu cadastro está com o status <strong>pendente</strong>. Nossa equipe confere as
              referências públicas antes de publicar no diretório.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-marinho-100 bg-marinho-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-marinho-500">
            Protocolo de acompanhamento
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-marinho-950">
            {protocolo.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="rounded-lg border border-ouro-300 bg-ouro-50 px-4 py-3 text-sm text-marinho-800">
          <p className="font-bold">Enquanto isso, redobre a atenção:</p>
          <p className="mt-1 leading-relaxed">
            Nós nunca vamos entrar em contato pedindo PIX, TED, boleto ou qualquer pagamento para
            aprovar seu cadastro. A plataforma é gratuita e não processa valores.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/listagem" className="btn-secundario">
            Ver estabelecimentos
          </Link>
          <Link href="/" className="btn-primario">
            Voltar para o início
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      {/* Progresso */}
      <nav aria-label="Etapas do cadastro">
        <ol className="grid gap-2 sm:grid-cols-4">
          {ETAPAS.map((configuracao, indice) => {
            const ativa = indice === etapa;
            const concluida = indice < etapa;
            return (
              <li
                key={configuracao.titulo}
                aria-current={ativa ? 'step' : undefined}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
                  ativa
                    ? 'border-marinho-900 bg-marinho-900 text-white'
                    : concluida
                      ? 'border-esmeralda-200 bg-esmeralda-50 text-esmeralda-900'
                      : 'border-marinho-100 bg-white text-marinho-500'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    ativa
                      ? 'bg-ouro-400 text-marinho-950'
                      : concluida
                        ? 'bg-esmeralda-600 text-white'
                        : 'bg-marinho-100 text-marinho-600'
                  }`}
                >
                  {concluida ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : indice + 1}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-bold uppercase tracking-wide">
                    {configuracao.titulo}
                  </span>
                  <span className={`block text-[11px] ${ativa ? 'text-marinho-200' : ''}`}>
                    {configuracao.descricao}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-marinho-100"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={etapa + 1}
          aria-label={`Etapa ${etapa + 1} de 4`}
        >
          <div
            className="h-full rounded-full bg-esmeralda-600 transition-all"
            style={{ width: `${((etapa + 1) / 4) * 100}%` }}
          />
        </div>
      </nav>

      <div className="card p-5 sm:p-7">
        {/* ───────── Etapa 1 ───────── */}
        {etapa === 0 ? (
          <EtapaDados
            register={register}
            errors={errors}
            tipoSelecionado={tipoSelecionado}
          />
        ) : null}

        {/* ───────── Etapa 2 ───────── */}
        {etapa === 1 ? (
          <EtapaAtividade
            register={register}
            errors={errors}
            valores={valores}
          />
        ) : null}

        {/* ───────── Etapa 3 ───────── */}
        {etapa === 2 ? (
          <EtapaReferencias
            register={register}
            errors={errors}
            referencias={referencias}
            mensagemReferencias={mensagemReferencias}
          />
        ) : null}

        {/* ───────── Etapa 4 ───────── */}
        {etapa === 3 ? (
          <EtapaTermos
            register={register}
            errors={errors}
            valores={valores}
          />
        ) : null}

        {/* Navegação */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-marinho-100 pt-4">
          <button
            type="button"
            onClick={voltar}
            disabled={etapa === 0}
            className="btn-secundario"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Voltar
          </button>

          {etapa < 3 ? (
            <button type="button" onClick={avancar} className="btn-primario">
              Continuar
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-verde">
              {isSubmitting ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Send aria-hidden="true" className="h-4 w-4" />
              )}
              {isSubmitting ? 'Enviando...' : 'Enviar cadastro para análise'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
