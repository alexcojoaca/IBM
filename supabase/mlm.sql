-- IBM MLM / Affiliates (run in Supabase SQL Editor)

alter table public.profiles
  add column if not exists crypto_wallet text;

alter table public.profiles
  add column if not exists affiliates_unlocked boolean not null default false;

-- Ensure referral fields exist
alter table public.profiles
  add column if not exists referral_code text;
alter table public.profiles
  add column if not exists referred_by uuid references public.profiles(id);

create unique index if not exists profiles_referral_code_uidx
  on public.profiles (referral_code)
  where referral_code is not null;

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  earner_id uuid not null references public.profiles(id) on delete cascade,
  payment_order_id uuid references public.payment_orders(id) on delete set null,
  license_id uuid references public.licenses(id) on delete set null,
  level int not null check (level between 1 and 3),
  amount_eur numeric(10,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists affiliate_commissions_earner_idx
  on public.affiliate_commissions(earner_id);
create index if not exists affiliate_commissions_buyer_idx
  on public.affiliate_commissions(buyer_id);

alter table public.affiliate_commissions enable row level security;

drop policy if exists "comm_select_own" on public.affiliate_commissions;
drop policy if exists "comm_admin_all" on public.affiliate_commissions;

create policy "comm_select_own"
  on public.affiliate_commissions for select
  using (earner_id = auth.uid() or buyer_id = auth.uid() or public.is_admin());

create policy "comm_admin_all"
  on public.affiliate_commissions for all
  using (public.is_admin()) with check (public.is_admin());

-- Signup: honor referral code from user metadata
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
begin
  ref_code := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code', '')));
  if ref_code <> '' then
    select id into referrer_id from public.profiles where referral_code = ref_code limit 1;
  end if;

  my_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.profiles (id, email, full_name, referral_code, referred_by)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    my_code,
    referrer_id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    referred_by = coalesce(public.profiles.referred_by, excluded.referred_by),
    referral_code = coalesce(public.profiles.referral_code, excluded.referral_code);

  return new;
end;
$$;

-- Unlock affiliates for anyone who already has an active license
update public.profiles p
set affiliates_unlocked = true
where exists (
  select 1 from public.licenses l
  where l.user_id = p.id and l.status = 'active'
)
or p.role = 'admin';
