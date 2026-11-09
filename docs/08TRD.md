# 08 · Technical Requirements (TRD and Architecture)

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces Architecture.md and ArchitectureEssentials.md

## Essentials (read this first)

**What:** an AI marketing agent for small businesses. You brief it in one sentence, it returns proposals (calendar, campaigns, leads, emails, tasks, copy), and a person approves them. Web, iOS and Android.

**Stack:** Next.js 16 on Vercel · Supabase (Postgres + Auth, RLS everywhere) · Anthropic Claude (server-only) · Stripe (cards) + M-Pesa Daraja (prepaid) · Expo for mobile.

**Rules that must never break**
1. The server never trusts a workspace, history, model, plan or price from the client.
2. Every AI call goes: authenticate (`getClaims`) → validate (zod) → load the workspace through the user's RLS client → check plan + quota + one-run lock → run → meter.
3. AI tools only propose. Writes happen on explicit approval (`/api/proposals/:id`).
4. Secret keys (`SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY`, Stripe, Daraja) stay on the server. Clients get the URL and the publishable key only.
5. Payments change plans only after server-side verification (Stripe signature; M-Pesa STK query).
6. RLS on every table, explicit grants, `with check` on updates, no `user_metadata` in authorisation.
7. Links built from model or web data: http(s) only, through `safeHref()`.
8. Conversation history is append-only; a failed turn appends nothing.

## 1. System overview
```
 ┌──────────────┐     ┌──────────────────┐
 │ Web (Next.js)│     │ Mobile (Expo RN) │
 └──────┬───────┘     └────────┬─────────┘
        │ cookie session       │ Bearer JWT
        ▼                      ▼
 ┌─────────────────────────────────────────┐
 │ Next.js route handlers on Vercel        │
 │  /api/emma      agent loop (NDJSON)     │
 │  /api/jury      Pitch Jury (Max/staff)  │
 │  /api/proposals approve / discard       │
 │  /api/billing/* Stripe + M-Pesa         │
 │  /api/account   plan, usage, delete     │
 │  /api/workspaces create (within plan)   │
 └───┬───────────────┬──────────────┬──────┘
     │ user JWT (RLS) │ secret key   │ server-only keys
     ▼                ▼              ▼
 ┌──────────┐   ┌──────────┐  ┌────────────────────────┐
 │ Supabase │   │ Supabase │  │ Anthropic · Stripe ·    │
 │ Auth     │   │ Postgres │  │ Safaricom Daraja        │
 └──────────┘   └──────────┘  └────────────────────────┘
```
- **Web:** Next.js App Router. Client components read and write the workspace document through Supabase with the user's session (RLS enforces access). Anything that costs money or needs a secret goes through route handlers.
- **Mobile:** Expo Router app, same Supabase project, calls the same route handlers with `Authorization: Bearer <access token>`.
- **No separate API server:** Vercel route handlers are the API.

## 2. Technology and versions (pinned, each at least two weeks old when chosen)

| Concern | Choice | Version |
|---|---|---|
| Web framework | Next.js (App Router, `proxy.ts`), React, TypeScript strict | next 16.4.0 · react 19.3 |
| State | zustand with persist (demo mode only) | 5.x |
| Validation | zod (request bodies, tool inputs, imports, structured outputs) | 4.6.5 |
| Database + auth | Supabase: `@supabase/ssr`, `@supabase/supabase-js` | 0.12.7 · 2.117.1 |
| AI | `@anthropic-ai/sdk` | 0.132.1 |
| Cards | `stripe` (API 2026-08-26.dahlia) | 22.6.2 |
| M-Pesa | Daraja REST (fetch, no SDK) | — |
| Analytics | `@vercel/analytics` (cookieless), mounted only after the visitor taps Allow (`src/components/Consent.tsx`) | 2.0.1 |
| Mobile | Expo SDK 57, React Native 0.86.3, Expo Router, expo-sqlite (session storage), `expo/fetch` (streaming) | expo ~57.0.28 |
| Tests | PGlite for RLS; mock Anthropic server for AI routes | pglite 0.5.8 |
| Styling | Hand-written CSS with tokens (no Tailwind, no component kit) | — |

Why no component library: the Sokoni look (stamps, tickets, ruled paper) is custom by design; tokens + ~25 components are cheaper than fighting a kit.

## 3. Request flows

### 3.1 Brief EMMA (`POST /api/emma`)
1. Authenticate: cookie session (web) or Bearer token (mobile) → `getClaims()`. Reject if missing (401).
2. JSON only (415 otherwise), size limit, `Origin` must match for cookie requests (403).
3. Validate with zod: `{ workspaceId, conversationId?, text ≤ 4,000 }`.
4. Load the workspace with the **user's** client (RLS proves membership); viewers can't brief.
5. Resolve plan → limits. Count this month's completed briefs and cost from `usage_events` (months in Africa/Nairobi). Refuse with a `quota` event if over.
6. Acquire the run lock (`ai_runs` unique running row; stale after 5 minutes). Refuse if busy.
7. Load prior `messages` (server only), append the user turn in memory.
8. Run the tool loop with the plan's model (see 11). Tools read the server-loaded workspace and only propose.
9. Stream NDJSON events. On success persist: new messages (append-only), proposals, display transcript, usage event. On failure: record usage (tokens were spent) with `completed=false`, append nothing to history.
10. Release the lock in `finally`.

### 3.2 Approve or discard (`POST /api/proposals/:id`)
Validate `{ action: "approve" | "discard" }`, check membership and editor role, apply items to `workspaces.data` with a version check (retry once on conflict), enforce the plan's lead cap, mark the proposal decided with `decided_by/at`. Server-side, so web and mobile behave the same.

### 3.3 Workspace edits (web)
Client edits update local state immediately, then a debounced save:
`update workspaces set data=?, version=version+1, updated_at=now() where id=? and version=?`
Zero rows updated means another device saved first → reload and toast "Updated from another device."

### 3.4 Billing
See 12 Billing. Stripe webhook verifies the signature on the raw body; M-Pesa callbacks are never trusted alone (STK query confirms).

### 3.5 Pitch Jury (`POST /api/jury`)
Staff or Max only, counted against the jury quota, same auth/validation/lock/metering as briefs. Nine juror calls in parallel with structured output, then a foreperson call.

## 4. Environments and configuration

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web (+ `EXPO_PUBLIC_…` on mobile) | Safe to expose; RLS protects data |
| `SUPABASE_SECRET_KEY` | Server | Bypasses RLS; only for usage, subscriptions, messages, proposals, payments, ai_runs |
| `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_BASE_URL` for the local mock) | Server | |
| `NEXT_PUBLIC_APP_URL` | Web | Origin checks, Stripe/M-Pesa return URLs |
| `NEXT_PUBLIC_COMPANY_LEGAL_NAME`, `_ADDRESS`, `_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL`, `NEXT_PUBLIC_COMPANY_PHONE` | Web | Footer + legal pages; empty fields hidden |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_MAX` | Server | |
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV`, `MPESA_CALLBACK_SECRET`, optional `MPESA_TRANSACTION_TYPE`, `MPESA_PARTYB` | Server | `MPESA_ENV` = sandbox or production |
| `CORS_ORIGINS` | Server | Extra origins allowed to call `/api/*` with Bearer tokens (dev adds `localhost:8081`) |

**Local demo mode:** with no Supabase variables, the web app runs in the browser on the fictional Jua Coffee Co. workspace (storage key `emma-demo`, no sign-in). AI routes accept demo requests only when `NODE_ENV !== "production"`.

## 5. Folder structure
```
emma/
  AGENTS.md  CLAUDE.md  README.md  .env.example  next.config.ts (CSP + headers)
  docs/                         this build pack (00–17) + screens/
  supabase/migrations/          SQL schema, RLS, grants
  src/
    proxy.ts                    session refresh, auth redirects, CORS for /api
    app/
      page.tsx  site.tsx  site.css         landing
      signin/                               sign in (email code, Google)
      auth/callback/                        Google return
      legal/[slug]/  legal/content.tsx      legal pages
      app/                                  signed-in app (layout = Shell)
        page.tsx                            Desk
        welcome/ calendar/ leads/ campaigns/ email/ library/
        catalog/ dashboard/ roi/ jury/ billing/ settings/
      api/                                  emma, jury, proposals/[id], account,
                                            workspaces, health, billing/{stripe,mpesa}
      error.tsx  global-error.tsx  not-found.tsx  globals.css
    components/                 ui.tsx, Chrome.tsx, Shell.tsx, charts
    lib/
      agent/                    prompt.ts, tools.ts
      server/                   http, auth, quota, agent, workspace, billing
      supabase/                 env, browser, server (+ admin)
      plans.ts                  plan limits (single source of truth)
      types.ts store.ts chat.ts safe.ts proposals.ts importWorkspace.ts company.ts seed.ts
  mobile/                       Expo app (own package.json, src/app routes)
```

## 6. Performance budgets
| Metric | Budget |
|---|---|
| Landing LCP (4G, mid Android) | < 2.5 s |
| App shell to skeleton | < 100 ms after navigation |
| First streamed token after send | < 3 s (status line within 500 ms) |
| JS on the landing page | < 170 KB gzipped |
| Workspace document | < 4 MB (DB constraint); tools return slices, never the whole document |
| Vercel function | `maxDuration = 300` for AI routes; max 14 tool steps |

## 7. Decisions (ADR log)
1. **Workspace as one JSON document** with version-checked saves; trusted data (money, usage, history, proposals) normalised and server-written. Revisit when a Max customer passes ~5,000 leads or concurrent editing becomes common: leads move first to their own table.
2. **Proposal-only agent:** tools never write; approval is a separate authenticated call.
3. **Model per plan** (Haiku / Sonnet / Opus) plus count caps and monthly cost caps.
4. **No custom backend server:** Vercel route handlers + Supabase.
5. **M-Pesa as prepaid 30 days** (no auto-renew); Stripe for recurring cards; card processor behind one module so Paystack/Flutterwave can replace Stripe.
6. **Email codes (OTP), not magic links:** they work in the native app without deep-link handling.
7. **Sokoni brand (v2.0)** replaces B-18: light-first paper and ink, Clay reserved for EMMA. Migration is phase 6 in 16.
8. **Supabase over Convex:** RLS + Postgres + auth in one, works on web and mobile, SQL-testable policies.

## 8. Edge cases and decisions
| Case | Decision |
|---|---|
| Two briefs at once (two tabs, web + phone) | One running AI run per user, enforced by a unique partial index on `ai_runs`; stale after 5 minutes |
| Client disconnects mid-stream | Usage always recorded in `finally`; the brief counts toward the quota only if completed |
| Model refusal | Friendly message; not counted as a brief; tokens still metered |
| Large workspace | Lead caps per plan; tools return slices |
| Two editors | Version-checked saves; on conflict reload + toast; no realtime in v1 |
| Downgrade from Max with 3 workspaces | Extra workspaces become read-only; nothing deleted |
| "This month" | Calendar months in Africa/Nairobi |
| Supabase default email limits | Launch blocker: custom SMTP |
| M-Pesa callback missing / double pay / wrong amount / 07… numbers | "Check now" runs STK query; idempotent per receipt; amount must equal the plan price; phones normalised to 2547…/2541… |
| Stripe webhook before the user returns | Billing page polls subscription status for 30 seconds |
| Long Opus turn | `maxDuration = 300`, effort medium, 14 steps; stream ends with a "continue" hint if cut |
| Account deletion | Revoke sessions, delete user (cascades), keep anonymised usage |

## 9. What we deliberately didn't build
A separate admin app (a staff flag is enough) · realtime collaboration · normalising every surface into tables · a payment-provider plugin system · the Pitch Jury for every plan.
