import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

/**
 * Sessão do painel de moderação.
 *
 * Em vez de carregar a `ADMIN_SECRET` na URL (logs, histórico, Referer), o
 * login troca a senha por um token HMAC derivado do segredo e o guarda em um
 * cookie `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, com 1 hora de vida.
 *
 * - O segredo nunca vai ao browser.
 * - Comparações usam `timingSafeEqual` (tempo constante).
 * - Trocar `ADMIN_SECRET` invalida todas as sessões existentes.
 */

export const ADMIN_COOKIE = 'admin_session';
const TOKEN_CONTEXTO = 'listado-bem:admin-session:v1';
const MAX_AGE_SEGUNDOS = 60 * 60;

const OPCOES_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: MAX_AGE_SEGUNDOS,
};

function segredoConfigurado(): string | null {
  const valor = process.env.ADMIN_SECRET?.trim();
  return valor && valor.length > 0 ? valor : null;
}

/** `true` quando a variável existe no servidor (sem expor o valor). */
export function adminConfigurado(): boolean {
  return segredoConfigurado() !== null;
}

function tokenEsperado(segredo: string): string {
  return createHmac('sha256', segredo).update(TOKEN_CONTEXTO).digest('hex');
}

/** Compara a senha digitada com `ADMIN_SECRET` em tempo constante. */
export function compararSegredo(recebido: string): boolean {
  const esperado = segredoConfigurado();
  if (!esperado) return false;

  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function lerCookie(header: string | null, nome: string): string | undefined {
  if (!header) return undefined;
  const partes = header.split(';');
  for (const parte of partes) {
    const [chave, ...resto] = parte.trim().split('=');
    if (chave === nome) {
      try {
        return decodeURIComponent(resto.join('='));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/**
 * Valida a sessão a partir de um `Request`/`Headers` (Route Handlers) ou,
 * sem argumento, do cookie da requisição atual (Server Components/Actions).
 */
export function verifyAdminSession(entrada?: Request | Headers): boolean {
  const segredo = segredoConfigurado();
  if (!segredo) return false;

  let valor: string | undefined;
  if (entrada) {
    const headers = entrada instanceof Headers ? entrada : entrada.headers;
    valor = lerCookie(headers.get('cookie'), ADMIN_COOKIE);
  } else {
    valor = cookies().get(ADMIN_COOKIE)?.value;
  }

  if (!valor) return false;

  const a = Buffer.from(valor);
  const b = Buffer.from(tokenEsperado(segredo));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Define o cookie de sessão (Server Action/Route Handler). */
export function setAdminSession(res?: NextResponse): void {
  const segredo = segredoConfigurado();
  if (!segredo) return;
  const token = tokenEsperado(segredo);
  if (res) {
    res.cookies.set(ADMIN_COOKIE, token, OPCOES_COOKIE);
    return;
  }
  cookies().set({ name: ADMIN_COOKIE, value: token, ...OPCOES_COOKIE });
}

/** Expira o cookie de sessão. */
export function clearAdminSession(res?: NextResponse): void {
  if (res) {
    res.cookies.set(ADMIN_COOKIE, '', { ...OPCOES_COOKIE, maxAge: 0 });
    return;
  }
  cookies().set({ name: ADMIN_COOKIE, value: '', ...OPCOES_COOKIE, maxAge: 0 });
}
