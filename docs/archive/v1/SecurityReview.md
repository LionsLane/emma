# EMMA: Security Review

Reviewed as an attacker would look at it: who can spend our money, read someone else's data, or trick EMMA. Each finding: what it means in plain English, how it was fixed, and status. Reviewed 2026-10-09, updated 2026-10-14.

## Findings in the original prototype

| # | Severity | In plain English | Fix | Status |
|---|---|---|---|---|
| 1 | **Critical** | Anyone who found the address could make EMMA run on our Anthropic account and run up the bill. The only lock was an optional shared password. | Real accounts (Supabase). Every AI request must be signed in, is checked against the plan's limits and a monthly cost cap, and only one can run at a time per person. Without accounts, the AI routes refuse to run in production. | Fixed |
| 2 | **Critical** | The browser sent EMMA's whole memory of the conversation. Someone could edit it to put words in EMMA's mouth or slip in fake "system" instructions that override her rules. | Conversation history now lives only on the server (append-only table no client can read). The browser sends just the new message. | Fixed |
| 3 | High | The browser sent the whole workspace with every request, so EMMA worked on whatever the browser claimed, and a huge fake workspace could inflate costs. | The server loads the workspace itself, through database rules that check the person is a member. | Fixed |
| 4 | High | No size limits: one request with megabytes of text could cost a lot. | Every request has a byte limit and validated fields (briefs ≤ 4,000 characters). | Fixed |
| 5 | Medium | Links from the AI or from web pages (for example a lead's "source") were turned into clickable links as-is. A poisoned web page could get a `javascript:` link onto the screen. A malformed link could also crash the chat. | All untrusted links pass `safeHref()`: only http/https, everything else is dropped. | Fixed |
| 6 | Medium | No security headers: the app could be loaded invisibly inside another site to trick someone into clicking "Approve" (clickjacking). | Content Security Policy, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, HSTS. | Fixed |
| 7 | Medium | Error messages passed internal details from our AI provider to the browser. | Generic messages to users; details only in server logs. | Fixed |
| 8 | Medium | The shared password was stored in the browser in plain text. | Removed with the move to real accounts. | Fixed |
| 9 | Medium | Once accounts use cookies, another website could have made your browser send requests to EMMA (cross-site request forgery). Requests sent as plain text skip the browser's normal protection. | All API calls must be JSON, and signed-in requests must come from our own site (Origin check). | Fixed |
| 10 | Medium | The dev server listened on the whole Wi-Fi network, so people nearby could reach it (and its AI key). | Bound to `127.0.0.1` only. | Fixed |
| 11 | Low | Importing a workspace file trusted whatever JSON it was given. | Validated with a schema and a 3 MB size cap. | Fixed |
| 12 | Low | The health check told anyone which AI model we use. | Returns only "connected" and "accounts on". | Fixed |
| 13 | Low | Pitch Jury fields had no length limits. | All fields capped; jury is staff/Max only, metered and rate-limited. | Fixed |
| 14 | Info | Personal data was kept unencrypted in the browser (localStorage). | In account mode, business data stays in the database; the browser keeps only which workspace you last opened. | Fixed |

## New backend: how it stays safe

- **Database rules (RLS) on every table**, tested with 33 automated checks in a real Postgres: users only see their own workspaces, can't upgrade themselves, can't make themselves staff, can't touch usage records (so they can't reset their quota), can't read raw AI history, can't create workspaces past their plan, and anonymous visitors see nothing.
- **Secret keys never reach the browser.** Only the Supabase URL and publishable key are public.
- **Payments**: Stripe webhooks are signature-checked on the raw body. M-Pesa callbacks aren't signed by Safaricom, so we never trust them alone: every payment is confirmed with Safaricom's query API, the amount must match our price, and each payment can only be counted once. Prices and plans always come from our server, never from the browser.
- **Sign-in**: email codes or Google; tokens verified on every request (`getClaims`); no `user_metadata` in permission checks; sessions revoked before account deletion; sign-in redirects only to our own pages (no open redirects).
- **Prompt injection**: EMMA's tools can only propose. Nothing a web page says can change data without a person pressing Approve.

## The 10-point launch security checklist

| Item | Status |
|---|---|
| Authentication | Supabase Auth, email code + Google, JWT verified server-side. **Before launch:** custom SMTP (default email limits are tiny). |
| Encryption | HTTPS everywhere (HSTS); Supabase encrypts data at rest. |
| Session handling | HttpOnly cookies refreshed by the proxy; global sign-out on deletion. |
| Error boundaries | Friendly error screens for pages, the app and the root layout; no stack traces shown. |
| Rate limiting | Plan quotas, cost caps, one AI run at a time, 3 M-Pesa prompts per 10 minutes. **Before scale:** add Vercel Firewall rate rules on `/api/*`. |
| Input validation | zod on every request body and every AI tool input; size limits. |
| Logging | Server errors logged without secrets or prompts. **Before scale:** send logs to a log drain. |
| Backup | Supabase daily backups on paid plans. **Before launch:** move to Supabase Pro for backups + point-in-time recovery. |
| Monitoring | Vercel Analytics (cookieless). **Before scale:** add error tracking (Sentry or Vercel Observability) and alerts. |
| Dependency scanning | Web: `npm audit` 0 known vulnerabilities, exact versions pinned. Mobile: 28 advisories (18 high, 10 moderate), all inside Expo SDK 57's own dependency tree, mostly build tooling that never ships in the app (Metro, micromatch/braces, node-forge in code signing, xcode/uuid). Forcing fixes would break the SDK; take Expo patch releases (`npx expo install --fix`) and re-audit before each store build. **Ongoing:** enable Dependabot. |

## Legal and trust checklist

| Item | Status |
|---|---|
| Privacy policy, terms, cookie notice, refund policy | Drafted at `/legal/*`. **Must be reviewed by a Kenyan advocate before launch.** |
| Cookie consent | Not needed: only strictly necessary cookies; analytics are cookieless (documented in the cookie notice). |
| Consent wording on forms | Sign-in links to terms and privacy; leads carry consent flags; EMMA refuses broadcasts to people without consent. |
| Only collect what's needed | Email, name, workspace, usage, payment receipt. No card numbers. |
| Third parties | All listed in the privacy policy (Supabase, Vercel, Anthropic, Stripe, Safaricom). |
| Accessibility | WCAG 2.2 AA contrast measured, keyboard paths, focus traps in dialogs, labels, skip links, reduced motion. |
| No fake reviews or testimonials | None on the site. |
| No claims you can't prove | Removed "prices include VAT" and similar; the landing page only claims what the product does. |
| Real business details | Footer and legal pages read them from environment settings. **Before launch:** set the registered name, address and contact email. |
| Rights to assets | Fonts are open-licence Google Fonts; icons and the orb are our own. |
| Which laws apply | Kenya Data Protection Act 2019 (register with the ODPC as controller/processor), Consumer Protection Act, Kenya tax record rules. App Store / Play Store payment rules apply to the mobile apps (see DevelopmentPlan). |

## Accepted risks (for now)
- The CSP allows inline scripts because Next.js hydration needs them; React's escaping is the main XSS defence. Revisit with nonces.
- A free user could edit their workspace document directly to exceed the lead count shown in the UI. It costs us only storage; approvals still enforce the cap.
