/**
 * Contribuição facultativa para a manutenção da iniciativa.
 *
 * Fonte única dos dados PIX, portada do app mobile original (arquivado em
 * `_backup-eleicoes-20261101\monorepo-restante`):
 *  - chave E.164: +5521971943298
 *  - exibição: (21) 97194-3298
 *  - beneficiário: Fernando Goncalves · Rio de Janeiro
 *
 * IMPORTANTE: este PIX é exclusivamente para custear a infraestrutura da
 * plataforma. Não é pagamento de cadastro e não é transferência para os
 * estabelecimentos listados.
 */
import { generatePixPayload } from './pix-generator';

export const PIX_CHAVE_E164 = '+5521971943298';
export const PIX_CHAVE_EXIBICAO = '(21) 97194-3298';
export const PIX_BENEFICIARIO = 'Fernando Goncalves';
export const PIX_CIDADE = 'Rio de Janeiro';
export const PIX_TXID = '***';

/** Sem `amount`: o pagador escolhe qualquer valor. */
export const PIX_PAYLOAD = generatePixPayload({
  key: PIX_CHAVE_E164,
  name: PIX_BENEFICIARIO,
  city: PIX_CIDADE,
  txId: PIX_TXID,
});

/** Cláusulas obrigatórias — repetidas na landing e em /apoie. */
export const CONTRIBUICAO_PONTOS = [
  'Não é pagamento por cadastro.',
  'Não é transferência para estabelecimentos.',
  'Não é obrigatória.',
  'Não desbloqueia benefícios: a listagem continua pública e gratuita.',
  'É 100% voluntária, de qualquer valor.',
] as const;

/** Custos que a contribuição ajuda a cobrir. */
export const CONTRIBUICAO_CUSTOS = [
  'Servidor e banco de dados',
  'Domínio e certificados',
  'Hospedagem e tráfego',
  'Desenvolvimento e manutenção',
] as const;

export const CONTRIBUICAO_TITULO = 'Apoie esta iniciativa';
export const CONTRIBUICAO_SUBTITULO =
  'Contribuição facultativa para manter servidor, domínio, hospedagem e desenvolvimento. Não é cobrança, não é taxa e não libera nenhum recurso extra.';

export { crc16, formatTlv, generatePixPayload, normalizePixKey } from './pix-generator';

