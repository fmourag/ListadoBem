'use server';

import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { criarSupabaseAdmin, SupabaseAdminConfigError } from '@/lib/supabase-admin';

/**
 * Server Actions do painel de moderação.
 *
 * A autenticação é a "verificação simples" pedida na especificação: a chave
 * digitada precisa bater com `ADMIN_SECRET`. Ela nunca vai para o client bundle
 * porque é lida apenas aqui, no servidor.
 *
 * Para produção de verdade, coloque o painel atrás de Cloudflare Access,
 * Vercel Password Protection ou um provedor de identidade.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function chaveConfere(chaveRecebida: string): boolean {
  const esperada = process.env.ADMIN_SECRET;
  if (!esperada || esperada.length === 0) return false;

  const a = Buffer.from(chaveRecebida);
  const b = Buffer.from(esperada);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function destino(chave: string, params: Record<string, string>): string {
  const busca = new URLSearchParams({ chave, ...params });
  return `/admin/moderacao?${busca.toString()}`;
}

async function moderar(formData: FormData, novoStatus: 'aprovado' | 'rejeitado'): Promise<void> {
  const chave = String(formData.get('chave') ?? '');
  const id = String(formData.get('id') ?? '');

  if (!chaveConfere(chave)) {
    redirect(destino(chave, { erro: 'chave' }));
  }

  if (!UUID.test(id)) {
    redirect(destino(chave, { erro: 'id-invalido' }));
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
      ? destino(chave, { erro: mensagemErro })
      : destino(chave, { ok: novoStatus }),
  );
}

export async function aprovarCadastro(formData: FormData): Promise<void> {
  await moderar(formData, 'aprovado');
}

export async function rejeitarCadastro(formData: FormData): Promise<void> {
  await moderar(formData, 'rejeitado');
}
