/**
 * Domínio "Listado Bem" / Rede de Apoio — tipos compartilhados pelo app.
 *
 * Espelham o schema de `supabase-schema.sql`. Ficavam no pacote compartilhado
 * do monorepo original; agora são locais para o app ser 100% autônomo.
 */

/** Como o cadastro se apresenta no diretório. */
export type TipoCadastroBoicote =
  | 'comerciante'
  | 'prestador_servico'
  | 'artesao'
  | 'profissional_liberal'
  | 'figura_publica'
  | 'acao_social';

/** Ciclo de vida editorial do cadastro. Só "aprovado" aparece publicamente. */
export type StatusCadastroBoicote = 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso';

/** Natureza da fonte que comprova o boicote. */
export type TipoFonteReferencia =
  | 'jornal'
  | 'blog'
  | 'parlamentar'
  | 'jornalista'
  | 'personalidade';

/** Categoria da atividade econômica (mesmos valores do CHECK no Postgres). */
export type CategoriaBoicote =
  | 'alimentacao'
  | 'beleza_e_estetica'
  | 'construcao'
  | 'educacao'
  | 'saude'
  | 'tecnologia'
  | 'moda'
  | 'servicos'
  | 'artesanato'
  | 'entretenimento'
  | 'transporte'
  | 'outro';

/** Tipo de mídia de apresentação (foto, vídeo, logo, documento). */
export type TipoMidiaBoicote = 'foto' | 'video' | 'logo' | 'documento';

/** Endereço de atendimento, armazenado como JSONB em `cadastros_boicote.endereco`. */
export interface EnderecoBoicote {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string | null;
  bairro?: string;
  cidade: string;
  estado: string;
  pais?: string;
}

/** Item de mídia, armazenado como elemento do array JSONB `midia`. */
export interface MidiaBoicote {
  tipo: TipoMidiaBoicote;
  url: string;
  descricao?: string | null;
}

/** Referência pública que comprova o boicote (tabela `referencias_publicas`). */
export interface ReferenciaPublica {
  id: string;
  cadastro_id: string;
  tipo_fonte: TipoFonteReferencia;
  nome_fonte: string;
  link_referencia: string;
  titulo_referencia: string;
  /** Data no formato ISO `AAAA-MM-DD`, quando informada. */
  data_publicacao: string | null;
  descricao_contexto: string | null;
  criado_em: string;
}

/** Cadastro completo (tabela `cadastros_boicote`), sem as referências. */
export interface CadastroBoicote {
  id: string;
  tipo_cadastro: TipoCadastroBoicote;
  nome_completo: string;
  nome_publico: string;
  /** Somente dígitos: 11 (CPF) ou 14 (CNPJ). Opcional; nunca exibir publicamente. */
  cpf_cnpj: string | null;
  /** E-mail opcional, desde que exista telefone (e vice-versa). */
  email: string | null;
  telefone: string | null;
  categoria: CategoriaBoicote;
  descricao_atividade: string;
  endereco: EnderecoBoicote;
  situacao_boicote: string;
  midia: MidiaBoicote[];
  status: StatusCadastroBoicote;
  criado_em: string;
  atualizado_em: string;
}

/** Cadastro com as referências públicas embutidas (join da listagem). */
export interface CadastroBoicoteComReferencias extends CadastroBoicote {
  referencias_publicas: ReferenciaPublica[];
}



