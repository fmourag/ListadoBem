/** @type {import('next').NextConfig} */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));

/**
 * Content Security Policy.
 *
 * `unsafe-inline` em script/style é uma concessão consciente: o Next injeta
 * scripts de hidratação e estilos inline. `unsafe-eval` NÃO é usado em produção
 * (apenas no dev, onde o webpack precisa dele).
 *
 * Validação: primeiro rode com `CSP_ENFORCE = false` (Report-Only) e confira
 * que não há violações; depois mude para `true` (enforce).
 */
const CSP_ENFORCE = true;

const isDev = process.env.NODE_ENV !== 'production';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
let supabaseOrigins = 'https://*.supabase.co';
try {
  if (supabaseUrl) supabaseOrigins += ` ${new URL(supabaseUrl).origin}`;
} catch {
  // URL inválida em build: mantém apenas o curinga do Supabase.
}

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigins}${isDev ? ' ws: wss:' : ''}`,
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Não bloqueia o build; o typecheck roda separado (`npm run typecheck`).
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: RAIZ,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: CSP_ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
            value: csp,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
