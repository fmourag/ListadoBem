import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import { fonteCursiva } from '@/lib/fonts';

import { AvisoNaoTransferencia } from './AvisoNaoTransferencia';
import { LogoListaDoBem } from './LogoListaDoBem';

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-marinho-950 text-marinho-100">
      <div className="border-b border-marinho-800/60 bg-perigo-800">
        <div className="container-page py-3">
          <AvisoNaoTransferencia variante="compacto" />
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <LogoListaDoBem id="footer" className="h-9 w-9 shrink-0" />
            <span
              className={`${fonteCursiva.className} text-2xl leading-none text-ouro-300`}
            >
              Lista do Bem
            </span>
          </div>
          <p className="text-sm leading-relaxed text-marinho-300">
            Um diretório independente de comerciantes, prestadores de serviço, artesãos e figuras
            públicas que sofreram boicote ideológico. Existimos para reconectar pessoas a quem
            produz — sem intermediar pagamentos e sem cobrar por cadastro.
          </p>

          <div className="flex items-center gap-3 rounded-xl border border-marinho-800 bg-marinho-900/60 p-2.5">
            <a
              href="/apoie/qr"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-white p-1"
              aria-label="Abrir QR Code PIX em tamanho real"
            >
              <img
                src="/apoie/qr"
                alt="QR Code PIX para contribuição voluntária"
                width={76}
                height={76}
                loading="lazy"
                className="h-[76px] w-[76px]"
              />
            </a>
            <div className="text-xs leading-snug">
              <p className="font-bold text-white">Contribuição voluntária</p>
              <p className="mt-0.5 text-marinho-300">Aponte a câmera do banco. Qualquer valor.</p>
              <Link
                href="/apoie"
                className="mt-1 inline-block font-semibold text-ouro-300 underline decoration-ouro-300/40 underline-offset-2 hover:text-ouro-200"
              >
                Apoie via PIX
              </Link>
            </div>
          </div>
        </div>

        <nav aria-label="Navegação do rodapé" className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-marinho-400">Navegar</p>
          <Link href="/" className="block text-marinho-200 transition hover:text-white">
            Início
          </Link>
          <Link href="/listagem" className="block text-marinho-200 transition hover:text-white">
            Estabelecimentos verificados
          </Link>
          <Link href="/cadastro" className="block text-marinho-200 transition hover:text-white">
            Cadastrar meu negócio
          </Link>
          <Link href="/apoie" className="block text-marinho-200 transition hover:text-white">
            Apoie a iniciativa
          </Link>
          <p className="pt-2 text-xs text-marinho-400">
            <Link href="/termos" className="transition hover:text-white">
              Termos de Uso
            </Link>
            <span aria-hidden="true"> · </span>
            <Link href="/privacidade" className="transition hover:text-white">
              Política de Privacidade
            </Link>
          </p>
        </nav>

        <div className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-marinho-400">
            Regras de segurança
          </p>
          <p className="flex items-start gap-2 text-marinho-200">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-esmeralda-400" />
            A plataforma não intermedia pagamentos entre você e o estabelecimento.
          </p>
          <p className="text-marinho-300">
            Todo contato e pagamento acontecem direto entre você e o estabelecimento escolhido. Contribuições para manutenção são facultativas e não dão benefício.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-marinho-400">
            Transparência
          </p>
          <p className="text-marinho-300">
            Cadastros passam por análise e só aparecem publicamente com o status
            <span className="mx-1 rounded bg-esmeralda-700 px-1.5 py-0.5 text-xs font-bold text-white">
              aprovado
            </span>
            .
          </p>
          <p className="text-marinho-300">
            Cada anúncio exige no mínimo 2 referências públicas verificáveis.
          </p>
        </div>
      </div>

      <div className="border-t border-marinho-800/60">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-marinho-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Projeto independente, sem fins partidários. Conteúdo informativo e gratuito.</p>
          <p>© {new Date().getFullYear()} Lista do Bem. Cadastro sempre gratuito.</p>
        </div>
      </div>
    </footer>
  );
}



