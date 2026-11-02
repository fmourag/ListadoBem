import { Dancing_Script } from 'next/font/google';

/**
 * Fonte cursiva da marca.
 *
 * `next/font` baixa e auto-hospeda no build: nenhuma requisição a
 * fonts.googleapis.com em runtime. Peso 700 garante leitura em 32–44 px.
 */
export const fonteCursiva = Dancing_Script({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
});
