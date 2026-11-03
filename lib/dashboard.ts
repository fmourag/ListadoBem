import 'server-only';

import { criarSupabaseAdmin } from './supabase-admin';

export const STATUS = ['pendente', 'aprovado', 'rejeitado', 'suspenso'] as const;
export type Status = (typeof STATUS)[number];

export const ROTULO_STATUS: Record<Status, string> = {
  pendente: 'Pendentes',
  aprovado: 'Aprovados',
  rejeitado: 'Rejeitados',
  suspenso: 'Suspensos',
};

const TZ = 'America/Sao_Paulo';
const DIAS_GRAFICO = 14;

export interface CadastroResumo {
  id: string;
  nome_publico: string;
  status: string;
  criado_em: string;
}

export interface EventoResumo {
  tipo: string;
  rota: string | null;
  status: string | null;
  criado_em: string;
}

export interface DashboardDados {
  total: number;
  porStatus: Record<Status, number>;
  totalReferencias: number;
  mediaReferencias: number;
  taxaAprovacao: number;
  cadastros7: number;
  cadastros30: number;
  acessos7: number;
  acessos30: number;
  acessosApoie30: number;
  falhas7: number;
  falhas30: number;
  moderacoes30: number;
  dadosCadastros: { rotulo: string; valor: number }[];
  dadosAcessos: { rotulo: string; valor: number }[];
  recentes: CadastroResumo[];
  ultimasFalhas: EventoResumo[];
  erroCadastros: string | null;
  eventosDisponiveis: boolean;
  versao: string;
  ambiente: string;
  atualizadoEm: string;
}

function chaveDia(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function rotuloDia(chave: string): string {
  const [, mes, dia] = chave.split('-');
  return `${dia}/${mes}`;
}

function desde(dias: number): number {
  return Date.now() - dias * 24 * 60 * 60 * 1000;
}

export async function carregarDashboard(): Promise<DashboardDados> {
  let cadastros: CadastroResumo[] = [];
  let referencias: { id: string }[] = [];
  let eventos: EventoResumo[] = [];
  let erroCadastros: string | null = null;
  let eventosDisponiveis = true;

  try {
    const supabase = criarSupabaseAdmin();
    const inicio30 = new Date(desde(30)).toISOString();

    const [resCadastros, resReferencias, resEventos] = await Promise.all([
      supabase
        .from('cadastros_boicote')
        .select('id, nome_publico, status, criado_em')
        .order('criado_em', { ascending: false }),
      supabase.from('referencias_publicas').select('id'),
      supabase
        .from('eventos_app')
        .select('tipo, rota, status, criado_em')
        .gte('criado_em', inicio30)
        .order('criado_em', { ascending: false })
        .limit(5000),
    ]);

    if (resCadastros.error) erroCadastros = resCadastros.error.message;
    cadastros = (resCadastros.data ?? []) as CadastroResumo[];
    referencias = (resReferencias.data ?? []) as { id: string }[];
    if (resEventos.error) eventosDisponiveis = false;
    eventos = (resEventos.data ?? []) as EventoResumo[];
  } catch (erro) {
    erroCadastros = erro instanceof Error ? erro.message : 'erro desconhecido';
  }

  const total = cadastros.length;
  const porStatus = Object.fromEntries(STATUS.map((s) => [s, 0])) as Record<Status, number>;
  for (const cadastro of cadastros) {
    if (STATUS.includes(cadastro.status as Status)) {
      porStatus[cadastro.status as Status] += 1;
    }
  }

  const totalReferencias = referencias.length;
  const mediaReferencias = total > 0 ? totalReferencias / total : 0;
  const taxaAprovacao = total > 0 ? (porStatus.aprovado / total) * 100 : 0;
  const cadastros7 = cadastros.filter((c) => new Date(c.criado_em).getTime() >= desde(7)).length;
  const cadastros30 = cadastros.filter((c) => new Date(c.criado_em).getTime() >= desde(30)).length;

  const acessos = eventos.filter((e) => e.tipo === 'acesso');
  const acessos7 = acessos.filter((e) => new Date(e.criado_em).getTime() >= desde(7)).length;
  const acessosApoie30 = acessos.filter(
    (e) => e.rota?.startsWith('/apoie') && new Date(e.criado_em).getTime() >= desde(30),
  ).length;
  const falhas30 = eventos.filter((e) => e.tipo === 'falha');
  const falhas7 = falhas30.filter((e) => new Date(e.criado_em).getTime() >= desde(7)).length;
  const moderacoes30 = eventos.filter((e) => e.tipo === 'moderacao').length;

  const dias = Array.from({ length: DIAS_GRAFICO }, (_, indice) => {
    const data = new Date();
    data.setDate(data.getDate() - (DIAS_GRAFICO - 1 - indice));
    return chaveDia(data.toISOString());
  });

  const cadastrosPorDia = new Map(dias.map((dia) => [dia, 0]));
  for (const cadastro of cadastros) {
    const dia = chaveDia(cadastro.criado_em);
    if (cadastrosPorDia.has(dia)) cadastrosPorDia.set(dia, (cadastrosPorDia.get(dia) ?? 0) + 1);
  }

  const acessosPorDia = new Map(dias.map((dia) => [dia, 0]));
  for (const acesso of acessos) {
    const dia = chaveDia(acesso.criado_em);
    if (acessosPorDia.has(dia)) acessosPorDia.set(dia, (acessosPorDia.get(dia) ?? 0) + 1);
  }

  return {
    total,
    porStatus,
    totalReferencias,
    mediaReferencias,
    taxaAprovacao,
    cadastros7,
    cadastros30,
    acessos7,
    acessos30: acessos.length,
    acessosApoie30,
    falhas7,
    falhas30: falhas30.length,
    moderacoes30,
    dadosCadastros: dias.map((dia) => ({
      rotulo: rotuloDia(dia),
      valor: cadastrosPorDia.get(dia) ?? 0,
    })),
    dadosAcessos: dias.map((dia) => ({
      rotulo: rotuloDia(dia),
      valor: acessosPorDia.get(dia) ?? 0,
    })),
    recentes: cadastros.slice(0, 8),
    ultimasFalhas: falhas30.slice(0, 5),
    erroCadastros,
    eventosDisponiveis,
    versao: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    ambiente: process.env.VERCEL_ENV ?? 'local',
    atualizadoEm: new Date().toISOString(),
  };
}
