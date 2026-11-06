-- EMMA initial schema.
-- Rules: RLS on every table; access granted explicitly (Supabase no longer
-- auto-exposes new public tables to the Data API); clients can only write the
-- workspace document and their own profile name. Money, usage, history and
-- proposals are written by the server with the secret key.

create schema if not exists private;

-- ---------------------------------------------------------------- tables

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  is_staff boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  data jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_data_size check (pg_column_size(data) < 4000000)
);
create index workspaces_owner_idx on public.workspaces (owner_id);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_idx on public.workspace_members (user_id);

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'max')),
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  provider text not null default 'none' check (provider in ('none', 'stripe', 'mpesa', 'manual')),
  current_period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  updated_at timestamptz not null default now()
);

create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  workspace_id uuid references public.workspaces (id) on delete set null,
  kind text not null check (kind in ('brief', 'jury')),
  model text not null,
  completed boolean not null default true,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  cache_write_tokens integer not null default 0,
  searches integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);
create index usage_events_user_time_idx on public.usage_events (user_id, created_at desc);

-- One AI run in flight per user (stops parallel requests slipping past quotas).
create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('brief', 'jury')),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create unique index ai_runs_one_running on public.ai_runs (user_id) where finished_at is null;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  title text not null default 'New thread' check (char_length(title) <= 200),
  display jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_ws_idx on public.conversations (workspace_id, updated_at desc);

-- Raw model history. Append-only. Never readable by clients.
create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  seq integer not null,
  role text not null check (role in ('user', 'assistant')),
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (conversation_id, seq)
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  kind text not null check (kind in ('calendar', 'campaign', 'leads', 'email', 'tasks', 'asset')),
  title text not null,
  summary text not null default '',
  review_note text,
  items jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'discarded')),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index proposals_ws_idx on public.proposals (workspace_id, created_at desc);

create table public.mpesa_payments (
  checkout_request_id text primary key,
  merchant_request_id text,
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('pro', 'max')),
  amount integer not null check (amount > 0),
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  receipt text unique,
  result_desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index mpesa_payments_user_idx on public.mpesa_payments (user_id, created_at desc);

-- ---------------------------------------------------------------- helpers
-- SECURITY DEFINER so membership checks don't recurse through RLS. Kept in the
-- unexposed `private` schema, each one checks auth.uid() itself.

create or replace function private.member_role(ws uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role from public.workspace_members m
  where m.workspace_id = ws and m.user_id = (select auth.uid());
$$;

create or replace function private.is_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.member_role(ws) is not null;
$$;

create or replace function private.can_edit(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.member_role(ws) in ('owner', 'editor'), false);
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public;
grant execute on function private.member_role(uuid), private.is_member(uuid), private.can_edit(uuid) to authenticated;

-- New user: create a profile and a Free subscription.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120));
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.ai_runs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.proposals enable row level security;
alter table public.mpesa_payments enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "workspaces: members read" on public.workspaces
  for select to authenticated using (private.is_member(id));
create policy "workspaces: editors update" on public.workspaces
  for update to authenticated using (private.can_edit(id)) with check (private.can_edit(id));
create policy "workspaces: owner deletes" on public.workspaces
  for delete to authenticated using (private.member_role(id) = 'owner');

create policy "members: read own workspaces" on public.workspace_members
  for select to authenticated using (private.is_member(workspace_id));

create policy "subscriptions: read own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "usage: read own" on public.usage_events
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "conversations: members read" on public.conversations
  for select to authenticated using (private.is_member(workspace_id));

create policy "proposals: members read" on public.proposals
  for select to authenticated using (private.is_member(workspace_id));

create policy "mpesa: read own" on public.mpesa_payments
  for select to authenticated using ((select auth.uid()) = user_id);

-- messages and ai_runs: no policies on purpose. Clients can never read them.

-- ---------------------------------------------------------------- grants
-- Nothing for anon. Authenticated users get exactly what the policies allow,
-- and column-level grants stop them touching owner_id, is_staff, version
-- history fields etc.

revoke all on public.profiles, public.workspaces, public.workspace_members, public.subscriptions,
  public.usage_events, public.ai_runs, public.conversations, public.messages, public.proposals,
  public.mpesa_payments from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, onboarded) on public.profiles to authenticated;

grant select, delete on public.workspaces to authenticated;
grant update (name, data, version, updated_at) on public.workspaces to authenticated;

grant select on public.workspace_members, public.subscriptions, public.usage_events,
  public.conversations, public.proposals, public.mpesa_payments to authenticated;

grant all on public.profiles, public.workspaces, public.workspace_members, public.subscriptions,
  public.usage_events, public.ai_runs, public.conversations, public.messages, public.proposals,
  public.mpesa_payments to service_role;
grant usage, select on all sequences in schema public to service_role;
