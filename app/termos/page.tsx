import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso — Listado Bem',
  description:
    'Regras de uso do diretório Lista do Bem: cadastro gratuito, uma referência pública, curadoria e aviso de que a plataforma não processa pagamentos.',
  alternates: { canonical: '/termos' },
};

const ATUALIZADO_EM = '1 de novembro de 2026';

export default function TermosPage() {
  return (
    <div className="container-page py-12 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
          Documento legal
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-marinho-950 sm:text-4xl">
          Termos de Uso
        </h1>
        <p className="mt-3 text-sm text-marinho-600">
          Última atualização: {ATUALIZADO_EM}. Leia com atenção antes de usar o diretório ou
          enviar um cadastro.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-ouro-300 bg-ouro-50 p-4">
          <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-perigo-700" />
          <p className="text-sm font-semibold leading-relaxed text-marinho-900">
            A Lista do Bem é apenas um diretório. Ela não processa pagamentos, não recebe
            transferências em nome de estabelecimentos e não cobra por cadastro. Compre e pague
            diretamente ao estabelecimento escolhido.
          </p>
        </div>

        <nav aria-label="Índice dos termos" className="mt-8 rounded-xl border border-marinho-100 bg-marinho-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-marinho-500">Nesta página</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-5 text-sm text-marinho-700 sm:grid-cols-2">
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#aceitacao">Aceitação</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#objeto">Objeto</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#cadastro">Cadastro e referências</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#conteudo">Conteúdo do usuário</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#contribuicao">Contribuição facultativa</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#propriedade">Propriedade intelectual</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#responsabilidade">Limitação de responsabilidade</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#alteracoes">Alterações</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#foro">Lei e foro</a></li>
            <li><a className="underline decoration-marinho-200 underline-offset-2 hover:text-marinho-950" href="#contato">Contato</a></li>
          </ol>
        </nav>

        <section id="aceitacao" className="scroll-mt-40 sm:scroll-mt-28 mt-10">
          <h2 className="text-xl font-bold text-marinho-950">1. Aceitação dos termos</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Ao acessar o site, consultar a listagem ou enviar um cadastro, você concorda com estes
            Termos de Uso e com a{' '}
            <Link href="/privacidade" className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900">
              Política de Privacidade
            </Link>
            . Se não concordar, não utilize a plataforma.
          </p>
        </section>

        <section id="objeto" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">2. Objeto da plataforma</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            A Lista do Bem é um diretório informativo, gratuito e independente de comerciantes,
            prestadores de serviço, artesãos, profissionais liberais, figuras públicas e ações
            sociais que relatam boicote ideológico. O objetivo é dar visibilidade e facilitar o
            contato direto entre o público e esses negócios.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>A plataforma <strong>não vende</strong> produtos ou serviços.</li>
            <li>A plataforma <strong>não processa pagamentos</strong> nem intermedeia valores.</li>
            <li>A plataforma <strong>não cobra</strong> taxa de cadastro, mensalidade ou destaque.</li>
            <li>O contato e o pagamento acontecem diretamente com o estabelecimento.</li>
          </ul>
        </section>

        <section id="cadastro" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">3. Cadastro e referências</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Para publicar um cadastro é necessário informar dados de identificação, um meio de
            contato opcional (e-mail ou telefone) e <strong>no mínimo uma referência pública</strong> que
            comprove o episódio relatado.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>CPF ou CNPJ é opcional e nunca é exibido publicamente.</li>
            <li>As referências precisam ter link público acessível e tratar do caso.</li>
            <li>Todo cadastro passa por curadoria humana antes de ser publicado.</li>
            <li>A aprovação pode ser recusada sem obrigação de justificativa detalhada.</li>
          </ul>
        </section>

        <section id="conteudo" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">4. Conteúdo do usuário</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Você é responsável pelo conteúdo que envia. Ao cadastrar, declara que as informações
            são verdadeiras, que as referências existem e que o texto não é difamatório, ilícito
            ou ofensivo.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Podemos remover conteúdo que viole estes termos, a lei ou direitos de terceiros, bem
            como suspender cadastros que apresentem indícios de fraude.
          </p>
        </section>

        <section id="contribuicao" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">5. Contribuição facultativa</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            A plataforma oferece uma contribuição via PIX para custear infraestrutura e
            manutenção. Ela é regida pelas seguintes cláusulas:
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>Não é pagamento por cadastro.</li>
            <li>Não é transferência para estabelecimentos.</li>
            <li>Não é obrigatória.</li>
            <li>Não desbloqueia benefícios: a listagem continua pública e gratuita.</li>
            <li>É 100% voluntária, de qualquer valor.</li>
          </ol>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            A contribuição não é reembolsável e não gera direito a destaque, prioridade ou
            qualquer vantagem.
          </p>
        </section>

        <section id="propriedade" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">6. Propriedade intelectual</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            A marca, o layout, os textos institucionais e o código da plataforma pertencem aos
            seus responsáveis. O conteúdo enviado pelo usuário continua sendo dele, que concede
            licença não exclusiva para exibição no diretório enquanto o cadastro estiver
            publicado.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Referências linkam para sites de terceiros; os direitos sobre elas pertencem aos
            respectivos autores.
          </p>
        </section>

        <section id="responsabilidade" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">7. Limitação de responsabilidade</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            A plataforma não garante a veracidade das referências nem a qualidade dos produtos ou
            serviços anunciados. A curadoria é uma verificação editorial e não uma auditoria
            independente.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>Negociações, pagamentos e entregas são de responsabilidade das partes.</li>
            <li>Não respondemos por danos decorrentes do contato entre usuário e estabelecimento.</li>
            <li>Não garantimos disponibilidade ininterrupta do site.</li>
          </ul>
        </section>

        <section id="alteracoes" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">8. Modificações dos termos</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Podemos atualizar estes termos para refletir mudanças no produto ou na lei. A data de
            atualização no topo indica a versão vigente. Mudanças materiais serão comunicadas no
            site; o uso contínuo após a publicação implica concordância.
          </p>
        </section>

        <section id="foro" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">9. Lei aplicável e foro</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca do
            Rio de Janeiro, Estado do Rio de Janeiro, para dirimir controvérsias, ressalvadas as
            hipóteses de competência legal obrigatória do consumidor.
          </p>
        </section>

        <section id="contato" className="scroll-mt-40 sm:scroll-mt-28 mt-8">
          <h2 className="text-xl font-bold text-marinho-950">10. Contato do controlador</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Dúvidas sobre estes termos podem ser enviadas para{' '}
            <a className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900" href="mailto:contato@listadobem.com">
              contato@listadobem.com
            </a>
            . Para assuntos de dados pessoais, consulte a{' '}
            <Link href="/privacidade" className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900">
              Política de Privacidade
            </Link>
            .
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-marinho-500">
            <FileText aria-hidden="true" className="h-4 w-4" />
            Versão 1.0 — publicada em {ATUALIZADO_EM}.
          </p>
        </section>

        <p className="mt-10 rounded-xl border border-marinho-100 bg-marinho-50 p-4 text-sm leading-relaxed text-marinho-700">
          Aviso permanente: <strong>não faça transferências financeiras</strong> para a plataforma
          acreditando que está pagando um estabelecimento. A única contribuição existente é
          facultativa e destinada à manutenção do site.
        </p>
      </article>
    </div>
  );
}



