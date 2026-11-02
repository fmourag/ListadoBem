-- -----------------------------------------------------------------------------
-- Migração: mínimo de referências públicas passa de 2 para 1
--
-- Execute este arquivo no SQL Editor do Supabase em bancos já existentes.
-- É idempotente: recria a função e o trigger de aprovação.
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

    if total_referencias < 1 then
      raise exception
        'Cadastro % não pode ser aprovado sem referência pública (recebidas: %).',
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

comment on function public.boicote_validar_aprovacao() is
  'Bloqueia aprovação de cadastro sem ao menos 1 referência pública.';
