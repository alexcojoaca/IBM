-- Paste into Supabase SQL Editor and Run (one time)

alter table public.profiles
  add column if not exists preferred_language text not null default 'en';
alter table public.profiles
  add column if not exists phone text;
alter table public.profiles
  add column if not exists country text;

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

create index if not exists payment_orders_user_id_idx on public.payment_orders(user_id);
create index if not exists payment_orders_status_idx on public.payment_orders(status);

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

alter table public.payment_orders enable row level security;

drop policy if exists "devices_update_own" on public.license_devices;
drop policy if exists "payments_select_own" on public.payment_orders;
drop policy if exists "payments_insert_own" on public.payment_orders;
drop policy if exists "payments_update_own" on public.payment_orders;
drop policy if exists "payments_admin_all" on public.payment_orders;

create policy "devices_update_own"
  on public.license_devices for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.licenses l
      where l.id = license_id and l.user_id = auth.uid()
    )
  );

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
