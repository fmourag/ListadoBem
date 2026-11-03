-- -----------------------------------------------------------------------------
-- Migração: contato (e-mail/telefone) deixa de ser obrigatório
--
-- A referência pública é a validação do cadastro. Contato, quando informado,
-- serve apenas para a moderação. Execute no SQL Editor do Supabase; idempotente.
-- -----------------------------------------------------------------------------

alter table public.cadastros_boicote
  drop constraint if exists cadastros_boicote_contato_check;

comment on column public.cadastros_boicote.email is
  'Opcional. Usado apenas na moderação; a referência pública é a validação.';
comment on column public.cadastros_boicote.telefone is
  'Opcional. Usado apenas na moderação; a referência pública é a validação.';
