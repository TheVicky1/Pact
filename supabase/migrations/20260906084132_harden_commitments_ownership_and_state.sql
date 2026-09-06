-- Ownership is derived by Postgres from the authenticated request when a
-- commitment is inserted through the Data API. RLS still requires it to match.
alter table public.commitments
  alter column user_id set default auth.uid();

-- A completion timestamp is meaningful only for a completed commitment.
alter table public.commitments
  add constraint commitments_completion_state_is_consistent
  check (
    (status = 'completed' and completed_at is not null)
    or (status in ('active', 'missed') and completed_at is null)
  );

-- Do not accept a caller supplied completion time. A user may complete their
-- own active commitment, but Postgres remains the authoritative clock.
create or replace function public.enforce_commitment_state()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'active' then
      raise exception 'Commitments must be created active';
    end if;
    new.completed_at := null;
    return new;
  end if;

  if old.status = 'active' and new.status = 'completed' then
    new.completed_at := now();
  elsif old.status = new.status then
    new.completed_at := old.completed_at;
  else
    raise exception 'Invalid commitment status transition';
  end if;
  return new;
end;
$$;

create trigger commitments_enforce_state
  before insert or update on public.commitments
  for each row execute procedure public.enforce_commitment_state();
