alter table public.profiles alter column timezone set default 'Asia/Kolkata';

-- Phase 2 shipped with UTC as a placeholder. Existing untouched profiles now follow
-- the initial Indian product default; future onboarding can deliberately choose another IANA zone.
update public.profiles
set timezone = 'Asia/Kolkata'
where timezone = 'UTC';
