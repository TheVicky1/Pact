create type public.commitment_priority as enum ('low', 'medium', 'high');
create type public.commitment_status as enum ('active', 'completed', 'missed');

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text check (char_length(description) <= 2000),
  deadline_at timestamptz not null,
  priority public.commitment_priority not null default 'medium',
  status public.commitment_status not null default 'active',
  completed_at timestamptz,
  consequence text check (char_length(consequence) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_commitments_have_timestamp check ((status <> 'completed') or completed_at is not null)
);

create index commitments_user_deadline_idx on public.commitments (user_id, deadline_at);
alter table public.commitments enable row level security;
create policy "Users manage their own commitments" on public.commitments for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create trigger commitments_set_updated_at before update on public.commitments for each row execute procedure public.set_updated_at();
