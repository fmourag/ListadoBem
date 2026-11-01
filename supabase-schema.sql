-- =============================================================================
-- Rede de Apoio — schema Supabase (Postgres 15+)
-- Diretório de comerciantes, prestadores de serviço, artesãos, profissionais
-- liberais, figuras públicas e ações sociais vítimas de boicote ideológico.
--
-- Como aplicar:
--   Supabase Dashboard → SQL Editor → cole este arquivo inteiro → Run.
--   (Alternativa: `supabase db push` se você usa a CLI com migrations.)
--
-- Regras de negócio garantidas pelo banco:
--   • Leitura pública SOMENTE de cadastros com status = 'aprovado'.
--   • Inserção pública permitida, sempre forçada para status = 'pendente'.
--   • Nenhuma política de UPDATE/DELETE: escrita administrativa apenas com
--     service_role (que ignora RLS) — nunca a partir do app web.
--   • CPF/CNPJ é OPCIONAL e único quando informado — protege contra duplicidade.
--   • Contato mínimo: e-mail OU telefone (constraint cadastros_boicote_contato_check).
--   • Aprovar cadastro com menos de 2 referências é bloqueado por trigger.
--
-- O arquivo é idempotente o suficiente para ser reexecutado com segurança
-- (usa IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- =============================================================================

begin;

-- gen_random_uuid() é nativo desde o Postgres 13 (Supabase usa 15+).
-- Não é necessário criar a extensão pgcrypto.

-- -----------------------------------------------------------------------------
-- 1. Enums do domínio
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_cadastro_boicote') then
    create type public.tipo_cadastro_boicote as enum (
      'comerciante',
      'prestador_servico',
      'artesao',
      'profissional_liberal',
      'figura_publica',
      'acao_social'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'status_cadastro_boicote') then
    create type public.status_cadastro_boicote as enum (
      'pendente',
      'aprovado',
      'rejeitado',
      'suspenso'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'tipo_fonte_referencia') then
    create type public.tipo_fonte_referencia as enum (
      'jornal',
      'blog',
      'parlamentar',
      'jornalista',
      'personalidade'
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Tabela principal: cadastros
-- -----------------------------------------------------------------------------
create table if not exists public.cadastros_boicote (
  id uuid primary key default gen_random_uuid(),

  tipo_cadastro public.tipo_cadastro_boicote not null,

  nome_completo text not null
    check (char_length(btrim(nome_completo)) between 5 and 160),
  nome_publico text not null
    check (char_length(btrim(nome_publico)) between 3 and 160),

  -- Opcional. Guardado apenas com dígitos (11 = CPF, 14 = CNPJ). A API normaliza.
  cpf_cnpj text unique
    check (cpf_cnpj is null or cpf_cnpj ~ '^[0-9]{11}$' or cpf_cnpj ~ '^[0-9]{14}$'),

  -- Pelo menos um contato: e-mail OU telefone (ver constraint no fim da tabela).
  email text
    check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefone text
    check (telefone is null or char_length(telefone) between 10 and 20),

  constraint cadastros_boicote_contato_check
    check (email is not null or telefone is not null),

  categoria text not null
    check (categoria in (
      'alimentacao',
      'beleza_e_estetica',
      'construcao',
      'educacao',
      'saude',
      'tecnologia',
      'moda',
      'servicos',
      'artesanato',
      'entretenimento',
      'transporte',
      'outro'
    )),

  descricao_atividade text not null
    check (char_length(descricao_atividade) between 40 and 1200),

  -- { cep, logradouro, numero, complemento, bairro, cidade, estado, pais }
  endereco jsonb not null default '{}'::jsonb
    check (jsonb_typeof(endereco) = 'object'),

  situacao_boicote text not null
    check (char_length(situacao_boicote) between 40 and 1500),

  -- [{ tipo: 'foto'|'video'|'logo'|'documento', url, descricao }]
  midia jsonb not null default '[]'::jsonb
    check (jsonb_typeof(midia) = 'array'),

  status public.status_cadastro_boicote not null default 'pendente',

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.cadastros_boicote is
  'Cadastros do diretório Rede de Apoio. Leitura pública apenas com status = aprovado.';
comment on column public.cadastros_boicote.cpf_cnpj is
  'Opcional. Somente dígitos (CPF 11 / CNPJ 14). Único quando informado. Nunca exposto publicamente.';
comment on column public.cadastros_boicote.endereco is
  'JSON com cep, logradouro, numero, complemento, bairro, cidade, estado e pais.';

-- -----------------------------------------------------------------------------
-- 3. Referências públicas (mínimo de 2 por cadastro, validado na API e na aprovação)
-- -----------------------------------------------------------------------------
create table if not exists public.referencias_publicas (
  id uuid primary key default gen_random_uuid(),

  cadastro_id uuid not null
    references public.cadastros_boicote (id) on delete cascade,

  tipo_fonte public.tipo_fonte_referencia not null,

  nome_fonte text not null
    check (char_length(btrim(nome_fonte)) between 3 and 160),

  link_referencia text not null
    check (link_referencia ~* '^https?://[^\s]+\.[^\s]+$'),

  titulo_referencia text not null
    check (char_length(btrim(titulo_referencia)) between 5 and 200),

  data_publicacao date,

  descricao_contexto text
    check (descricao_contexto is null or char_length(descricao_contexto) <= 600),

  criado_em timestamptz not null default now()
);

comment on table public.referencias_publicas is
  'Provas públicas que comprovam o boicote. Cada cadastro precisa de pelo menos 2.';

-- -----------------------------------------------------------------------------
-- 4. Índices
-- -----------------------------------------------------------------------------
create index if not exists idx_cadastros_boicote_status
  on public.cadastros_boicote (status);

create index if not exists idx_cadastros_boicote_categoria
  on public.cadastros_boicote (categoria);

-- Filtro por UF na listagem: endereco->>'estado'
create index if not exists idx_cadastros_boicote_uf
  on public.cadastros_boicote ((endereco ->> 'estado'));

create index if not exists idx_cadastros_boicote_criado_em
  on public.cadastros_boicote (criado_em desc);

create index if not exists idx_referencias_publicas_cadastro
  on public.referencias_publicas (cadastro_id);

-- -----------------------------------------------------------------------------
-- 5. atualizado_em automático
-- -----------------------------------------------------------------------------
create or replace function public.boicote_touch_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists trg_cadastros_boicote_atualizado on public.cadastros_boicote;
create trigger trg_cadastros_boicote_atualizado
  before update on public.cadastros_boicote
  for each row
  execute function public.boicote_touch_atualizado_em();

-- -----------------------------------------------------------------------------
-- 6. Funções auxiliares (SECURITY DEFINER)
--
-- O RLS esconde cadastros 'pendente' do anon. Sem SECURITY DEFINER, a política
-- de INSERT em referencias_publicas não conseguiria enxergar o cadastro recém-
-- criado e todo envio falharia.
-- -----------------------------------------------------------------------------
create or replace function public.boicote_cadastro_status(p_cadastro_id uuid)
returns public.status_cadastro_boicote
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select status
    from public.cadastros_boicote
   where id = p_cadastro_id;
$$;

comment on function public.boicote_cadastro_status(uuid) is
  'Consulta o status de um cadastro ignorando o RLS. Usada apenas nas políticas de referências.';

create or replace function public.descartar_cadastro_pendente(
  p_cadastro_id uuid,
  p_cpf_cnpj text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removidos integer;
begin
  delete from public.cadastros_boicote
   where id = p_cadastro_id
     and (p_cpf_cnpj is null or cpf_cnpj = p_cpf_cnpj)
     and status = 'pendente'
     and criado_em > now() - interval '15 minutes';

  get diagnostics removidos = row_count;
  return removidos > 0;
end;
$$;

comment on function public.descartar_cadastro_pendente(uuid, text) is
  'Compensação de falha parcial: apaga somente um cadastro pendente recente (do próprio CPF/CNPJ, quando informado).';

-- -----------------------------------------------------------------------------
-- 7. Guardrail: não aprovar cadastro com menos de 2 referências públicas
-- -----------------------------------------------------------------------------
create or replace function public.boicote_validar_aprovacao()
returns trigger
language plpgsql
as $$
declare
  total_referencias integer;
begin
  if new.status = 'aprovado' and (old.status is distinct from 'aprovado') then
    select count(*)
      into total_referencias
      from public.referencias_publicas
     where cadastro_id = new.id;

    if total_referencias < 2 then
      raise exception
        'Cadastro % não pode ser aprovado com % referência(s) pública(s); o mínimo é 2.',
        new.id, total_referencias
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cadastros_boicote_validar_aprovacao on public.cadastros_boicote;
create trigger trg_cadastros_boicote_validar_aprovacao
  before update of status on public.cadastros_boicote
  for each row
  execute function public.boicote_validar_aprovacao();

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.cadastros_boicote enable row level security;
alter table public.referencias_publicas enable row level security;

-- 8.1 Leitura pública: apenas cadastros aprovados.
drop policy if exists "cadastros_boicote_select_aprovados" on public.cadastros_boicote;
create policy "cadastros_boicote_select_aprovados"
  on public.cadastros_boicote
  for select
  to anon, authenticated
  using (status = 'aprovado');

-- 8.2 Inserção pública: qualquer pessoa pode se cadastrar, mas SEMPRE como pendente.
--     (Se o cliente tentar enviar status diferente, o WITH CHECK rejeita.)
drop policy if exists "cadastros_boicote_insert_publico" on public.cadastros_boicote;
create policy "cadastros_boicote_insert_publico"
  on public.cadastros_boicote
  for insert
  to anon, authenticated
  with check (status = 'pendente');

-- 8.3 Referências: leitura apenas das referências de cadastros aprovados.
drop policy if exists "referencias_publicas_select_aprovadas" on public.referencias_publicas;
create policy "referencias_publicas_select_aprovadas"
  on public.referencias_publicas
  for select
  to anon, authenticated
  using (public.boicote_cadastro_status(cadastro_id) = 'aprovado');

-- 8.4 Referências: inserção pública apenas em cadastro pendente.
drop policy if exists "referencias_publicas_insert_pendente" on public.referencias_publicas;
create policy "referencias_publicas_insert_pendente"
  on public.referencias_publicas
  for insert
  to anon, authenticated
  with check (public.boicote_cadastro_status(cadastro_id) = 'pendente');

-- 8.5 Sem políticas de UPDATE/DELETE para anon/authenticated:
--     atualização de status e moderação exigem service_role (bypassa o RLS).

-- -----------------------------------------------------------------------------
-- 9. Privilégios explícitos (mínimo necessário para anon/authenticated)
-- -----------------------------------------------------------------------------
revoke all on public.cadastros_boicote from anon, authenticated;
grant select, insert on public.cadastros_boicote to anon, authenticated;

revoke all on public.referencias_publicas from anon, authenticated;
grant select, insert on public.referencias_publicas to anon, authenticated;

revoke all on function public.boicote_cadastro_status(uuid) from public;
grant execute on function public.boicote_cadastro_status(uuid) to anon, authenticated;

revoke all on function public.descartar_cadastro_pendente(uuid, text) from public;
grant execute on function public.descartar_cadastro_pendente(uuid, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 9.1 Privilégios da service_role (moderação e API server-side)
--     `service_role` ignora o RLS, mas continua sujeita a GRANT de tabela.
--     Sem isto o painel de moderação recebe "permission denied for table".
-- -----------------------------------------------------------------------------
grant usage on schema public to service_role;

grant select, insert, update, delete on public.cadastros_boicote to service_role;
grant select, insert, update, delete on public.referencias_publicas to service_role;

grant execute on function public.boicote_cadastro_status(uuid) to service_role;
grant execute on function public.descartar_cadastro_pendente(uuid, text) to service_role;

commit;

-- =============================================================================
-- 10. Compatibilidade com bancos criados pela versão anterior do schema
--     (enum com 4 valores). `ADD VALUE` não pode rodar dentro da transação
--     acima, por isso fica aqui, após o COMMIT. É no-op em banco novo.
-- =============================================================================
alter type public.tipo_cadastro_boicote
  add value if not exists 'profissional_liberal';

alter type public.tipo_cadastro_boicote
  add value if not exists 'acao_social';

-- =============================================================================
-- 10.1 CPF/CNPJ opcional e contato mínimo (e-mail OU telefone)
--      Idempotente: no-op em banco já migrado.
-- =============================================================================
alter table public.cadastros_boicote alter column cpf_cnpj drop not null;
alter table public.cadastros_boicote alter column email drop not null;

alter table public.cadastros_boicote
  drop constraint if exists cadastros_boicote_contato_check;

alter table public.cadastros_boicote
  add constraint cadastros_boicote_contato_check
  check (email is not null or telefone is not null);

create or replace function public.descartar_cadastro_pendente(
  p_cadastro_id uuid,
  p_cpf_cnpj text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removidos integer;
begin
  delete from public.cadastros_boicote
   where id = p_cadastro_id
     and (p_cpf_cnpj is null or cpf_cnpj = p_cpf_cnpj)
     and status = 'pendente'
     and criado_em > now() - interval '15 minutes';

  get diagnostics removidos = row_count;
  return removidos > 0;
end;
$$;

-- =============================================================================
-- Operação (somente service_role / SQL Editor — nunca no client)
-- =============================================================================
-- Aprovar um cadastro (só funciona se houver 2+ referências):
--   update public.cadastros_boicote set status = 'aprovado' where id = '...';
--
-- Rejeitar:
--   update public.cadastros_boicote set status = 'rejeitado' where id = '...';
--
-- Suspender um cadastro já publicado:
--   update public.cadastros_boicote set status = 'suspenso' where id = '...';
--
-- O app usa a service role (lib/supabase-admin.ts, server-only) para inserir
-- cadastros e moderar. `anon` nunca atualiza: não existe policy de UPDATE.
--
-- Conferir pendentes com contagem de referências:
--   select c.id, c.nome_publico, c.criado_em, count(r.id) as referencias
--     from public.cadastros_boicote c
--     left join public.referencias_publicas r on r.cadastro_id = c.id
--    where c.status = 'pendente'
--    group by c.id
--    order by c.criado_em asc;
--
-- =============================================================================
-- Teste rápido de RLS (deve retornar 0 linhas para anon, se não houver aprovados)
-- =============================================================================
-- set role anon;
-- select count(*) from public.cadastros_boicote;      -- apenas aprovados
-- insert into public.cadastros_boicote (tipo_cadastro, nome_completo, nome_publico,
--   cpf_cnpj, email, telefone, categoria, descricao_atividade, situacao_boicote)
-- values ('comerciante', 'Teste da Silva', 'Loja Teste', '12345678901',
--   'teste@example.com', '11999999999', 'alimentacao',
--   'Descrição de teste com mais de quarenta caracteres para validar o CHECK.',
--   'Situação de boicote de teste com mais de quarenta caracteres.');
-- reset role;



