import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Versão em produção. A Vercel injeta VERCEL_GIT_COMMIT_SHA no build/runtime;
 * localmente retorna null. Usado pelo republicar-listado-bem.bat para saber
 * quando o deploy da versão enviada terminou.
 */
export function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  return NextResponse.json(
    {
      commit,
      short: commit ? commit.slice(0, 7) : null,
      env: process.env.VERCEL_ENV ?? 'local',
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
