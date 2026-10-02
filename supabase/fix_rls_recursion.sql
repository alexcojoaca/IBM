-- FIX: infinite recursion on profiles + ensure your admin account
-- Run ALL of this in Supabase → SQL Editor → Run

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
set row_security = off
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon, service_role;

-- Recreate profiles policies WITHOUT recursion
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

-- Own row only (no is_admin call → no recursion)
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin can read/update all (safe: is_admin has row_security=off)
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Create / promote your account
insert into public.profiles (id, email, full_name, role, referral_code)
values (
  '43464ac6-05aa-46c8-9fe8-7158b4eea4ff',
  'alex.cojoaca2000@gmail.com',
  '',
  'admin',
  upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
)
on conflict (id) do update set
  email = excluded.email,
  role = 'admin';

-- Verify
select id, email, role from public.profiles
where id = '43464ac6-05aa-46c8-9fe8-7158b4eea4ff';
