-- IBM Platform schema (run full file in Supabase SQL Editor if starting fresh,
-- or run the ALTER / new sections below on existing projects)

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  preferred_language text not null default 'en'
    check (preferred_language in ('en','ro','it','es','fr','pl','ru')),
  phone text,
  country text,
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Safe upgrades for existing DBs
alter table public.profiles
  add column if not exists preferred_language text not null default 'en';
alter table public.profiles
  add column if not exists phone text;
alter table public.profiles
  add column if not exists country text;

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  license_key text not null unique,
  key_prefix text not null,
  plan text not null default 'Professional',
  status text not null default 'active'
    check (status in ('active', 'suspended', 'revoked', 'expired')),
  max_devices int not null default 1,
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.license_devices (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  device_fingerprint text not null,
  device_name text,
  last_seen_at timestamptz default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (license_id, device_fingerprint)
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_eur numeric(10,2) not null default 150,
  currency text not null default 'USDT',
  network text not null default 'TRC20',
  wallet_address text,
  tx_hash text,
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'paid', 'rejected', 'expired')),
  license_id uuid references public.licenses(id) on delete set null,
  admin_note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists licenses_user_id_idx on public.licenses(user_id);
create index if not exists licenses_key_prefix_idx on public.licenses(key_prefix);
create index if not exists payment_orders_user_id_idx on public.payment_orders(user_id);
create index if not exists payment_orders_status_idx on public.payment_orders(status);

-- Admin check: security definer + row_security=off (no profiles RLS recursion)
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  insert into public.profiles (id, email, full_name, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.licenses enable row level security;
alter table public.license_devices enable row level security;
alter table public.payment_orders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "licenses_select_own" on public.licenses;
drop policy if exists "licenses_admin_insert" on public.licenses;
drop policy if exists "licenses_admin_update" on public.licenses;
drop policy if exists "devices_select" on public.license_devices;
drop policy if exists "devices_admin_all" on public.license_devices;
drop policy if exists "devices_update_own" on public.license_devices;
drop policy if exists "payments_select_own" on public.payment_orders;
drop policy if exists "payments_insert_own" on public.payment_orders;
drop policy if exists "payments_update_own" on public.payment_orders;
drop policy if exists "payments_admin_all" on public.payment_orders;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_select_admin"
  on public.profiles for select using (public.is_admin());
create policy "profiles_update_admin"
  on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy "licenses_select_own"
  on public.licenses for select
  using (user_id = auth.uid() or public.is_admin());
create policy "licenses_admin_insert"
  on public.licenses for insert with check (public.is_admin());
create policy "licenses_admin_update"
  on public.licenses for update using (public.is_admin());

create policy "devices_select"
  on public.license_devices for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.licenses l
      where l.id = license_id and l.user_id = auth.uid()
    )
  );
create policy "devices_update_own"
  on public.license_devices for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.licenses l
      where l.id = license_id and l.user_id = auth.uid()
    )
  );
create policy "devices_admin_all"
  on public.license_devices for all
  using (public.is_admin()) with check (public.is_admin());

create policy "payments_select_own"
  on public.payment_orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "payments_insert_own"
  on public.payment_orders for insert
  with check (user_id = auth.uid());
create policy "payments_update_own"
  on public.payment_orders for update
  using (user_id = auth.uid() or public.is_admin());
create policy "payments_admin_all"
  on public.payment_orders for all
  using (public.is_admin()) with check (public.is_admin());
