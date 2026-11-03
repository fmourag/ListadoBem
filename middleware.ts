import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

/**
 * Conta acessos às páginas públicas sem JavaScript no cliente e sem dados
 * pessoais (apenas rota e horário). O dashboard lê a tabela `eventos_app`.
 *
 * A gravação roda em `event.waitUntil`, fora do caminho crítico da resposta.
 * Se a tabela ainda não existir (migração pendente), o fetch falha em silêncio.
 */
function registrarAcesso(caminho: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !chave) return Promise.resolve();

  return fetch(`${url}/rest/v1/eventos_app`, {
    method: 'POST',
    headers: {
      apikey: chave,
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      tipo: 'acesso',
      rota: caminho.slice(0, 200),
      status: 'ok',
      detalhe: {},
    }),
    signal: AbortSignal.timeout(3000),
  })
    .then(() => undefined)
    .catch(() => undefined);
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.method !== 'GET') return NextResponse.next();

  const prefetch =
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch';
  if (prefetch) return NextResponse.next();

  event.waitUntil(registrarAcesso(request.nextUrl.pathname));
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/listagem', '/cadastro', '/apoie', '/termos', '/privacidade'],
};
