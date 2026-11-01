import type {
  CategoriaBoicote,
  EnderecoBoicote,
  ReferenciaPublica,
  TipoCadastroBoicote,
} from './tipos-dominio';

/** Projeção usada na listagem pública (somente registros aprovados). */
export type ReferenciaResumo = Pick<
  ReferenciaPublica,
  | 'id'
  | 'tipo_fonte'
  | 'nome_fonte'
  | 'link_referencia'
  | 'titulo_referencia'
  | 'data_publicacao'
>;

export interface EstabelecimentoListado {
  id: string;
  nome_publico: string;
  tipo_cadastro: TipoCadastroBoicote;
  categoria: CategoriaBoicote;
  descricao_atividade: string;
  endereco: EnderecoBoicote | null;
  situacao_boicote: string | null;
  criado_em: string;
  referencias_publicas: ReferenciaResumo[];
}

/** Resposta padronizada da API de cadastro. */
export interface RespostaCadastro {
  ok: boolean;
  mensagem: string;
  id?: string;
  status?: string;
  erros?: Record<string, string[] | undefined>;
}
