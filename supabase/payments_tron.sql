-- Real USDT TRC20 payments + affiliate payout tracking
-- Run in Supabase → SQL Editor

alter table public.payment_orders
  add column if not exists from_address text;

alter table public.payment_orders
  add column if not exists verified_amount numeric(18,6);

create unique index if not exists payment_orders_tx_hash_uidx
  on public.payment_orders (tx_hash)
  where tx_hash is not null and status = 'paid';

alter table public.affiliate_commissions
  add column if not exists payout_status text not null default 'pending';

alter table public.affiliate_commissions
  add column if not exists payout_tx_hash text;

alter table public.affiliate_commissions
  add column if not exists payout_error text;

alter table public.affiliate_commissions
  add column if not exists paid_at timestamptz;

-- Normalize payout_status values
update public.affiliate_commissions
set payout_status = 'pending'
where payout_status is null or payout_status = '';

-- Optional check via constraint (safe if already valid)
do $$
begin
  alter table public.affiliate_commissions
    drop constraint if exists affiliate_commissions_payout_status_check;
  alter table public.affiliate_commissions
    add constraint affiliate_commissions_payout_status_check
    check (payout_status in ('pending', 'paid', 'failed', 'skipped'));
exception when others then
  null;
end $$;
