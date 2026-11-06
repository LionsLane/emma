# EMMA: Architecture Essentials

The one-page version of [Architecture.md](Architecture.md). Read this first; open the full doc only for the section you need.

**What**: AI marketing agent for small businesses. Brief in one sentence → proposals (calendar, campaigns, leads, emails, tasks, copy) → a person approves. Web + iOS/Android.

**Stack**: Next.js 16 on Vercel · Supabase (Postgres + Auth, RLS everywhere) · Anthropic Claude (server-only) · Stripe (cards) + M-Pesa Daraja (prepaid) · Expo for mobile.

**Plans** (`src/lib/plans.ts` is the single source of truth): Free KES 0 / Haiku 5.5 · Pro KES 500 / Sonnet 5.5 · Max KES 1,500 / Opus 5.5. Each has brief, search, jury, workspace and seat limits plus a monthly AI-cost cap.

**Data**: `workspaces.data` (jsonb document, version-checked) · `workspace_members` · `subscriptions` · `usage_events` · `conversations` + `messages` (server-only raw history) · `proposals` · `mpesa_payments` · `profiles`.

**Rules that must never break**
1. Server never trusts a workspace, history, model, plan or price from the client.
2. Every AI call: authenticate (`getClaims`) → validate (zod) → load workspace via user's RLS client → check plan + quota → run → meter.
3. AI tools only propose. Writes happen on explicit approval (`/api/proposals/:id`).
4. Secret keys (`SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY`, Stripe, Daraja) are server-only. Clients get URL + publishable key.
5. Payments change plans only after server-side verification (Stripe signature; M-Pesa STK query).
6. RLS on every table, explicit grants, `with check` on updates, no `user_metadata` in auth decisions.
7. Links from model/web data: http(s) only.
8. Conversation history is append-only; a failed turn appends nothing.

**Flows**: brief = `/api/emma` (NDJSON stream) · approve = `/api/proposals/:id` · jury = `/api/jury` · billing = `/api/billing/{stripe,mpesa}/…` · account/usage/export = `/api/account`.

**Local demo mode**: no Supabase env → browser-only demo workspace; AI routes disabled in production.
