import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Briefcase,
  Brush,
  CheckCircle2,
  CreditCard,
  FileText,
  HandHeart,
  Mic,
  Search,
  ShieldCheck,
  Store,
  Users,
  Wrench,
} from 'lucide-react';

import { AvisoNaoTransferencia } from '@/components/AvisoNaoTransferencia';
import { ContribuicaoPIX } from '@/components/ContribuicaoPIX';

const PASSOS = [
  {
    icone: FileText,
    titulo: '1. Você se cadastra',
    texto:
      'Preenche seus dados, descreve a atividade e envia pelo menos duas referências públicas que comprovem o boicote.',
  },
  {
    icone: Search,
    titulo: '2. Nós verificamos',
    texto:
      'A equipe confere os links e o contexto. Só entra no diretório quem tem referência pública real e verificável.',
  },
  {
    icone: Store,
    titulo: '3. O público encontra você',
    texto:
      'Seu negócio aparece na listagem com as fontes. Quem quiser apoiar fala e compra direto com você — sem intermediário.',
  },
];

const TIPOS = [
  { icone: Store, titulo: 'Comerciantes', texto: 'Lojas, bares, restaurantes, mercadinhos e ateliês com ponto comercial.' },
  { icone: Wrench, titulo: 'Prestadores de serviço', texto: 'Manutenção, beleza, reformas, aulas, consultorias e transporte.' },
  { icone: Brush, titulo: 'Artesãos e artesãs', texto: 'Costura, cerâmica, arte, doces artesanais e produção manual.' },
  { icone: Briefcase, titulo: 'Profissionais liberais', texto: 'Advocacia, contabilidade, psicologia, odontologia, arquitetura e autônomos.' },
  { icone: Mic, titulo: 'Figuras públicas', texto: 'Artistas, comunicadores e profissionais com atuação pública.' },
];

const NUNCA = [
  {
    icone: CreditCard,
    titulo: 'Nenhum botão de pagamento',
    texto: 'Não existe checkout, carrinho, assinatura ou cobrança dentro da plataforma.',
  },
  {
    icone: Ban,
    titulo: 'Nenhum pedido de PIX ou TED',
    texto: 'Nunca pedimos transferência para "liberar cadastro", "destacar anúncio" ou qualquer outra coisa.',
  },
  {
    icone: Users,
    titulo: 'Nenhuma intermediação',
    texto: 'A conversa e o pagamento acontecem direto entre você e o estabelecimento escolhido.',
  },
];

export default function HomePage() {
  return (
    <>
      <AvisoNaoTransferencia variante="barra" />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden bg-marinho-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-esmeralda-700/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-marinho-700/40 blur-3xl"
        />

        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-marinho-700 bg-marinho-900/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ouro-300">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Diretório independente · gratuito · sem pagamentos
            </p>

            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
              Apoie quem produz.
              <br />
              <span className="text-ouro-300">Compre direto.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-marinho-200 sm:text-lg">
              A Lista do Bem reúne comerciantes, prestadores de serviço, artesãos,
              profissionais liberais, ações sociais e figuras públicas que foram alvo de boicote
              ideológico. Aqui você encontra quem faz, com referências públicas que comprovam o que
              aconteceu — e conversa direto com cada um.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/listagem" className="btn-ouro w-full sm:w-auto">
                <Store aria-hidden="true" className="h-5 w-5" />
                Ver estabelecimentos
              </Link>
              <Link href="/cadastro" className="btn-claro w-full sm:w-auto">
                Quero cadastrar
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-8 grid gap-2 text-sm text-marinho-200 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <BadgeCheck aria-hidden="true" className="h-4 w-4 text-esmeralda-400" />
                2+ referências públicas
              </li>
              <li className="flex items-center gap-2">
                <HandHeart aria-hidden="true" className="h-4 w-4 text-esmeralda-400" />
                Sem taxas e sem comissão
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-esmeralda-400" />
                Contato direto, sempre
              </li>
            </ul>
          </div>

          <aside className="card border-marinho-700/60 bg-white p-5 text-marinho-900 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-marinho-600">
              <BadgeCheck aria-hidden="true" className="h-4 w-4 text-esmeralda-600" />
              Como a verificação funciona
            </h2>
            <ol className="mt-3 space-y-3">
              {[
                'Cadastro com dados completos e referências verificáveis.',
                'Mínimo de 2 referências públicas com link acessível.',
                'Análise humana antes de qualquer publicação.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-marinho-800">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-esmeralda-600"
                  />
                  {item}
                </li>
              ))}
            </ol>

            <div className="mt-4 rounded-lg border border-ouro-300 bg-ouro-50 p-3 text-xs font-semibold leading-relaxed text-marinho-900">
              Cadastro pendente não aparece publicamente. Nada é publicado sem referência
              verificável.
            </div>

            <p className="mt-4 text-xs leading-relaxed text-marinho-500">
              A plataforma é um diretório informativo. Ela não vende, não cobra e não recebe
              valores.
            </p>
          </aside>
        </div>
      </section>

      {/* ───────────────── Como funciona ───────────────── */}
      <section className="container-page py-14 sm:py-16" aria-labelledby="como-funciona">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
            Simples e transparente
          </p>
          <h2 id="como-funciona" className="mt-2 text-3xl font-black tracking-tight text-marinho-950">
            Como funciona
          </h2>
          <p className="mt-3 text-base leading-relaxed text-marinho-600">
            Três passos. Sem cobrança em nenhum deles.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PASSOS.map((passo) => (
            <article key={passo.titulo} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-marinho-900 text-white">
                <passo.icone aria-hidden="true" className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-bold text-marinho-950">{passo.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-marinho-600">{passo.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────── O que nunca faremos ───────────────── */}
      <section className="bg-marinho-50/70 py-14 sm:py-16" aria-labelledby="seguranca">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-perigo-700">
              Regra de ouro
            </p>
            <h2 id="seguranca" className="mt-2 text-3xl font-black tracking-tight text-marinho-950">
              O que nunca vai existir aqui
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-marinho-600">
              A Lista do Bem é só um diretório. Não somos loja, não somos banco e não somos
              intermediários de pagamento. Se algo pedir dinheiro em nosso nome, é golpe.
            </p>

            <ul className="mt-6 space-y-3">
              {NUNCA.map((item) => (
                <li key={item.titulo} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-perigo-50 text-perigo-700">
                    <item.icone aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-marinho-950">{item.titulo}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-marinho-600">{item.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <AvisoNaoTransferencia variante="destaque" />
            <div className="card p-5">
              <h3 className="text-base font-bold text-marinho-950">
                Como apoiar do jeito certo
              </h3>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-marinho-700">
                <li className="flex gap-2">
                  <span className="font-bold text-esmeralda-700">1.</span>
                  Encontre o estabelecimento na listagem e abra as referências públicas.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-esmeralda-700">2.</span>
                  Vá até o local ou use os canais oficiais divulgados pelo próprio negócio.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-esmeralda-700">3.</span>
                  Combine e pague direto com ele, exatamente como faria sem a plataforma.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Quem pode se cadastrar ───────────────── */}
      <section className="container-page py-14 sm:py-16" aria-labelledby="quem-pode">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
            Quem pode participar
          </p>
          <h2 id="quem-pode" className="mt-2 text-3xl font-black tracking-tight text-marinho-950">
            Quem pode se cadastrar
          </h2>
          <p className="mt-3 text-base leading-relaxed text-marinho-600">
            Qualquer pessoa física ou jurídica que tenha sofrido boicote ideológico e consiga
            comprovar com pelo menos duas referências públicas. O cadastro é gratuito.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPOS.map((tipo) => (
            <article key={tipo.titulo} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-esmeralda-50 text-esmeralda-700">
                <tipo.icone aria-hidden="true" className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-bold text-marinho-950">{tipo.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-marinho-600">{tipo.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────── Verificação ───────────────── */}
      <section className="bg-marinho-950 py-14 text-white sm:py-16" aria-labelledby="verificacao">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-ouro-300">
              Compromisso de verificação
            </p>
            <h2 id="verificacao" className="mt-2 text-3xl font-black tracking-tight">
              Sem prova pública, sem cadastro
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-marinho-200">
              Para evitar uso político indevido do diretório, todo cadastro precisa de no mínimo
              duas referências públicas verificáveis: link de jornal, blog de notícias, perfil de
              parlamentar, jornalista ou personalidade pública que comprove o boicote.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-marinho-300">
              O formulário bloqueia o envio sem essas duas referências. Cadastros incompletos ou
              sem fonte confiável são recusados na análise.
            </p>
          </div>

          <ul className="grid gap-3">
            {[
              { titulo: 'Link acessível', texto: 'A URL precisa abrir publicamente, sem login.' },
              { titulo: 'Contexto claro', texto: 'A publicação deve citar o boicote ou seus efeitos.' },
              { titulo: 'Fonte identificável', texto: 'Veículo, parlamentar, jornalista ou personalidade.' },
              { titulo: 'Revisão humana', texto: 'Nada é publicado automaticamente; tudo passa por análise.' },
            ].map((item) => (
              <li
                key={item.titulo}
                className="flex items-start gap-3 rounded-xl border border-marinho-800 bg-marinho-900/70 p-4"
              >
                <BadgeCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-esmeralda-400" />
                <div>
                  <p className="text-sm font-bold text-white">{item.titulo}</p>
                  <p className="mt-0.5 text-sm text-marinho-300">{item.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────── Apoio facultativo ───────────────── */}
      <section className="container-page py-12 sm:py-14">
        <ContribuicaoPIX variante="compacta" />
      </section>

      {/* ───────────────── CTA final ───────────────── */}
      <section className="container-page py-14 sm:py-16">
        <div className="rounded-2xl border border-marinho-100 bg-gradient-to-br from-marinho-50 to-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black tracking-tight text-marinho-950 sm:text-3xl">
                Foi boicotado? Coloque seu negócio no mapa.
              </h2>
              <p className="mt-2 text-base leading-relaxed text-marinho-600">
                Leva alguns minutos e não custa nada. Quanto mais gente cadastrada, mais fácil
                fica para o público apoiar quem está sendo penalizado por ideologia.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn-primario">
                Cadastrar meu negócio
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="/listagem" className="btn-secundario">
                Explorar o diretório
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}



