# EMMA: Architecture

How EMMA is built. The product is in [PRD.md](PRD.md); a one-page summary for agents is in [ArchitectureEssentials.md](ArchitectureEssentials.md).

## 1. System overview

```
 ┌──────────────┐     ┌──────────────────┐
 │ Web (Next.js)│     │ Mobile (Expo RN) │
 │ app.emma...  │     │ iOS + Android    │
 └──────┬───────┘     └────────┬─────────┘
        │ cookie session       │ Bearer JWT
        ▼                      ▼
 ┌─────────────────────────────────────────┐
 │ Next.js route handlers on Vercel        │
 │  /api/emma      agent loop (streaming)  │
 │  /api/jury      pitch jury (Max/staff)  │
 │  /api/proposals approve / discard       │
 │  /api/billing/* Stripe + M-Pesa         │
 │  /api/account   plan, usage, export     │
 └───┬───────────────┬──────────────┬──────┘
     │ user JWT (RLS) │ secret key   │ server-only keys
     ▼                ▼              ▼
 ┌──────────┐   ┌──────────┐  ┌────────────────────────┐
 │ Supabase │   │ Supabase │  │ Anthropic · Stripe ·    │
 │ Auth     │   │ Postgres │  │ Safaricom Daraja        │
 └──────────┘   └──────────┘  └────────────────────────┘
```

- **Web**: Next.js 16 App Router on Vercel. Client components read and write the workspace through Supabase with the user's session (RLS enforces access). Everything that costs money or needs secrets goes through route handlers.
- **Mobile**: Expo (React Native, Expo Router). Same Supabase project; calls the same route handlers with `Authorization: Bearer <access token>`.
- **Backend**: Supabase (Postgres + Auth). No separate API server; Vercel route handlers are the API.
- **AI**: Anthropic Claude API, called only from the server. Model chosen by plan.
- **Payments**: Stripe (cards, recurring) and Safaricom Daraja M-Pesa STK push (prepaid 30 days).

## 2. Technology choices

| Concern | Choice | Why |
|---|---|---|
| Web framework | Next.js 16, React 19, TypeScript | Already built; route handlers give us an API on Vercel with no extra server. |
| Styling | Hand-written CSS with design tokens (`globals.css`) | Full control of the B-18 look; tokens let a client palette re-skin the app. |
| State (web) | zustand | Small; holds the active workspace and UI state; syncs to Supabase. |
| Database + auth | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | Postgres + RLS + auth in one, generous free tier, works for web and mobile. Publishable key in clients, secret key on the server only. |
| AI | `@anthropic-ai/sdk`, Haiku 5.5 / Sonnet 5.5 / Opus 5.5 by plan | Cost per plan matches price per plan. |
| Validation | zod | Validates every request body and every model tool input. |
| Mobile | Expo SDK (React Native), Expo Router, `expo/fetch` for streaming | One codebase for iOS + Android; test in Chrome and Expo Go. |
| Hosting | Vercel (web + API), Supabase cloud (DB), EAS (mobile builds) | Managed, cheap at low volume. |

## 3. Data model

All tables live in `public`, all have RLS on, and access is granted explicitly (Supabase stops auto-exposing new tables to the Data API from 2026-10-30). Migration: `supabase/migrations/*_init.sql`.

| Table | Purpose | Who can read | Who can write |
|---|---|---|---|
| `profiles` | One row per user: name, `is_staff`, onboarding state. | The user | The user (except `is_staff`) |
| `workspaces` | One business/brand. `data jsonb` holds the workspace document (profile, calendar, campaigns, leads, emails, library, tasks, compliance, history, juries). `version int` for optimistic concurrency. | Members | Owner/editors (data, name); never `owner_id` |
| `workspace_members` | `(workspace_id, user_id, role)` role ∈ owner, editor, viewer. | Members of that workspace | Server only (invites via route) |
| `subscriptions` | Current plan per user: plan, status, provider, period end, Stripe ids. | The user | **Server only** (webhooks) |
| `usage_events` | One row per AI request: user, workspace, kind (brief/jury), model, tokens, searches, cost (USD). | The user | **Server only** |
| `conversations` | A thread with EMMA in a workspace; `display jsonb` is the rendered transcript (text, statuses, proposal ids). | Workspace members | Server only |
| `messages` | Raw Anthropic messages for a conversation, append-only, ordered by `seq`. Never sent to clients. | Nobody (server only) | Server only |
| `proposals` | Proposal cards: kind, title, summary, review note, items, status, decided_by/at. | Workspace members | Server only (approve/discard via route) |
| `mpesa_payments` | STK push requests and results. | The user | Server only |

**Why a JSON document for the workspace?** The surfaces already share one typed `Workspace` model, edits are by one small team at a time, and a document with a version number gives us atomic saves and simple export. Tables that must be trusted (money, usage, history, proposals) are normalised and server-written. If teams grow and concurrent editing becomes common, calendar/leads move to their own tables (see ADR list).

**Plan resolution**: `plan = subscriptions.plan if status in (active, trialing) and current_period_end > now() else 'free'`. Staff (`profiles.is_staff`) get Max limits.

## 4. Request flows

### 4.1 Brief EMMA (`POST /api/emma`)
1. Authenticate: cookie session (web) or Bearer token (mobile) → `getClaims()`; reject if missing.
2. Validate body with zod: `{ workspaceId, conversationId?, text (≤ 4,000 chars) }`. Check `Origin` matches the app for cookie requests.
3. Load workspace with the **user's** client (RLS proves membership; viewers can't brief).
4. Resolve plan → limits. Count this month's briefs and cost from `usage_events`; refuse with an upgrade message if over. Refuse if the user already has a brief running (one at a time).
5. Load prior `messages` for the conversation (server-side only). Append the user turn.
6. Run the tool loop with the plan's model. Tools read the server-loaded workspace and only *propose*.
7. Stream NDJSON events. Persist proposals, new messages (append-only), the display transcript and a usage event (with the service client).
8. On failure before completion: nothing is appended to `messages`, so history stays valid.

### 4.2 Approve a proposal (`POST /api/proposals/:id`)
Validate `{ action: approve | discard }`, check membership and role (editor+), apply items to `workspaces.data` with a version check, mark the proposal decided. Done server-side so web and mobile behave the same.

### 4.3 Workspace edits (web)
Client edits update zustand immediately, then a debounced save: `update workspaces set data, version = version + 1 where id = ? and version = ?`. Zero rows updated → someone else saved → reload and show a toast.

### 4.4 Billing
- **Stripe**: `POST /api/billing/stripe/checkout` creates a Checkout Session for the plan's Price (KES), `client_reference_id = user id`. `POST /api/billing/stripe/webhook` verifies the signature with the raw body, then upserts `subscriptions` on `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`. Customer portal for cancel/update card.
- **M-Pesa**: `POST /api/billing/mpesa/stk` (phone, plan) → Daraja STK push, store `checkout_request_id`. Safaricom calls `POST /api/billing/mpesa/callback/<secret>`; callbacks aren't signed, so we never trust the body: we confirm with Daraja's STK *query* API, check amount and that the request id is ours and unused, then extend the plan 30 days. Idempotent.

### 4.5 Pitch Jury (`POST /api/jury`)
Staff or Max only, counted against the jury quota. Nine isolated juror calls in parallel with schema-enforced output, then a foreperson. Same auth, validation, metering as briefs.

## 5. Security model

- **Identity**: Supabase Auth; server verifies JWT signature with `getClaims()` on every API call. Never trust `user_metadata` for authorisation; staff flag lives in `profiles.is_staff`, writable only by the server.
- **Authorisation**: RLS on every table, policies combine `to authenticated` with ownership/membership predicates; UPDATE policies have `with check`. Membership checks use a `security definer` helper in a private schema.
- **Secrets**: `ANTHROPIC_API_KEY`, `SUPABASE_SECRET_KEY`, Stripe and Daraja keys are server-only env vars on Vercel. Only `NEXT_PUBLIC_SUPABASE_URL` and the publishable key reach clients.
- **Trust boundary**: the server never accepts a workspace, conversation history, model choice, price or plan from a client.
- **Abuse limits**: plan quotas, monthly cost cap, one in-flight brief per user, body size limits, text length limits.
- **Prompt injection**: model output can only create proposals; web content can't trigger writes. Links rendered from model or web data must be `https:`/`http:`; everything else is dropped.
- **Headers**: CSP, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS (Vercel).
- **Logging**: errors logged server-side without secrets or full prompts; clients get generic messages.

Full findings and fixes: [SecurityReview.md](SecurityReview.md).

## 6. Environments and configuration

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web + mobile (`EXPO_PUBLIC_…`) | Safe to expose; RLS protects data. |
| `SUPABASE_SECRET_KEY` | Server | Bypasses RLS. Used only for usage, subscriptions, messages, proposals, payments. |
| `ANTHROPIC_API_KEY` | Server | |
| `NEXT_PUBLIC_APP_URL` | Web | Used for Origin checks and Stripe/M-Pesa return URLs. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_MAX` | Server | |
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV`, `MPESA_CALLBACK_SECRET` | Server | `MPESA_ENV` = sandbox or production. |

**Local demo mode**: with no Supabase variables set, the web app runs entirely in the browser on the demo workspace (no sign-in), and AI routes only work when `NODE_ENV !== "production"`. Production requires Supabase.

## 7. Folder structure

```
emma/
  AGENTS.md  CLAUDE.md  README.md
  docs/                 PRD, Architecture, ArchitectureEssentials, SecurityReview, EmmaOnTrial
  supabase/migrations/  SQL schema, RLS, grants
  src/
    proxy.ts            session refresh (Next 16)
    app/
      (marketing)       landing, pricing
      (auth)            sign in, callback
      (app)/…           Command Center and the surfaces
      api/              emma, jury, proposals, billing, account, health
    components/         UI primitives, shell, chat, charts
    lib/
      agent/            prompt, tools
      supabase/         browser, server, admin clients
      server/           auth, plans enforcement, usage, workspace loading
      plans.ts          plan limits (single source of truth)
      types.ts  store.ts  seed.ts  metrics.ts  jury.ts
  mobile/               Expo app (own package.json)
```

## 8. Decisions (ADR log)

1. **Workspace as a JSON document** with version-checked saves; trusted data normalised. Revisit when concurrent team editing is common.
2. **Proposal-only agent**: tools never write; approval is a separate authenticated call.
3. **Model per plan** (Haiku / Sonnet / Opus) plus count and cost caps.
4. **No custom backend server**: Vercel route handlers + Supabase.
5. **M-Pesa as prepaid** (no auto-renew); Stripe for recurring cards. Provider behind one interface so Paystack/Flutterwave can replace Stripe if Stripe can't onboard the business.

## 9. Review: missing edge cases, what will break, what's over-engineered

A pass over the PRD and this document before building. Each item has a decision.

### Edge cases that were missing
| Case | Decision |
|---|---|
| Two briefs fired at once (two tabs, or web + phone) both pass the quota check. | One in-flight brief per user, enforced in the database (`ai_runs` row with a unique "running" index; stale after 5 minutes). |
| Client disconnects mid-stream. Tokens were still spent. | Usage is always recorded in `finally`; the brief only counts toward the quota if it completed. |
| A model refusal (Haiku 5.5 has no server-side fallback). | Friendly message, the brief isn't counted, tokens are still metered. |
| Workspace grows large (thousands of leads) and the jsonb row gets heavy. | Leads capped per plan (50 / 1,000 / unlimited for Max). Tools return slices, never the whole document. Leads move to their own table when a Max customer passes ~5,000. |
| Two people edit the same workspace. | Version-checked saves; on conflict, reload and show what changed. No realtime in v1. |
| Downgrade from Max with 3 workspaces. | Extra workspaces become read-only, nothing is deleted. |
| "This month" differs by timezone. | Quota months are calendar months in Africa/Nairobi time. |
| Supabase's default email sender allows only a few auth emails per hour. | **Launch blocker**: configure custom SMTP (e.g. Resend) in Supabase before going live. |
| Magic links don't open the native app reliably. | Use 6-digit email codes (OTP) on web and mobile; Google sign-in as an option on web. |
| M-Pesa: callback never arrives, user pays twice, amount doesn't match, phone typed as 07… | "Check payment" button runs the STK query; payments are idempotent per receipt; amount must equal the plan price; phones normalised to 2547…/2541…. |
| Stripe webhook lands before the user returns from Checkout. | The plan page polls subscription status for 30 seconds after return. |
| Vercel function time limit on a long Opus turn with web research. | `maxDuration = 300`, effort `medium`, max 14 tool steps; the stream ends cleanly with a "continue" hint if cut. |
| Account deletion. | Revoke sessions, delete user (cascades), keep anonymised usage for accounting. |

### What would have broken
- **Trusting the client's workspace and history** (the current prototype does). Anyone could inject fake assistant turns or system messages and spend our credits. Fixed by server-side history and server-loaded workspaces.
- **Open AI endpoints** with an optional shared password. Fixed by real accounts and quotas.
- **Demo data mixed with real data** in one browser store. Demo mode gets its own storage key and never syncs.
- **New tables invisible to the API** after Supabase's 2026-10-30 change. Migration grants access explicitly.

### What's over-engineered (cut or deferred)
- A separate admin app: no. A staff flag and one admin page.
- Realtime collaboration: no. Version checks are enough for small teams.
- Normalising every surface into tables: no. Only trusted data is normalised.
- A generic payment-provider plugin system: no. Two concrete flows behind one small interface.
- The Pitch Jury for every customer: no. Staff and Max only; it was built for LionsLane's own checks.
