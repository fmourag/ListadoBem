/**
 * Gerador de payload PIX (BR Code / EMVCo), portado do app mobile original
 * (arquivado em `_backup-eleicoes-20261101\monorepo-restante`).
 *
 * Mantido local para o app ser 100% standalone: nada importa do monorepo.
 */

/** Normaliza a chave para o formato exigido pelo BACEN (E.164 para celular). */
export function normalizePixKey(chave: string): string {
  if (!chave) return chave;
  const limpa = chave.trim();

  if (limpa.startsWith('+55')) {
    return '+' + limpa.replace(/\D/g, '');
  }

  if (limpa.includes('@')) {
    return limpa.toLowerCase();
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(limpa)) {
    return limpa;
  }

  const digitos = limpa.replace(/\D/g, '');

  if (digitos.length >= 12 && digitos.startsWith('55')) {
    return '+' + digitos;
  }

  if (digitos.length === 10 || digitos.length === 11) {
    return '+55' + digitos;
  }

  if (digitos.length === 11 || digitos.length === 14) {
    return digitos;
  }

  return limpa;
}

/** Tamanho em bytes UTF-8, sem depender de Buffer (roda também no client). */
function tamanhoUtf8(texto: string): number {
  let bytes = 0;
  for (const caractere of texto) {
    const codigo = caractere.codePointAt(0) ?? 0;
    if (codigo <= 0x7f) bytes += 1;
    else if (codigo <= 0x7ff) bytes += 2;
    else if (codigo <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** Campo TLV (Tag-Length-Value). */
export function formatTlv(id: string, valor: string): string {
  return id + String(tamanhoUtf8(valor)).padStart(2, '0') + valor;
}

/** CRC16-CCITT (polinômio 0x1021, inicial 0xFFFF), exigido pelo BACEN. */
export function crc16(dados: string): string {
  let crc = 0xffff;
  for (let i = 0; i < dados.length; i += 1) {
    crc ^= dados.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadOptions {
  key: string;
  name: string;
  city: string;
  /** Omitido = valor em aberto (contribuição de qualquer valor). */
  amount?: number | string;
  txId?: string;
}

/** Monta o BR Code estático. */
export function generatePixPayload({
  key,
  name,
  city,
  amount,
  txId = '***',
}: PixPayloadOptions): string {
  const chave = normalizePixKey(key);
  const contaComerciante = formatTlv('26', formatTlv('00', 'br.gov.bcb.pix') + formatTlv('01', chave));

  let valor: number | null = null;
  if (typeof amount === 'number' && amount > 0) {
    valor = amount;
  } else if (typeof amount === 'string' && amount.trim() !== '') {
    const convertido = Number.parseFloat(amount);
    if (!Number.isNaN(convertido) && convertido > 0) valor = convertido;
  }

  const base =
    formatTlv('00', '01') +
    contaComerciante +
    formatTlv('52', '0000') +
    formatTlv('53', '986') +
    (valor !== null ? formatTlv('54', valor.toFixed(2)) : '') +
    formatTlv('58', 'BR') +
    formatTlv('59', name.slice(0, 25)) +
    formatTlv('60', city.slice(0, 15)) +
    formatTlv('62', formatTlv('05', txId));

  return base + '6304' + crc16(base + '6304');
}

