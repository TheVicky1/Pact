-- Consequences are deliberately separated from the broadly readable commitment
-- record. They are never granted to authenticated clients as table data.
create table public.commitment_consequences (
  commitment_id uuid primary key references public.commitments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  consequence text not null check (char_length(consequence) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.commitment_consequences (commitment_id, user_id, consequence)
select id, user_id, consequence
from public.commitments
where consequence is not null and length(trim(consequence)) > 0;

alter table public.commitments drop column consequence;
alter table public.commitment_consequences enable row level security;

drop policy "Users manage their own commitments" on public.commitments;
create policy "Users can read their own commitments"
  on public.commitments for select
  using ((select auth.uid()) = user_id);

-- Browser/Data API sessions have no raw mutation or consequence-table access.
-- Mutations below are only available through constrained SECURITY DEFINER RPCs.
revoke insert, update, delete on public.commitments from anon, authenticated;
revoke all on public.commitment_consequences from anon, authenticated;

create or replace function public.create_commitment(
  p_title text,
  p_description text,
  p_deadline_at timestamptz,
  p_priority public.commitment_priority,
  p_consequence text default null
)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_commitment_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_title is null or char_length(trim(p_title)) not between 1 and 160 then raise exception 'Invalid commitment title'; end if;
  if p_description is not null and char_length(trim(p_description)) > 2000 then raise exception 'Invalid commitment description'; end if;
  if p_consequence is not null and char_length(trim(p_consequence)) > 500 then raise exception 'Invalid commitment consequence'; end if;
  if p_deadline_at is null or p_deadline_at <= now() then raise exception 'Deadline must be in the future'; end if;

  insert into public.commitments (user_id, title, description, deadline_at, priority)
  values (v_user_id, trim(p_title), nullif(trim(p_description), ''), p_deadline_at, p_priority)
  returning id into v_commitment_id;

  if p_consequence is not null and length(trim(p_consequence)) > 0 then
    insert into public.commitment_consequences (commitment_id, user_id, consequence)
    values (v_commitment_id, v_user_id, trim(p_consequence));
  end if;
  return v_commitment_id;
end;
$$;

create or replace function public.update_commitment(
  p_id uuid,
  p_title text,
  p_description text,
  p_deadline_at timestamptz,
  p_priority public.commitment_priority,
  p_replace_consequence boolean default false,
  p_consequence text default null
)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_title is null or char_length(trim(p_title)) not between 1 and 160 then raise exception 'Invalid commitment title'; end if;
  if p_description is not null and char_length(trim(p_description)) > 2000 then raise exception 'Invalid commitment description'; end if;
  if p_consequence is not null and char_length(trim(p_consequence)) > 500 then raise exception 'Invalid commitment consequence'; end if;
  if p_deadline_at is null or p_deadline_at <= now() then raise exception 'Deadline must be in the future'; end if;

  update public.commitments
  set title = trim(p_title), description = nullif(trim(p_description), ''), deadline_at = p_deadline_at, priority = p_priority
  where id = p_id and user_id = v_user_id and status = 'active' and deadline_at >= now();
  if not found then raise exception 'Commitment is not editable'; end if;

  if p_replace_consequence then
    delete from public.commitment_consequences where commitment_id = p_id and user_id = v_user_id;
    if p_consequence is not null and length(trim(p_consequence)) > 0 then
      insert into public.commitment_consequences (commitment_id, user_id, consequence)
      values (p_id, v_user_id, trim(p_consequence));
    end if;
  end if;
end;
$$;

create or replace function public.complete_commitment(p_id uuid)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.commitment_status;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  update public.commitments
  set status = 'completed'
  where id = p_id and user_id = v_user_id and status = 'active' and deadline_at >= now();
  if found then return 'completed'; end if;

  select status into v_status from public.commitments where id = p_id and user_id = v_user_id;
  if not found then return 'not_found'; end if;
  if v_status = 'completed' then return 'already_completed'; end if;
  return 'missed';
end;
$$;

create or replace function public.get_revealed_commitment_consequence(p_id uuid)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_consequence text;
begin
  if v_user_id is null then return null; end if;
  select cc.consequence into v_consequence
  from public.commitment_consequences cc
  join public.commitments c on c.id = cc.commitment_id
  where cc.commitment_id = p_id
    and cc.user_id = v_user_id
    and c.user_id = v_user_id
    and (c.status = 'missed' or (c.status = 'active' and c.deadline_at < now()));
  return v_consequence;
end;
$$;

revoke all on function public.create_commitment(text, text, timestamptz, public.commitment_priority, text) from public;
revoke all on function public.update_commitment(uuid, text, text, timestamptz, public.commitment_priority, boolean, text) from public;
revoke all on function public.complete_commitment(uuid) from public;
revoke all on function public.get_revealed_commitment_consequence(uuid) from public;
grant execute on function public.create_commitment(text, text, timestamptz, public.commitment_priority, text) to authenticated;
grant execute on function public.update_commitment(uuid, text, text, timestamptz, public.commitment_priority, boolean, text) to authenticated;
grant execute on function public.complete_commitment(uuid) to authenticated;
grant execute on function public.get_revealed_commitment_consequence(uuid) to authenticated;
