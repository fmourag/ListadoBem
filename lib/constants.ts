import type {
  CategoriaBoicote,
  TipoCadastroBoicote,
  TipoFonteReferencia,
} from './tipos-dominio';

/**
 * Valores canônicos do domínio, usados tanto pelo Zod (client + server)
 * quanto pelos selects da interface. Os tipos estão em `./tipos-dominio`;
 * as listas abaixo são checadas contra eles em tempo de compilação.
 */

export const TIPO_CADASTRO_VALORES = [
  'comerciante',
  'prestador_servico',
  'artesao',
  'profissional_liberal',
  'figura_publica',
] as const;

export const CATEGORIA_VALORES = [
  'alimentacao',
  'beleza_e_estetica',
  'construcao',
  'educacao',
  'saude',
  'tecnologia',
  'moda',
  'servicos',
  'artesanato',
  'entretenimento',
  'transporte',
  'outro',
] as const;

export const TIPO_FONTE_VALORES = [
  'jornal',
  'blog',
  'parlamentar',
  'jornalista',
  'personalidade',
] as const;

export type TipoCadastroValor = (typeof TIPO_CADASTRO_VALORES)[number];
export type CategoriaValor = (typeof CATEGORIA_VALORES)[number];
export type TipoFonteValor = (typeof TIPO_FONTE_VALORES)[number];

const ROTULOS_TIPO_CADASTRO: Record<
  TipoCadastroValor,
  { rotulo: string; descricao: string }
> = {
  comerciante: {
    rotulo: 'Comerciante',
    descricao: 'Loja física, bar, restaurante, mercadinho ou ateliê com ponto comercial.',
  },
  prestador_servico: {
    rotulo: 'Prestador(a) de serviço',
    descricao: 'Manutenção, beleza, consultoria, reformas, aulas ou transporte.',
  },
  artesao: {
    rotulo: 'Artesão / artesã',
    descricao: 'Produção artesanal, costura, cerâmica, arte e trabalhos manuais.',
  },
  profissional_liberal: {
    rotulo: 'Profissional liberal',
    descricao: 'Advocacia, contabilidade, psicologia, odontologia, arquitetura e autônomos.',
  },
  figura_publica: {
    rotulo: 'Figura pública',
    descricao: 'Artista, comunicador(a), influenciador(a) ou profissional com atuação pública.',
  },
};

const ROTULOS_CATEGORIA: Record<CategoriaValor, string> = {
  alimentacao: 'Alimentação',
  beleza_e_estetica: 'Beleza e estética',
  construcao: 'Construção e reformas',
  educacao: 'Educação e cursos',
  saude: 'Saúde e bem-estar',
  tecnologia: 'Tecnologia e serviços digitais',
  moda: 'Moda e vestuário',
  servicos: 'Serviços gerais',
  artesanato: 'Artesanato',
  entretenimento: 'Cultura e entretenimento',
  transporte: 'Transporte',
  outro: 'Outro',
};

const ROTULOS_TIPO_FONTE: Record<TipoFonteValor, string> = {
  jornal: 'Jornal / veículo de imprensa',
  blog: 'Blog ou site de notícias',
  parlamentar: 'Parlamentar',
  jornalista: 'Jornalista',
  personalidade: 'Personalidade pública',
};

export const TIPOS_CADASTRO = TIPO_CADASTRO_VALORES.map((valor) => ({
  valor,
  ...ROTULOS_TIPO_CADASTRO[valor],
})) satisfies ReadonlyArray<{
  valor: TipoCadastroBoicote;
  rotulo: string;
  descricao: string;
}>;

export const CATEGORIAS = CATEGORIA_VALORES.map((valor) => ({
  valor,
  rotulo: ROTULOS_CATEGORIA[valor],
})) satisfies ReadonlyArray<{ valor: CategoriaBoicote; rotulo: string }>;

export const TIPOS_FONTE = TIPO_FONTE_VALORES.map((valor) => ({
  valor,
  rotulo: ROTULOS_TIPO_FONTE[valor],
})) satisfies ReadonlyArray<{ valor: TipoFonteReferencia; rotulo: string }>;

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type UfBrasil = (typeof UFS)[number];

/** Nomes completos das unidades federativas, para exibição em filtros. */
export const NOME_UF: Readonly<Record<UfBrasil, string>> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

export const MINIMO_REFERENCIAS = 2;
export const MAXIMO_REFERENCIAS = 6;
