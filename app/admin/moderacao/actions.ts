'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  clearAdminSession,
  compararSegredo,
  setAdminSession,
  verifyAdminSession,
} from '@/lib/admin-auth';
import { registrarEvento } from '@/lib/eventos';
import { criarSupabaseAdmin, SupabaseAdminConfigError } from '@/lib/supabase-admin';

/**
 * Server Actions do painel de moderação.
 *
 * A autenticação agora é por cookie de sessão (`admin_session`), derivado da
 * `ADMIN_SECRET` por HMAC e comparado com `timingSafeEqual`. A senha nunca
 * aparece na URL; o cookie é HttpOnly/Secure/SameSite=Strict.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LIMITE_LOGIN = 5;
const JANELA_LOGIN_MS = 15 * 60 * 1000;
const tentativasLogin = new Map<string, { total: number; expiraEm: number }>();

async function ipDoLogin(): Promise<string> {
  const cabecalhos = await headers();
  const encaminhado = cabecalhos.get('x-forwarded-for');
  if (encaminhado) return encaminhado.split(',')[0]?.trim() || 'desconhecido';
  return cabecalhos.get('x-real-ip')?.trim() || 'desconhecido';
}

function loginBloqueado(ip: string): boolean {
  const registro = tentativasLogin.get(ip);
  if (!registro || registro.expiraEm < Date.now()) return false;
  return registro.total >= LIMITE_LOGIN;
}

function registrarFalhaLogin(ip: string): void {
  const agora = Date.now();
  const registro = tentativasLogin.get(ip);
  if (!registro || registro.expiraEm < agora) {
    tentativasLogin.set(ip, { total: 1, expiraEm: agora + JANELA_LOGIN_MS });
    return;
  }
  registro.total += 1;
}

function limparFalhasLogin(ip: string): void {
  tentativasLogin.delete(ip);
}

export async function loginAdmin(formData: FormData): Promise<void> {
  const ip = await ipDoLogin();

  if (loginBloqueado(ip)) {
    await registrarEvento({
      tipo: 'moderacao',
      rota: '/admin/moderacao',
      status: 'login_bloqueado',
    });
    redirect('/admin/moderacao?erro=limite');
  }

  const senha = String(formData.get('senha') ?? '');

  if (!compararSegredo(senha)) {
    registrarFalhaLogin(ip);
    await registrarEvento({
      tipo: 'moderacao',
      rota: '/admin/moderacao',
      status: 'login_falha',
    });
    redirect('/admin/moderacao?erro=credenciais');
  }

  limparFalhasLogin(ip);
  await setAdminSession();
  await registrarEvento({
    tipo: 'moderacao',
    rota: '/admin/moderacao',
    status: 'login_ok',
  });
  revalidatePath('/admin/moderacao');
  redirect('/admin/moderacao');
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  revalidatePath('/admin/moderacao');
  redirect('/admin/moderacao');
}

async function moderar(
  formData: FormData,
  novoStatus: 'aprovado' | 'rejeitado',
): Promise<void> {
  if (!(await verifyAdminSession())) {
    redirect('/admin/moderacao?erro=sessao');
  }

  const id = String(formData.get('id') ?? '');

  if (!UUID.test(id)) {
    redirect('/admin/moderacao?erro=id-invalido');
  }

  let mensagemErro: string | null = null;

  try {
    const supabase = criarSupabaseAdmin();
    const { error } = await supabase
      .from('cadastros_boicote')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) mensagemErro = error.message;
  } catch (erro) {
    if (erro instanceof SupabaseAdminConfigError) {
      mensagemErro = 'config';
    } else {
      throw erro;
    }
  }

  // A listagem é dinâmica (force-dynamic), mas revalidar mantém o comportamento
  // correto caso alguém troque a estratégia de cache no futuro.
  revalidatePath('/listagem');
  revalidatePath('/admin/moderacao');

  await registrarEvento({
    tipo: mensagemErro ? 'falha' : 'moderacao',
    rota: '/admin/moderacao',
    status: mensagemErro ? 'moderacao_falha' : novoStatus,
    detalhe: { id },
  });

  redirect(
    mensagemErro
      ? `/admin/moderacao?erro=${encodeURIComponent(mensagemErro)}`
      : `/admin/moderacao?ok=${novoStatus}`,
  );
}

export async function aprovarCadastro(formData: FormData): Promise<void> {
  await moderar(formData, 'aprovado');
}

export async function rejeitarCadastro(formData: FormData): Promise<void> {
  await moderar(formData, 'rejeitado');
}
