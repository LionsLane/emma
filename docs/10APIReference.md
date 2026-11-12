# 10 · API Reference

**EMMA Build Pack v2.0 · 2026-10-15**

All endpoints are Next.js route handlers under `src/app/api/`, Node runtime, on Vercel.

## Conventions
- **Auth:** web sends the Supabase session cookie; mobile sends `Authorization: Bearer <access token>`. Both are verified with `getClaims()` in `requireUser(req)` (`src/lib/server/auth.ts`).
- **Bodies:** `Content-Type: application/json` only (415 otherwise), size-limited, validated with zod.
- **Origin:** cookie requests must come from `NEXT_PUBLIC_APP_URL` (403 otherwise). Bearer requests from origins in `CORS_ORIGINS` get CORS headers (preflight 204); others get 403.
- **Errors:** `{ "error": "<plain sentence for the user>", ...extra }`. Internal details never leave the server (`publicError`).
- **Status codes:** 400 invalid body · 401 not signed in · 402 plan limit (`upgrade: true` when an upgrade would help) · 403 role or origin · 404 not found (also for "not yours") · 409 state conflict · 413 too large · 415 not JSON · 429 busy or too many attempts · 502 provider failed · 503 not configured.
- **Streaming:** AI routes return `application/x-ndjson`, one JSON event per line.

---

## AI

### `POST /api/emma` · brief EMMA
Body (cloud):
```json
{ "workspaceId": "uuid", "conversationId": "uuid (optional)", "text": "1–4000 chars" }
```
Body (demo mode, non-production only): `{ "text", "history": [{ "role": "user|assistant", "content" }], "workspace": { ... } }`. A `system` role or anything else is rejected (400).

Stream events (`AgentEvent` in `src/lib/types.ts`):
| Event | Shape | Meaning |
|---|---|---|
| conversation | `{ type, id }` | Thread id (sent first when a new thread is created) |
| quota | `{ type, briefsUsed, briefsLimit, plan }` | Usage after this brief |
| status | `{ type, label }` | "Reading the workspace", "Searching the web"… |
| text | `{ type, text }` | Streaming text delta of EMMA's note |
| source | `{ type, title, url }` | Web source (up to 3 per search) |
| proposal | `{ type, proposal }` | A brief card (id is the DB uuid) |
| usage | `{ type, usage }` | Token totals for this turn |
| done | `{ type, messages }` | Turn finished (messages empty in cloud mode) |
| error | `{ type, message }` | Turn failed; nothing appended to history |

Errors before streaming: 402 brief limit or read-only workspace · 403 viewer · 404 workspace/conversation · 429 a run is in progress · 503 no API key.

### `POST /api/jury` · Pitch Jury (staff + Max)
```json
{ "case": { "title": "≤200", "kind": "≤60", "context": "≤1500" },
  "round": { "pitch": "1–4000", "audience": "≤500", "price": "≤200" } }
```
Stream: `juror` (one per juror as it finishes, `JurorVerdict`) → `foreperson` `{ summary, objections[], revisedPitch, changes[] }` → `usage` → `done`, or `error`. 402 if not on Max/staff or jury quota used.

---

## Search & AI

### `POST /api/search/audit`
Auth (local demo only without accounts). `{ url, business?: { name, location } }` → `SearchAudit` (scores for `seo`, `aio`, `geo`, `axo`, `overall`; 31 checks with status, detail, fix; page facts). Fetches the page, `/robots.txt`, `/sitemap.xml` (or the one robots.txt lists) and `/llms.txt` through the SSRF-safe fetcher. 400 for non-public or malformed addresses, 429 past `auditsPerMonth`. No AI.

### `POST /api/search/visibility` · Pro and Max
Auth. `{ name, website, location, queries: string[1..3] }` → `VisibilityReport` (`share`, `summary`, per query: `mentioned`, `cited`, `competitors`, `sources`, `note`). One web search per query on the plan's model; one AI run per user; 402 past `visibilityPerMonth`, the search allowance or the cost cap.

## Smart links

### `GET /api/links?workspaceId=<uuid>`
Auth, members. → `{ limit, base, links: [{ code, name, destination, utm_*, ab_group, archived, created_at, short, stats: { clicks, unique, bots, last7, daily[30], referrers, devices, countries } }] }` over the last 90 days, bots excluded from clicks.

### `POST /api/links`
Auth, editors. `{ workspaceId, name, destination, channel?, utm?: { source, medium, campaign, content }, abGroup? }` → 201 `{ link }`. 400 bad destination, 402 past the plan's active links, 403 viewers and non-members, 429 past 20 an hour.

### `PATCH /api/links/<code>`
Auth, editors. `{ name?, archived? }`. Switching on re-checks the plan limit (402).

### `GET /l/<code>` (public)
Records one click and redirects (302) with the link's UTM tags added (existing tags kept). 404 page for unknown or switched-off codes.

## Proposals

### `POST /api/proposals/:id`
```json
{ "action": "approve" | "discard" }
```
- Discard → `{ "status": "discarded" }`
- Approve → `{ "status": "approved", "added": 9, "skipped": 0, "version": 42, "data": { ...Workspace } }` (`skipped` counts leads over the plan cap)
- 403 viewer · 404 not found or not a member · 409 already decided, or the workspace kept changing after retry.

---

## Account and workspaces

### `GET /api/account`
```json
{
  "user": { "id", "email", "name", "onboarded", "staff" },
  "plan": { "id": "free|pro|max", "name", "priceKES", "model", "periodEnd", "provider" },
  "limits": { "briefs", "searches", "jury", "workspaces", "seats", "leads" },
  "usage": { "briefs", "searches", "jury", "costUSD" },
  "workspaces": [{ "id", "name", "owner_id", "updated_at" }],
  "plans": [{ "id", "name", "priceKES", "model", "features", "blurb" }]
}
```

### `DELETE /api/account`
Revokes all sessions, deletes the auth user (cascades to profile, workspaces they own, subscriptions, payments), keeps anonymised usage. → `{ "deleted": true }`.

### `POST /api/workspaces`
```json
{ "name": "1–120", "profile": { "tagline", "industry", "location", "website", "sectors": ["≤12"], "voice" } }
```
→ 201 `{ id, name, version, data }`. 402 when the plan's workspace allowance is used.

### `GET /api/health`
`{ "connected": boolean, "cloud": boolean }`, no-store. Never reveals models or keys.

---

## Billing

### `POST /api/billing/mpesa/stk`
`{ "plan": "pro" | "max", "phone": "0712 345 678 | 2547… | +254…" }` → `{ checkoutRequestId, message }`. Amount comes from `plans.ts`, never from the client. 429 after 3 prompts in 10 minutes. 503 if Daraja isn't configured.

### `GET /api/billing/mpesa/status?id=<checkoutRequestId>`
→ `{ "status": "pending" | "paid" | "failed" | "cancelled" }`. Runs an STK query while pending; only the payment's owner can read it.

### `POST /api/billing/mpesa/callback/<MPESA_CALLBACK_SECRET>`
Called by Safaricom. Always answers `{ ResultCode: 0, ResultDesc: "Accepted" }`. The body is treated as a hint only: the server confirms with the STK query API, checks the amount and that the request is ours and unclaimed, then extends the plan 30 days (idempotent per receipt).

### `POST /api/billing/stripe/checkout`
`{ "plan": "pro" | "max" }` → `{ url }` (Stripe Checkout, KES price id from env, `client_reference_id` = user id).

### `POST /api/billing/stripe/portal`
→ `{ url }` for the customer portal. 404 if no card subscription.

### `POST /api/billing/paystack/init`
Auth. `{ plan: "pro" | "max" }` → `{ url }` (checkout.paystack.com). 503 when Paystack isn't set up, or test keys for a non-staff user in production. 429 after 5 checkouts in 10 minutes.

### `GET /api/billing/paystack/verify?reference=emma-<uuid>`
Auth, owner of the payment only. → `{ status: "pending" | "paid" | "failed" }`, settling through Paystack's verify API.

### `POST /api/billing/paystack/webhook`
Paystack only. Raw body ≤ 200 KB, `x-paystack-signature` = HMAC SHA512 with `PAYSTACK_SECRET_KEY`. `charge.success` → `settlePaystack` (re-verifies with Paystack). Returns 500 on settle failure so Paystack retries.

### `POST /api/billing/stripe/webhook`
Stripe only. Raw body ≤ 512 KB, signature verified with `STRIPE_WEBHOOK_SECRET`. Handles `checkout.session.completed`, `customer.subscription.created|updated|deleted` → `syncStripeSubscription` (period end read from the subscription item). Returns 500 on handler failure so Stripe retries.

---

## Auth

### `GET /auth/callback?code=…&next=/app/…`
Exchanges the Google OAuth code for a session. `next` must be a same-site path starting with `/` (no `//`, no scheme); otherwise `/app`.

### Proxy (`src/proxy.ts`)
Matcher `/app/:path*`, `/signin`, `/api/:path*`: refreshes the Supabase session cookie, redirects signed-out `/app/*` to `/signin?next=…` and signed-in `/signin` to `/app`, and applies CORS to `/api/*`.

---

## Direct Supabase access from clients
Clients use the publishable key with the user's session, limited by RLS (see 09):
- read: own profile, subscription, usage, payments; workspaces, members, conversations and proposals of workspaces they belong to.
- write: `profiles.full_name`, `profiles.onboarded`; `workspaces.name|data|version|updated_at` (editors, version-checked).
Everything else goes through the endpoints above.

## Testing endpoints locally
```bash
npm run dev
```
Point `ANTHROPIC_BASE_URL` at the mock server to exercise `/api/emma` without spending credits; expect the event sequence `status → text… → proposal → usage → done`.
