import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  Eye,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Users,
} from 'lucide-react';

import { Cartao } from '@/components/admin/dashboard/Cartao';
import { DistribuicaoStatus } from '@/components/admin/dashboard/DistribuicaoStatus';
import { GraficoBarras } from '@/components/admin/dashboard/GraficoBarras';
import { PainelFalhas } from '@/components/admin/dashboard/PainelFalhas';
import { PainelSaude } from '@/components/admin/dashboard/PainelSaude';
import { TabelaRecentes } from '@/components/admin/dashboard/TabelaRecentes';
import { adminConfigurado, verifyAdminSession } from '@/lib/admin-auth';
import { carregarDashboard } from '@/lib/dashboard';
import { formatarDataHora } from '@/lib/format';
import { supabaseAdminConfigurado } from '@/lib/supabase-admin';

import { logoutAdmin } from '../moderacao/actions';

export const metadata: Metadata = {
  title: 'Dashboard operacional',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

export default async function DashboardPage() {
  if (!(await verifyAdminSession())) redirect('/admin/moderacao?erro=sessao');

  if (!adminConfigurado() || !supabaseAdminConfigurado()) {
    return (
      <div className="container-page py-10">
        <Link href="/admin/moderacao" className="btn-secundario">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar à moderação
        </Link>
        <div className="card mt-6 border-ouro-300 bg-ouro-50 p-6">
          <h1 className="flex items-center gap-2 text-xl font-black text-marinho-950">
            <ShieldAlert aria-hidden="true" className="h-5 w-5 text-ouro-700" />
            Dashboard indisponível
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-marinho-800">
            Configure <code className="rounded bg-white px-1">ADMIN_SECRET</code> e{' '}
            <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> no servidor
            para carregar os indicadores.
          </p>
        </div>
      </div>
    );
  }

  const dados = await carregarDashboard();

  return (
    <div className="container-page py-8 sm:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-esmeralda-700">
            <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
            Área administrativa
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-marinho-950 sm:text-3xl">
            Dashboard operacional
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-marinho-600">
            Funcionamento, cadastros, acessos, falhas e situação da contribuição PIX. Atualizado em{' '}
            {formatarDataHora(dados.atualizadoEm) ?? '—'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/moderacao" className="btn-secundario">
            <ShieldAlert aria-hidden="true" className="h-4 w-4" />
            Moderação
          </Link>
          <Link href="/listagem" className="btn-secundario">
            <Eye aria-hidden="true" className="h-4 w-4" />
            Ver listagem
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="btn-secundario">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </header>

      {dados.erroCadastros ? (
        <div className="mt-5 rounded-lg border border-perigo-200 bg-perigo-50 px-4 py-3 text-sm font-semibold text-perigo-800">
          <AlertTriangle aria-hidden="true" className="mr-2 inline h-4 w-4" />
          Falha ao consultar cadastros: {dados.erroCadastros}
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Cartao
          titulo="Cadastros"
          valor={formatarNumero(dados.total)}
          detalhe={`${formatarNumero(dados.cadastros7)} nos últimos 7 dias · ${formatarNumero(dados.cadastros30)} em 30 dias`}
          icone={Users}
        />
        <Cartao
          titulo="Pendentes"
          valor={formatarNumero(dados.porStatus.pendente)}
          detalhe="Aguardando análise humana no painel de moderação"
          icone={Inbox}
          tom="ouro"
        />
        <Cartao
          titulo="Aprovados"
          valor={formatarNumero(dados.porStatus.aprovado)}
          detalhe={`${dados.taxaAprovacao.toFixed(0)}% do total · ${formatarNumero(dados.porStatus.rejeitado)} rejeitados`}
          icone={CheckCircle2}
          tom="esmeralda"
        />
        <Cartao
          titulo="Referências"
          valor={formatarNumero(dados.totalReferencias)}
          detalhe={`Média de ${dados.mediaReferencias.toFixed(1)} por cadastro`}
          icone={Database}
        />
        <Cartao
          titulo="Acessos (7 dias)"
          valor={dados.eventosDisponiveis ? formatarNumero(dados.acessos7) : '—'}
          detalhe={
            dados.eventosDisponiveis
              ? `${formatarNumero(dados.acessos30)} em 30 dias`
              : 'Tabela de eventos pendente'
          }
          icone={Eye}
          tom="esmeralda"
        />
        <Cartao
          titulo="Falhas (7 dias)"
          valor={dados.eventosDisponiveis ? formatarNumero(dados.falhas7) : '—'}
          detalhe={
            dados.eventosDisponiveis
              ? `${formatarNumero(dados.falhas30)} em 30 dias`
              : 'Tabela de eventos pendente'
          }
          icone={dados.falhas7 > 0 ? AlertTriangle : CheckCircle2}
          tom={dados.falhas7 > 0 ? 'perigo' : 'esmeralda'}
        />
        <Cartao
          titulo="Moderação (30 dias)"
          valor={dados.eventosDisponiveis ? formatarNumero(dados.moderacoes30) : '—'}
          detalhe="Logins, aprovações e rejeições registrados"
          icone={ShieldAlert}
          tom="marinho"
        />
        <Cartao
          titulo="Acessos ao PIX (30 dias)"
          valor={dados.eventosDisponiveis ? formatarNumero(dados.acessosApoie30) : '—'}
          detalhe="Visitas a /apoie · não representa doação"
          icone={HeartHandshake}
          tom="ouro"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <GraficoBarras
          titulo="Cadastros por dia"
          descricao="Últimos 14 dias"
          dados={dados.dadosCadastros}
          cor="bg-marinho-500"
        />
        <GraficoBarras
          titulo="Acessos por dia"
          descricao="Últimos 14 dias · páginas públicas"
          dados={dados.dadosAcessos}
          cor="bg-esmeralda-500"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <DistribuicaoStatus porStatus={dados.porStatus} total={dados.total} />
        <PainelSaude
          erroCadastros={dados.erroCadastros}
          eventosDisponiveis={dados.eventosDisponiveis}
          versao={dados.versao}
          ambiente={dados.ambiente}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <TabelaRecentes recentes={dados.recentes} />

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-marinho-950">
              <HeartHandshake aria-hidden="true" className="h-4 w-4 text-ouro-600" />
              Contribuição PIX
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-marinho-600">
              A plataforma <strong>não processa pagamentos</strong> e não confirma doações. O número
              acima é de acessos a <code className="rounded bg-marinho-50 px-1">/apoie</code>, não de
              transferências.
            </p>
            <Link href="/apoie" className="btn-secundario mt-4">
              Abrir página de apoio
            </Link>
          </div>

          <PainelFalhas
            eventosDisponiveis={dados.eventosDisponiveis}
            falhas={dados.ultimasFalhas}
          />
        </div>
      </section>
    </div>
  );
}
