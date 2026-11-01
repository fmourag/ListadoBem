import type { EnderecoBoicote } from './tipos-dominio';

import {
  CATEGORIAS,
  NOME_UF,
  TIPOS_CADASTRO,
  TIPOS_FONTE,
  type UfBrasil,
} from './constants';

export function formatarCategoria(valor: string | null | undefined): string {
  if (!valor) return 'Categoria não informada';
  return CATEGORIAS.find((categoria) => categoria.valor === valor)?.rotulo ?? valor;
}

export function formatarTipoCadastro(valor: string | null | undefined): string {
  if (!valor) return 'Cadastro';
  return TIPOS_CADASTRO.find((tipo) => tipo.valor === valor)?.rotulo ?? valor;
}

export function formatarTipoFonte(valor: string | null | undefined): string {
  if (!valor) return 'Fonte';
  return TIPOS_FONTE.find((fonte) => fonte.valor === valor)?.rotulo ?? valor;
}

export function formatarCidadeEstado(
  endereco: EnderecoBoicote | null | undefined,
): string {
  const cidade = endereco?.cidade?.trim();
  const estado = endereco?.estado?.trim();
  if (!cidade && !estado) return 'Local não informado';
  if (!estado) return cidade ?? 'Local não informado';
  return cidade ? `${cidade} — ${estado}` : estado;
}

export function nomeDoEstado(sigla: string | null | undefined): string {
  if (!sigla) return '';
  return NOME_UF[sigla as UfBrasil] ?? sigla;
}

/** Formata uma data no padrão `AAAA-MM-DD` sem sofrer deslocamento de fuso. */
export function formatarData(dataIso: string | null | undefined): string | null {
  if (!dataIso) return null;
  const data = new Date(`${dataIso}T00:00:00`);
  if (Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

export function formatarDataHora(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

/** Domínio visível de um link, para deixar a fonte legível antes do clique. */
export function dominioDoLink(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
