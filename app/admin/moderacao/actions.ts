'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  clearAdminSession,
  compararSegredo,
  setAdminSession,
  verifyAdminSession,
} from '@/lib/admin-auth';
import { criarSupabaseAdmin, SupabaseAdminConfigError } from '@/lib/supabase-admin';

/**
 * Server Actions do painel de moderação.
 *
 * A autenticação agora é por cookie de sessão (`admin_session`), derivado da
 * `ADMIN_SECRET` por HMAC e comparado com `timingSafeEqual`. A senha nunca
 * aparece na URL; o cookie é HttpOnly/Secure/SameSite=Strict.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loginAdmin(formData: FormData): Promise<void> {
  const senha = String(formData.get('senha') ?? '');

  if (!compararSegredo(senha)) {
    redirect('/admin/moderacao?erro=credenciais');
  }

  setAdminSession();
  revalidatePath('/admin/moderacao');
  redirect('/admin/moderacao');
}

export async function logoutAdmin(): Promise<void> {
  clearAdminSession();
  revalidatePath('/admin/moderacao');
  redirect('/admin/moderacao');
}

async function moderar(
  formData: FormData,
  novoStatus: 'aprovado' | 'rejeitado',
): Promise<void> {
  if (!verifyAdminSession()) {
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
