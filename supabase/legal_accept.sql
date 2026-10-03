-- Run once in Supabase → SQL Editor.
-- Saves terms acceptance on each account. Keeps the referral signup logic.

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

alter table public.profiles
  add column if not exists terms_version text;

create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, terms_version)
);

alter table public.legal_acceptances enable row level security;

drop policy if exists "legal_select_own" on public.legal_acceptances;
drop policy if exists "legal_insert_own" on public.legal_acceptances;
drop policy if exists "legal_admin_all" on public.legal_acceptances;

create policy "legal_select_own"
  on public.legal_acceptances for select
  using (user_id = auth.uid() or public.is_admin());

create policy "legal_insert_own"
  on public.legal_acceptances for insert
  with check (user_id = auth.uid());

create policy "legal_admin_all"
  on public.legal_acceptances for all
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  ref_code text;
  referrer_id uuid;
  my_code text;
  accepted text;
  version text;
begin
  ref_code := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code', '')));
  if ref_code <> '' then
    select id into referrer_id from public.profiles where referral_code = ref_code limit 1;
  end if;

  my_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  accepted := coalesce(new.raw_user_meta_data->>'terms_accepted', '');
  version := nullif(trim(coalesce(new.raw_user_meta_data->>'terms_version', '')), '');

  insert into public.profiles (
    id, email, full_name, referral_code, referred_by, terms_accepted_at, terms_version
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    my_code,
    referrer_id,
    case when accepted = 'true' then now() else null end,
    case when accepted = 'true' then version else null end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    referred_by = coalesce(public.profiles.referred_by, excluded.referred_by),
    referral_code = coalesce(public.profiles.referral_code, excluded.referral_code),
    terms_accepted_at = coalesce(public.profiles.terms_accepted_at, excluded.terms_accepted_at),
    terms_version = coalesce(public.profiles.terms_version, excluded.terms_version);

  if accepted = 'true' and version is not null then
    insert into public.legal_acceptances (user_id, email, terms_version, accepted_at)
    values (new.id, new.email, version, now())
    on conflict (user_id, terms_version) do nothing;
  end if;

  return new;
end;
$$;
