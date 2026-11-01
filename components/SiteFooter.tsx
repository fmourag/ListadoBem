import Link from 'next/link';
import { HandHeart, ShieldCheck } from 'lucide-react';

import { AvisoNaoTransferencia } from './AvisoNaoTransferencia';

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
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-esmeralda-600">
              <HandHeart aria-hidden="true" className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-black uppercase tracking-wide text-ouro-300">
              Rede de Apoio
            </span>
          </div>
          <p className="text-sm leading-relaxed text-marinho-300">
            Um diretório independente de comerciantes, prestadores de serviço, artesãos e figuras
            públicas que sofreram boicote ideológico. Existimos para reconectar pessoas a quem
            produz — sem intermediar pagamentos e sem cobrar por cadastro.
          </p>
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
          <p>© {new Date().getFullYear()} Rede de Apoio. Cadastro sempre gratuito.</p>
        </div>
      </div>
    </footer>
  );
}

