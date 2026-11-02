import type { Metadata, Viewport } from 'next';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://listado-bem.vercel.app'),
  title: {
    default: 'Lista do Bem — Proteja o Próximo da Intolerância',
    template: '%s | Lista do Bem',
  },
  description:
    'Lista do Bem é um diretório gratuito de comerciantes, prestadores de serviço, artesãos e figuras públicas vítimas de boicote ideológico. Cadastro verificado por referências públicas. A plataforma não processa pagamentos: compre direto do estabelecimento.',
  keywords: [
    'boicote ideológico',
    'diretório de comércios',
    'apoio a comerciantes',
    'compre direto',
    'lista do bem',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Lista do Bem',
    title: 'Lista do Bem — Proteja o Próximo da Intolerância',
    description:
      'Encontre e apoie comerciantes, prestadores de serviço, artesãos e figuras públicas boicotadas. 100% gratuito, sem intermediação de pagamentos.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1e33',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-white text-marinho-900 antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ouro-300 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-marinho-950"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}


