import 'server-only';

import { criarSupabaseAdmin, supabaseAdminConfigurado } from './supabase-admin';

export type TipoEvento = 'acesso' | 'cadastro' | 'falha' | 'moderacao' | 'contribuicao';

export interface EventoApp {
  tipo: TipoEvento;
  rota?: string | null;
  status?: string | null;
  detalhe?: Record<string, unknown>;
}

/**
 * Registra um evento operacional no banco.
 *
 * É best-effort: qualquer falha (tabela ainda não migrada, rede, credencial)
 * é ignorada para nunca quebrar o fluxo principal. Não grave dados pessoais
 * aqui — use apenas rota, status e identificadores internos.
 */
export async function registrarEvento(evento: EventoApp): Promise<void> {
  if (!supabaseAdminConfigurado()) return;

  try {
    const { error } = await criarSupabaseAdmin()
      .from('eventos_app')
      .insert({
        tipo: evento.tipo,
        rota: evento.rota?.slice(0, 200) ?? null,
        status: evento.status?.slice(0, 60) ?? null,
        detalhe: evento.detalhe ?? {},
      });

    if (error) {
      // Tabela ausente durante a janela de migração: não poluir logs.
      if (error.code !== '42P01' && error.code !== 'PGRST205') {
        console.warn('[eventos] falha ao registrar:', error.message);
      }
    }
  } catch {
    // Best effort.
  }
}
