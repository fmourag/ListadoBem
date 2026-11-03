-- -----------------------------------------------------------------------------
-- Dashboard: eventos operacionais e acessos
--
-- Tabela interna, sem acesso público. Usada pelo dashboard administrativo e
-- pelo middleware de acessos. Idempotente.
-- -----------------------------------------------------------------------------

create table if not exists public.eventos_app (
  id bigint generated always as identity primary key,
  tipo text not null
    check (tipo in ('acesso', 'cadastro', 'falha', 'moderacao', 'contribuicao')),
  rota text,
  status text,
  detalhe jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists idx_eventos_app_criado_em
  on public.eventos_app (criado_em desc);

create index if not exists idx_eventos_app_tipo_criado_em
  on public.eventos_app (tipo, criado_em desc);

alter table public.eventos_app enable row level security;

revoke all on public.eventos_app from anon, authenticated;
grant select, insert, delete on public.eventos_app to service_role;
grant usage, select on sequence public.eventos_app_id_seq to service_role;

comment on table public.eventos_app is
  'Eventos internos do app: acessos, cadastros, falhas, moderação e PIX. Sem dados pessoais.';
