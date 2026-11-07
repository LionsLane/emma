-- Paystack (M-Pesa and cards in Kenya): one row per checkout. Written by the server only;
-- each user can read their own rows. A payment extends the plan by 30 days, like M-Pesa.

alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('none', 'stripe', 'mpesa', 'manual', 'paystack'));

create table public.paystack_payments (
  reference text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('pro', 'max')),
  amount integer not null check (amount > 0), -- KES, whole shillings
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'abandoned')),
  channel text,
  paid_at timestamptz,
  result_desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index paystack_payments_user_idx on public.paystack_payments (user_id, created_at desc);

alter table public.paystack_payments enable row level security;
create policy "paystack: read own" on public.paystack_payments
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.paystack_payments from anon, authenticated;
grant select on public.paystack_payments to authenticated;
grant all on public.paystack_payments to service_role;
