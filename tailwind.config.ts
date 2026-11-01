import type { Config } from 'tailwindcss';

/**
 * Paleta sóbria e patriótica:
 * - marinho: autoridade, seriedade institucional;
 * - esmeralda: apoio, verificação, "tudo certo";
 * - ouro: destaque e alertas informativos;
 * - perigo: avisos críticos de não transferência financeira.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        marinho: {
          50: '#eef3f9',
          100: '#d8e3ef',
          200: '#b4c8de',
          300: '#88a6c6',
          400: '#5d82ac',
          500: '#3f6490',
          600: '#2f4d73',
          700: '#263d5c',
          800: '#1b2d45',
          900: '#0b1e33',
          950: '#061424',
        },
        esmeralda: {
          50: '#ecfdf3',
          100: '#d1fae0',
          200: '#a7f3c3',
          300: '#6ee7a4',
          400: '#34d383',
          500: '#10b96a',
          600: '#059652',
          700: '#047a45',
          800: '#05603a',
          900: '#054f33',
        },
        ouro: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5c518',
          600: '#d9a406',
          700: '#b47f07',
          800: '#91620b',
          900: '#78500c',
        },
        perigo: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(11 30 51 / 0.05), 0 8px 24px -12px rgb(11 30 51 / 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
