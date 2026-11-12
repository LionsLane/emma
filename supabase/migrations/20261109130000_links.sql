-- Smart links: tracked short links (emma.lionslane.co.ke/l/<code>) with UTM tags, QR codes and
-- A/B groups. Clicks are recorded by the server only. No raw IP address is stored: "visitor" is a
-- salted SHA-256 of IP + user agent + the day, so unique visitors can be counted per day without
-- being able to identify or follow anyone across days.

create table public.smart_links (
  code text primary key check (code ~ '^[a-z0-9]{6,10}$'),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  destination text not null check (destination ~* '^https?://' and char_length(destination) <= 2000),
  utm_source text check (char_length(utm_source) <= 60),
  utm_medium text check (char_length(utm_medium) <= 60),
  utm_campaign text check (char_length(utm_campaign) <= 80),
  utm_content text check (char_length(utm_content) <= 80),
  ab_group text check (char_length(ab_group) <= 60),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index smart_links_ws_idx on public.smart_links (workspace_id, created_at desc);

create table public.link_clicks (
  id bigint generated always as identity primary key,
  code text not null references public.smart_links (code) on delete cascade,
  at timestamptz not null default now(),
  visitor text not null check (char_length(visitor) <= 64),
  referrer text check (char_length(referrer) <= 120), -- host only, never the full URL
  device text not null default 'other' check (device in ('mobile', 'tablet', 'desktop', 'other')),
  country text check (char_length(country) <= 2),
  is_bot boolean not null default false
);
create index link_clicks_code_at_idx on public.link_clicks (code, at desc);

alter table public.smart_links enable row level security;
alter table public.link_clicks enable row level security;

create policy "links: members read" on public.smart_links
  for select to authenticated using (private.is_member(workspace_id));
create policy "links: editors create" on public.smart_links
  for insert to authenticated with check (private.can_edit(workspace_id) and created_by = (select auth.uid()));
create policy "links: editors update" on public.smart_links
  for update to authenticated using (private.can_edit(workspace_id)) with check (private.can_edit(workspace_id));

create policy "clicks: members read" on public.link_clicks
  for select to authenticated using (
    exists (select 1 from public.smart_links l where l.code = link_clicks.code and private.is_member(l.workspace_id))
  );

revoke all on public.smart_links, public.link_clicks from anon, authenticated;
grant select, insert on public.smart_links to authenticated;
grant update (name, destination, utm_source, utm_medium, utm_campaign, utm_content, ab_group, archived) on public.smart_links to authenticated;
grant select on public.link_clicks to authenticated;
grant all on public.smart_links, public.link_clicks to service_role;
