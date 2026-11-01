import type { Metadata, Viewport } from 'next';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://rede-de-apoio.vercel.app'),
  title: {
    default: 'Rede de Apoio — diretório de quem foi boicotado por ideologia',
    template: '%s | Rede de Apoio',
  },
  description:
    'Diretório gratuito de comerciantes, prestadores de serviço, artesãos e figuras públicas vítimas de boicote ideológico. Cadastro verificado por referências públicas. A plataforma não processa pagamentos: compre direto do estabelecimento.',
  keywords: [
    'boicote ideológico',
    'diretório de comércios',
    'apoio a comerciantes',
    'compre direto',
    'rede de apoio',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Rede de Apoio',
    title: 'Rede de Apoio — diretório de quem foi boicotado por ideologia',
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

