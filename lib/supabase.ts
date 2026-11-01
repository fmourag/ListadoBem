import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase do app web.
 *
 * Regra de segurança: este app usa SOMENTE a chave pública (ANON_KEY).
 * A SUPABASE_SERVICE_ROLE_KEY ignora o RLS e não é referenciada em lugar
 * nenhum de `este app` — nem em variáveis de ambiente do projeto.
 */

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

const MENSAGEM_CONFIG =
  'Supabase não configurado. Crie .env.local a partir de .env.local.example e preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.';

function lerCredenciaisPublicas(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new SupabaseConfigError(MENSAGEM_CONFIG);
  }

  return { url, anonKey };
}

/** `true` quando as variáveis públicas estão presentes no ambiente atual. */
export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

let clienteNavegador: SupabaseClient | null = null;

/**
 * Cliente para Client Components. É um singleton para não recriar
 * conexões a cada render. Só usa a ANON_KEY e continua sujeito ao RLS.
 */
export function obterSupabaseBrowser(): SupabaseClient {
  if (clienteNavegador) return clienteNavegador;

  const { url, anonKey } = lerCredenciaisPublicas();
  clienteNavegador = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return clienteNavegador;
}

/**
 * Cliente para Server Components e Route Handlers. Não persiste sessão:
 * cada requisição é independente e anônima (o RLS decide o que é visível).
 */
export function criarSupabaseServer(): SupabaseClient {
  const { url, anonKey } = lerCredenciaisPublicas();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'rede-de-apoio-web/1.0',
      },
      // O Data Cache do Next pode guardar o resultado de um GET feito durante o
      // build e servi-lo depois — isso escondia cadastros recém-aprovados.
      // O diretório precisa refletir o banco em tempo real, então nunca cacheia.
      fetch: (entrada: RequestInfo | URL, init?: RequestInit) =>
        fetch(entrada, { ...init, cache: 'no-store' }),
    },
  });
}

