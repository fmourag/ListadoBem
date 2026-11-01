import { z } from 'zod';

import {
  CATEGORIA_VALORES,
  TIPO_CADASTRO_VALORES,
  TIPO_FONTE_VALORES,
  UFS,
  MAXIMO_REFERENCIAS,
  MINIMO_REFERENCIAS,
} from './constants';

/**
 * Esquema único de validação — usado no formulário (client) e revalidado
 * na API route (server). A validação do browser é conveniência de UX;
 * a autoridade é sempre a do servidor.
 *
 * Regras de contato:
 *  - CPF/CNPJ é OPCIONAL (se informado, precisa ser válido);
 *  - e-mail e telefone são opcionais individualmente, mas exige-se
 *    PELO MENOS UM dos dois.
 */

const TIPOS_MIDIA_VALORES = ['foto', 'video', 'logo', 'documento'] as const;

const REGEX_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D+/g, '');
}

function cpfValido(cpf: string): boolean {
  const digitos = somenteDigitos(cpf);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(digitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(digitos[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(digitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(digitos[10]);
}

function cnpjValido(cnpj: string): boolean {
  const digitos = somenteDigitos(cnpj);
  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (base: string): number => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base
      .split('')
      .reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  if (calcularDigito(digitos.slice(0, 12)) !== Number(digitos[12])) return false;
  return calcularDigito(digitos.slice(0, 13)) === Number(digitos[13]);
}

export function cpfCnpjValido(valor: string): boolean {
  const digitos = somenteDigitos(valor);
  if (digitos.length === 11) return cpfValido(digitos);
  if (digitos.length === 14) return cnpjValido(digitos);
  return false;
}

function urlHttpValida(valor: string): boolean {
  try {
    const url = new URL(valor);
    const protocoloOk = url.protocol === 'http:' || url.protocol === 'https:';
    const hostOk = url.hostname.includes('.') && !/\s/.test(url.href);
    return protocoloOk && hostOk;
  } catch {
    return false;
  }
}

export const referenciaSchema = z.object({
  tipo_fonte: z.enum(TIPO_FONTE_VALORES, {
    errorMap: () => ({ message: 'Selecione o tipo de fonte.' }),
  }),
  nome_fonte: z
    .string()
    .trim()
    .min(3, 'Informe o nome do veículo, parlamentar, jornalista ou personalidade.')
    .max(160, 'Máximo de 160 caracteres.'),
  link_referencia: z
    .string()
    .trim()
    .min(1, 'Cole o link público que comprova o boicote.')
    .refine(
      urlHttpValida,
      'Informe um link público válido, começando com https:// (ou http://).',
    ),
  titulo_referencia: z
    .string()
    .trim()
    .min(5, 'Informe o título da matéria, post ou publicação.')
    .max(200, 'Máximo de 200 caracteres.'),
  data_publicacao: z
    .string()
    .trim()
    .refine(
      (valor) => valor === '' || /^\d{4}-\d{2}-\d{2}$/.test(valor),
      'Use uma data no formato AAAA-MM-DD ou deixe em branco.',
    )
    .optional(),
  descricao_contexto: z
    .string()
    .trim()
    .max(600, 'Máximo de 600 caracteres.')
    .optional(),
});

export type ReferenciaFormValues = z.infer<typeof referenciaSchema>;

const enderecoSchema = z.object({
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido. Use o formato 00000-000.'),
  logradouro: z.string().trim().min(3, 'Informe a rua ou avenida.').max(160),
  numero: z.string().trim().min(1, 'Informe o número (ou "s/n").').max(20),
  complemento: z.string().trim().max(80).optional(),
  bairro: z.string().trim().min(2, 'Informe o bairro.').max(80),
  cidade: z.string().trim().min(2, 'Informe a cidade.').max(80),
  estado: z.enum(UFS, { errorMap: () => ({ message: 'Selecione o estado (UF).' }) }),
  pais: z.string().trim().max(60).optional(),
});

const midiaSchema = z.object({
  tipo: z.enum(TIPOS_MIDIA_VALORES, {
    errorMap: () => ({ message: 'Tipo de mídia inválido.' }),
  }),
  url: z
    .string()
    .trim()
    .refine(urlHttpValida, 'Informe uma URL http(s) válida.'),
  descricao: z.string().trim().max(160).optional(),
});

export const cadastroSchema = z
  .object({
    tipo_cadastro: z.enum(TIPO_CADASTRO_VALORES, {
      errorMap: () => ({ message: 'Selecione o tipo de cadastro.' }),
    }),
    nome_completo: z
      .string()
      .trim()
      .min(5, 'Informe seu nome completo (mínimo de 5 caracteres).')
      .max(160, 'Máximo de 160 caracteres.'),
    nome_publico: z
      .string()
      .trim()
      .min(3, 'Informe o nome público do estabelecimento ou do profissional.')
      .max(160, 'Máximo de 160 caracteres.'),
    /** Opcional. Se preenchido, valida dígitos verificadores. */
    cpf_cnpj: z
      .string()
      .trim()
      .max(20, 'Máximo de 20 caracteres.')
      .refine(
        (valor) => valor === '' || cpfCnpjValido(valor),
        'CPF ou CNPJ inválido. Confira os números digitados ou deixe em branco.',
      )
      .optional(),
    /** Opcional individualmente; exige-se e-mail OU telefone. */
    email: z
      .string()
      .trim()
      .max(160, 'Máximo de 160 caracteres.')
      .refine(
        (valor) => valor === '' || REGEX_EMAIL.test(valor),
        'Informe um e-mail válido.',
      )
      .optional(),
    /** Opcional individualmente; exige-se e-mail OU telefone. */
    telefone: z
      .string()
      .trim()
      .max(20, 'Máximo de 20 caracteres.')
      .refine(
        (valor) =>
          valor === '' ||
          (/^[\d\s()+-]+$/.test(valor) && somenteDigitos(valor).length >= 10),
        'Telefone inválido. Use DDD + número.',
      )
      .optional(),
    categoria: z.enum(CATEGORIA_VALORES, {
      errorMap: () => ({ message: 'Selecione a categoria da atividade.' }),
    }),
    descricao_atividade: z
      .string()
      .trim()
      .min(40, 'Descreva sua atividade com pelo menos 40 caracteres.')
      .max(1200, 'Máximo de 1200 caracteres.'),
    endereco: enderecoSchema,
    situacao_boicote: z
      .string()
      .trim()
      .min(40, 'Conte o que aconteceu com pelo menos 40 caracteres.')
      .max(1500, 'Máximo de 1500 caracteres.'),
    /** URL opcional de foto/logo do estabelecimento. */
    link_midia: z
      .string()
      .trim()
      .refine(
        (valor) => valor === '' || urlHttpValida(valor),
        'Informe uma URL http(s) válida ou deixe em branco.',
      )
      .optional(),
    midia: z
      .array(midiaSchema)
      .max(MAXIMO_REFERENCIAS, 'Máximo de 6 itens de mídia.')
      .optional(),
    referencias: z
      .array(referenciaSchema)
      .min(
        MINIMO_REFERENCIAS,
        `Informe pelo menos ${MINIMO_REFERENCIAS} referências públicas verificáveis.`,
      )
      .max(
        MAXIMO_REFERENCIAS,
        `Máximo de ${MAXIMO_REFERENCIAS} referências por cadastro.`,
      ),
    aceite_termos: z
      .boolean()
      .refine((valor) => valor === true, {
        message: 'É necessário aceitar os termos de uso e a política de privacidade.',
      }),
    aceite_aviso_nao_transferencia: z
      .boolean()
      .refine((valor) => valor === true, {
        message:
          'É necessário confirmar que você entendeu que a plataforma não processa pagamentos.',
      }),
  })
  .superRefine((dados, ctx) => {
    const email = (dados.email ?? '').trim();
    const telefone = (dados.telefone ?? '').trim();

    if (email === '' && telefone === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Informe e-mail ou telefone/WhatsApp (pelo menos um dos dois).',
      });
    }
  });

export type CadastroFormValues = z.infer<typeof cadastroSchema>;

/** Valores iniciais de uma referência vazia (Step 3 exige no mínimo duas). */
export function referenciaVazia(): ReferenciaFormValues {
  return {
    tipo_fonte: 'jornal',
    nome_fonte: '',
    link_referencia: '',
    titulo_referencia: '',
    data_publicacao: '',
    descricao_contexto: '',
  };
}

export function valoresIniciaisCadastro(): CadastroFormValues {
  return {
    tipo_cadastro: 'comerciante',
    nome_completo: '',
    nome_publico: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    categoria: 'alimentacao',
    descricao_atividade: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: 'SP',
      pais: 'Brasil',
    },
    situacao_boicote: '',
    link_midia: '',
    midia: [],
    referencias: [referenciaVazia(), referenciaVazia()],
    aceite_termos: false,
    aceite_aviso_nao_transferencia: false,
  };
}
