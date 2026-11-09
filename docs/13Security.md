# 13 · Security

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces SecurityReview.md

Reviewed the way an attacker would look at it: who could spend our money, read someone else's data, or trick EMMA? Each finding is in plain English, with the fix and its status. First review 2026-10-09; updated 2026-10-15.

## 1. Threat model in one table
| Asset | Threat | Main defence |
|---|---|---|
| Anthropic credit | Anonymous or abusive use of AI routes | Accounts, quotas, cost caps, one run at a time |
| Business data | One customer reading another's workspace | RLS on every table, membership helpers |
| Plans and money | Self-upgrade, fake payments, replayed callbacks | Server-only writes, Stripe signatures, M-Pesa STK query, idempotent claims |
| EMMA's behaviour | Prompt injection, forged history | Server-side history, propose-only tools, human approval |
| Users' browsers | XSS, clickjacking, CSRF | CSP, frame-ancestors none, JSON-only + Origin check, safeHref |
| Secrets | Leaks to clients or logs | Server-only env vars, no secrets in logs, publishable key only in clients |

## 2. Findings from the prototype review (all fixed)
| # | Severity | In plain English | Fix |
|---|---|---|---|
| 1 | Critical | Anyone with the address could run EMMA on our Anthropic account. | Real accounts; every AI request signed in, checked against plan limits and a monthly cost cap, one at a time. AI routes refuse to run in production without accounts. |
| 2 | Critical | The browser sent EMMA's whole memory; someone could insert fake "system" instructions. | History lives only on the server (append-only, unreadable by clients). The browser sends only the new message. |
| 3 | High | The browser sent the whole workspace; EMMA worked on whatever it claimed. | The server loads the workspace itself through RLS. |
| 4 | High | No size limits; huge requests could cost a lot. | Byte limits and validated fields everywhere; briefs ≤ 4,000 characters. |
| 5 | Medium | AI or web links were made clickable as-is (`javascript:` possible). | `safeHref()`: only http/https. |
| 6 | Medium | No security headers (clickjacking on "Approve"). | CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, HSTS. |
| 7 | Medium | Provider error details reached the browser. | Generic messages; details only in server logs. |
| 8 | Medium | A shared password was stored in the browser. | Removed with real accounts. |
| 9 | Medium | Cross-site request forgery once cookies are used. | JSON-only bodies and an Origin check on cookie requests. |
| 10 | Medium | Dev server listened on the whole network. | Bound to `127.0.0.1`. |
| 11 | Low | Workspace import trusted any JSON. | zod schema + 3 MB cap. |
| 12 | Low | Health check revealed the model. | Returns only `connected` and `cloud`. |
| 13 | Low | Pitch Jury fields unbounded. | Capped; staff/Max only; metered; locked. |
| 14 | Info | Business data in browser storage. | Cloud mode keeps data in the database; the browser keeps only the last workspace id. |

## 3. Controls by layer

### Identity and sessions
- Supabase Auth: email OTP (6 digits), email link (`/auth/confirm`, token hash), passkeys, and Google on web. Google uses Google's own button (`accounts.google.com/gsi`, ID token with a per-page SHA-256 nonce, `signInWithIdToken`), so Google's screen names emma.lionslane.co.ke; the redirect flow is the fallback. Google's script loads only after the visitor taps Continue with Google (our own button first), so opening /signin sends nothing to Google. `getClaims()` verifies the JWT signature on every API call.
- Two-step: a user whose session is `aal1` is refused by every API (`401 {mfa:true}`) when Supabase's admin API lists a verified factor for them. The factor list never comes from the session cookie, which the browser can edit; `src/proxy.ts` uses the cookie only to steer screens.
- HttpOnly cookies refreshed by `src/proxy.ts`; mobile stores the session in expo-sqlite-backed localStorage and sends a Bearer token.
- `user_metadata` is never used for authorisation; staff is `profiles.is_staff`, server-only.
- OAuth callback accepts only same-site `next` paths (no open redirects).
- Account deletion revokes sessions globally first.

### Authorisation (database)
- RLS on all 10 tables; nothing granted to `anon`; column-level update grants; `with check` on every update policy; `security definer` helpers in an unexposed `private` schema with `search_path = ''`.
- `messages` and `ai_runs` have no policies: clients can never read them.
- 33 automated PGlite tests: cross-tenant reads, self-upgrade, self-staff, usage tampering, history reads, workspace creation past plan, anonymous access.

### API
- JSON only (415), size limits (413), zod validation (400), Origin check for cookie requests (403), CORS only for listed origins with Bearer tokens.
- The server never accepts a workspace, history, model, plan or price from the client.
- Rate limits: plan quotas, cost caps, one AI run per user, 3 M-Pesa prompts per 10 minutes.
- Website audits fetch user-supplied URLs through `src/lib/server/safefetch.ts` (SSRF guard): http/https only, ports 80/443, no credentials in the URL; the IP check runs inside the socket's DNS lookup, so private, loopback, link-local, CGNAT, multicast and cloud-metadata addresses (IPv4 and IPv6, including IPv4-mapped) are refused at connect time with no DNS-rebinding gap; every redirect is re-checked (max 4); 2.5 MB and 12 s caps. Tested by `scripts/searchtest.mjs` (11 refusal cases, including a public name that resolves to 127.0.0.1).
- AI-visibility "cited" is computed from the real web-search results (the business's domain among the sources), never from the model's claim; "named" requires the business in the model's ranked list, not merely in its prose.

### AI
- Propose-only tools; approval is a separate authenticated call by an editor.
- Inputs from streamed tool calls re-validated with zod.
- Researched leads arrive unverified and without consent; EMMA won't broadcast to non-consenting contacts.
- Review notes for sensitive claims.

### Payments
- Stripe webhook: raw body ≤ 512 KB, signature verified, retries on handler failure.
- M-Pesa callback at a secret path, body never trusted: STK query confirms, amount must match `plans.ts`, request must be ours and unclaimed, receipt unique.

### Browser
- CSP (`next.config.ts`): `default-src 'self'`; scripts self + inline (Next hydration); connect-src self + Supabase; `frame-ancestors 'none'`; `form-action 'self'` + Stripe Checkout.
- React escaping for all text; no `dangerouslySetInnerHTML` with model output; Markdown rendered with a safe renderer and links through `safeHref`.

### Secrets and logs
- Server-only env vars on Vercel; `.env*` git-ignored; `.env.example` lists names only.
- Never log secrets, tokens, full prompts or personal data; log error class + route + user id.

## 4. Launch security checklist
| Item | Status |
|---|---|
| Authentication | Done in code. **Before launch:** custom SMTP in Supabase. |
| Encryption | HTTPS + HSTS on Vercel; Supabase encrypts at rest. |
| Session handling | Done. |
| Error boundaries | Page, app and root error screens; no stack traces shown. |
| Rate limiting | Done in app. **Before scale:** Vercel Firewall rule on `/api/*` (e.g. 60 req/min/IP). |
| Input validation | zod everywhere. |
| Logging | Done. **Before scale:** log drain. |
| Backups | **Before taking payments:** Supabase Pro (daily backups + point-in-time recovery). |
| Monitoring | Vercel Analytics (cookieless, only after consent). **Before scale:** error tracking (Sentry or Vercel Observability) + alerts on 5xx and AI cost spikes. |
| Dependencies | Web: `npm audit` 0. Mobile: 28 advisories inside Expo SDK 57's tree (build tooling); take Expo patch releases and re-audit before each store build. Enable Dependabot. |

## 5. Accepted risks
- CSP allows inline scripts (Next.js hydration). Revisit with nonces.
- A user can edit their own workspace document to exceed the displayed lead count; it costs only storage, and approvals still enforce the cap.
- Expo SDK dependency advisories as above.

## 6. Security tests to rerun before every release
1. Two accounts: B can't read A's workspace, conversations, proposals or payments (RLS suite).
2. Signed-out `POST /api/emma` → 401; `text/plain` → 415; foreign Origin with cookie → 403.
3. Demo history containing a `system` role → 400.
4. Second brief while one runs → 429.
5. M-Pesa callback replay → plan extended once; wrong amount → unchanged.
6. Stripe webhook with a bad signature → 400.
7. A lead with `sourceUrl: "javascript:alert(1)"` renders as plain text.
8. Response headers include CSP, X-Frame-Options, HSTS, nosniff.
