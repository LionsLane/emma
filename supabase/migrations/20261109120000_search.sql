-- Search & AI (SEO, AIO, GEO, AXO): site audits and AI-visibility checks are metered like briefs.
-- 'audit' runs no AI (cost 0) and counts against auditsPerMonth; 'visibility' uses AI with web search.
-- The original check constraints were created inline, so drop whatever check constraint guards
-- each table's "kind" column (by definition, not by assumed name), then add the wider one.

do $$
declare c record;
begin
  for c in
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname in ('usage_events', 'ai_runs')
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%kind%'
  loop
    execute format('alter table public.%I drop constraint %I', c.relname, c.conname);
  end loop;
end $$;

alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('brief', 'jury', 'audit', 'visibility'));

alter table public.ai_runs add constraint ai_runs_kind_check
  check (kind in ('brief', 'jury', 'visibility'));
