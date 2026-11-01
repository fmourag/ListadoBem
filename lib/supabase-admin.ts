import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente administrativo do Supabase (service role).
 *
 * ⚠️ SEGURANÇA
 * - Este módulo é marcado com `server-only`: importá-lo de um Client Component
 *   quebra o build de propósito, para que a chave nunca chegue ao browser.
 * - A `SUPABASE_SERVICE_ROLE_KEY` ignora o RLS. Ela só pode ser usada em
 *   Route Handlers, Server Components de moderação e scripts server-side.
 * - Nunca prefixe a variável com `NEXT_PUBLIC_`.
 *
 * Uso atual: `POST /api/cadastro` grava o cadastro e as referências de forma
 * atômica o suficiente (com compensação em caso de falha), e consegue detectar
 * duplicidade inclusive entre cadastros ainda pendentes.
 */

export class SupabaseAdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseAdminConfigError';
  }
}

const MENSAGEM_CONFIG =
  'Supabase admin não configurado. Defina SUPABASE_SERVICE_ROLE_KEY (somente server-side) e NEXT_PUBLIC_SUPABASE_URL no ambiente do servidor.';

/** `true` quando URL pública e service role key estão presentes no servidor. */
export function supabaseAdminConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

let clienteAdmin: SupabaseClient | null = null;

/**
 * Cria (ou reutiliza) o cliente com service role.
 * Lança `SupabaseAdminConfigError` quando as variáveis não existem.
 */
export function criarSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !chave) {
    throw new SupabaseAdminConfigError(MENSAGEM_CONFIG);
  }

  if (clienteAdmin) return clienteAdmin;

  clienteAdmin = createClient(url, chave, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'rede-de-apoio-admin/1.0',
      },
    },
  });

  return clienteAdmin;
}
