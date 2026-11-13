# 16 · Implementation Plan

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces DevelopmentPlan.md and LaunchChecklist.md

Phases in order. Each one ends working, tested and documented before the next starts.

## 1. Status
| # | Phase | Scope | Status |
|---|---|---|---|
| 0 | Documents | This build pack (00–17) | Done |
| 1 | Backend + security | Schema, RLS (33 tests), accounts, server history, quotas, run lock, plans, metering, headers | Done in code; needs a Supabase project |
| 2 | Cloud client | Sign in, onboarding, version-checked sync, server threads, proposals via API, demo mode | Done in code |
| 3 | Billing | Billing page, M-Pesa STK, Stripe Checkout + portal + webhook, upgrade sheet, meters | Done in code; needs keys |
| 4 | UI/UX v1 (B-18) | Landing, skeletons, palette, toasts, kanban, drag-to-reschedule, legal, a11y, error boundaries | Done |
| 5 | Mobile MVP | Expo: sign in, Desk, Planner, Tickets, Me | Done in code; device test needs backend |
| **6** | **Sokoni redesign** | Brand v2 in code (below) | **Next** |
| 7 | Deploy | Supabase, Vercel, SMTP, keys, domain | **Live** at https://emma.lionslane.co.ke since 6 Nov 2026 (accounts, database, security pass the live test). AI, payments and custom email wait for owner keys (section 3a) |
| 8 | Launch test | 10 owner interviews, 20 paying Pro users in 30 days | After deploy |
| 9 | v1.1 | Push + Monday brief, Bado reasons, team invites, Swahili UI, RevenueCat IAP, M-Pesa renewal reminders | Planned |
| 10 | v2 | Publishing to Meta/TikTok/LinkedIn, WhatsApp Business API, ads + GA4 sync, image generation | Planned |

## 2. Phase 6: Sokoni redesign (detailed)
Goal: the app looks and feels like 05–07, with no change to data flow or security. Estimated 6–8 working days for one developer with an AI agent.

| Step | Work | Files | Done when |
|---|---|---|---|
| 6.1 Tokens + fonts | Replace B-18 tokens with Sokoni tokens (06 §2), Mchana/Usiku/System theme switch; load Instrument Serif, Bricolage Grotesque, IBM Plex Mono via `next/font/google`; grain tile; remove glass, glow and gradients | `globals.css`, `site.css`, `layout.tsx`, `public/grain.png` | Every page renders in both themes with no hardcoded colours (`grep '#[0-9a-f]{3,6}' src/components src/app/app` finds none outside tokens) |
| 6.2 Logo + stamp | Wordmark component, `Stamp` SVG component (variants e / Sawa / Bado, date ring), favicon and app icons | `components/brand.tsx`, `app/icon.svg`, `mobile/assets/*` | Favicon, sidebar and sign-in use the new marks |
| 6.3 Shell | Sidebar (paper-2, saffron underline), top bar, kanga band, renamed nav (Desk, Wall Planner, Tickets, Campaigns, Email Hub, Shelf, Stall, Ledger, ROI), tab bar | `Shell.tsx`, `Chrome.tsx` (NAV) | Nav labels match 04; 360px and 1440px layouts correct |
| 6.4 Components | Buttons (primary/EMMA/secondary/quiet/danger), chips, inputs, sheet, modal, toast, palette, meter, skeletons, empty states | `ui.tsx`, `globals.css` | Component sheet page (dev-only `/app/_kit`) shows every state |
| 6.5 The Desk | Brief pad (ruled, Dear EMMA), margin notes, brief cards with folded corner, Sawa/Bado stamp interaction + keyboard S/B/E, On your desk column, greeting sentence, new quick briefs (11 §8) | `app/app/page.tsx`, `Chat.tsx`, new `BriefCard.tsx`, `StampButton.tsx` | Brief → cards dealt → Sawa stamps and files to planner; reduced-motion path works |
| 6.6 Wall Planner | Masking-tape headers, sticky notes, kanga banners, week view, dossier sheet | `app/app/calendar/page.tsx` | Drag + "Move to…" both reschedule; Undo toast |
| 6.7 Tickets | Ticket component, renamed stage labels, column totals, Who to call today | `app/app/leads/page.tsx` | Stage labels New/Talking/Serious/Quote sent/Won/Lost; stored values unchanged |
| 6.8 Ledger + others | Ledger numbers + data sentence; Shelf, Stall price tags, Campaigns, Email Hub, ROI restyle | `app/app/*` | Each screen passes the 06 §10 quality bar |
| 6.9 Public pages | Landing with live desk preview, sign in, legal, 404/error | `page.tsx`, `signin/*`, `legal/*`, error files | Lighthouse a11y ≥ 95, LCP < 2.5 s |
| 6.10 Palette migration | `{primary, accent, aiFrom, aiTo}` → `{link, accent}` with contrast validation, on load and import | `store.ts`, `importWorkspace.ts`, settings | Old workspaces load with a valid palette |
| 6.11 Mobile | `theme.ts` tokens, fonts, swipe-to-stamp, haptics, icons, splash | `mobile/src/*`, `app.json` | Expo web + Expo Go show Sokoni; tsc + expo-doctor pass |
| 6.12 Prompt | Add Sokoni voice lines to PERSONA (11 §2) | `lib/agent/prompt.ts` | Mock run shows first-person margin notes |
| 6.13 Screens + docs | New screenshots in `docs/screens/`, update README | `docs/` | Screenshots match the build |

**Don't change in phase 6:** API shapes, database schema, plan limits, security controls.

## 3a. Live setup (updated 7 November 2026)

| Part | Where | State |
|---|---|---|
| Web app | Vercel project `emma` (account stevenkamau700-4495), https://emma.lionslane.co.ke (fallback https://emma-omega-two.vercel.app); repo LionsLane/emma; Next.js 16.4.3 (security patch) | Live |
| Domain | Cloudflare zone lionslane.co.ke: CNAME `emma` to `5c9a6e443203e4ec.vercel-dns-017.com`, DNS only | Live, HTTPS |
| Database and sign-in | Supabase project **EMMA**, ref `vxxybllgluasxtohnntu`, Frankfurt; migrations applied (incl. `paystack_payments`) | Live |
| Sign-in | Email code, email link (`/auth/confirm`), passkeys, Google (own GSI button, pop-up, redirect fallback; Google Cloud project EMMA, client "EMMA web"), two-step (authenticator, passkey) | Live; Google tested in Chrome with two accounts |
| Account screens | Initials button (top right): Your profile, Business profile, Sign-in security, Plan & billing, Log out; Log out on the setup screen | Live |
| Sign-in email | Brevo SMTP as EMMA <emma@lionslane.co.ke> | Live |
| EMMA's addresses | emma@ (sign-in sender), emmasupport@ (footer, terms), emmabilling@ (refunds, billing screen), emmaprivacy@ (privacy, DPA), emmasecurity@ (security policy, `/.well-known/security.txt`); Worker `lionslane-mailrouter` version 349e0075 | Live; Eve's copies start once she verifies her Cloudflare destination |
| Lions Lane website | EMMA tab, menu item, footer link and /emma page | Live |
| AI | Claude Console key `EMMA production` | Live |
| Cards | Stripe account **EMMA** (test mode, staff only). Prices: Pro `price_1UYp5dDt4BY5EyCmwe28lN5B`, Max `price_1UYp8oDt4BY5EyCmpKUwB72w`. Webhook "EMMA billing" `we_1UYpHfDt4BY5EyCmUBf4JlCq` | Live for staff tests; customers need Stripe verification |
| Paystack | Test key in Vercel; Test Callback `…/app/billing?paystack=1` and Test Webhook `…/api/billing/paystack/webhook` saved in the dashboard; `paystacktest.mjs` 9/9 | Live for staff tests; customers need compliance (5 sections) and live keys |
| M-Pesa | Daraja sandbox app "EMMA" (174379), staff only | Sandbox tested; go-live waits for a Till or PayBill |
| Search | Search Console verified (`public/googlecb964cb588b1659e.html`), sitemap submitted, home indexing requested; Bing Webmaster verified (meta `msvalidate.01`), sitemap submitted; IndexNow key `public/596183bc555688e726c2a523cae56da2.txt` (10 URLs accepted) | Live; Ahrefs Webmaster Tools waits for the owner's sign-in (API plan too small) |
| Analytics | Vercel Web Analytics (cookieless) and GA4 property EMMA `G-E9PQVEK9RS`, both loaded only after consent (`src/components/Consent.tsx`) | Live |
| Live tests | `e2e.mjs` 27/27, `mfatest.mjs` 7/7, `linktest.mjs` 5/5, `paygatetest.mjs` 2/2, `mpesatest.mjs` 5/5, `paystacktest.mjs` 9/9 (pass `--app=https://emma.lionslane.co.ke`) | All passed 7 Nov 2026 |

**Search & AI (9 Nov 2026):** `/app/search` with the free site audit (SEO, AIO, GEO, AXO), AI-visibility checks (Pro/Max), paste-ready fixes (LocalBusiness and FAQ schema, llms.txt, AI-crawler robots rules, title and description), a dashboard panel, and audit data in EMMA's `query_workspace`. Migration `20261109120000_search.sql` adds the `audit` and `visibility` usage kinds. Next phases from the emma.io comparison: Audiences and Automations (segments, IF-THEN recipes that propose, never send), then Smart links and funnels (tracked short links with QR, click-to-lead attribution, A/B copy).

**Growth suite (12 Nov 2026), answering emma.io's attribution, CRM, automation and A/B modules for small businesses instead of mobile apps:** Smart Links (`/app/links`: short links, channel UTM presets, QR codes in PNG and SVG, A/B pairs with a plain-language verdict, click analytics with people and bots apart), Audiences (`/app/audiences`: rule-based segments, starter audiences, consent-only CSV export), Automations (`/app/automations`: six recipes plus a builder; suggestions a person approves; consent hold-back; frequency caps), and dashboard panels (growth funnel, ready-for-you). Migration `20261109130000_links.sql`; `LINK_HASH_SECRET` in Vercel. Local builds on this 8 GB PC: `EMMA_BUILD_CPUS=2 npm run build`.

**Second emma.io pass (13 Nov 2026):** Broadcasts (`/app/broadcasts`: up to five versions, hold-out group, tracked link per version, send queue, report with a plain verdict), Smart audiences (loyal, hibernating, high value at risk, ready to close, new this week; rule-based from recency and value), lead tags, five more audience filters, a "tag the lead" automation action, lead CSV import, hashed customer-list exports for Meta and Google, and "Where customers come from" on the dashboard. Not built yet from their list: scheduled email reports, on-site banners and pop-ups, links on a customer's own domain. Not applicable to small businesses: install attribution, uninstalls, deep links into apps, geofencing.

Still open: Paystack compliance and live keys, Kopo Kopo, Daraja go-live (Till or PayBill), Stripe verification, EMMA on the Lions Lane Google Business Profile, Ahrefs Webmaster Tools, Google brand verification (shows "EMMA" on Google's screen), Eve's Cloudflare destination.

## 3. Phase 7: Deploy (owner-supplied items first)

### Owner items (blocking)
| Item | Needed for |
|---|---|
| Supabase account (Pro before payments) | Database, auth |
| Vercel account + domain (e.g. `emma.lionslane.co.ke`) | Hosting |
| Anthropic API key | EMMA |
| SMTP sender (e.g. Resend) on the domain | Sign-in emails |
| Daraja app + PayBill/Till with Lipa na M-Pesa Online | M-Pesa |
| Card processor decision (Stripe via supported entity, or Paystack/Flutterwave) | Cards |
| Registered company name, address, emails, phone | Footer, legal |
| Refund window, VAT position | Legal, billing |
| Bundle id confirmation, Apple + Google developer accounts | Mobile |

### Steps
1. **Supabase:** create project (region nearest Kenya, e.g. Frankfurt); run the migration (`supabase link` then `supabase db push`); copy URL, publishable and secret keys; enable Email OTP (template includes `{{ .Token }}`); connect custom SMTP; optional Google provider with redirect `https://<domain>/auth/callback`; set Site URL and redirect allow-list; mark staff (`update profiles set is_staff = true …`).
2. **Vercel:** push `emma/` to a private GitHub repo (owner confirms before any push); import in Vercel (root `emma`); set env vars (08 §4); add domain; enable Web Analytics; add a Firewall rule for `/api/*`.
3. **Payments:** create Pro and Max prices in KES; webhook to `/api/billing/stripe/webhook` with the four events; customer portal on. Daraja sandbox first, then production credentials; `MPESA_CALLBACK_SECRET` = 32+ random characters.
4. **Smoke test** (below), then announce.

## 4. Go-live checks
1. Fresh email → code → onboarding → starter plan streams → Sawa → planner updated.
2. Two accounts can't see each other's data.
3. Free account hits 15 briefs → upgrade sheet → M-Pesa sandbox → Pro with the right end date.
4. Card test → webhook → Pro; portal cancel keeps Pro to period end.
5. `npm audit` clean · `npm run build` passes · Lighthouse a11y ≥ 95 on landing and sign-in · headers present.
6. Mobile on a real phone against production: sign in, brief, swipe Sawa, call a ticket.

## 5. Phase 8: Launch test
- Week 1–2: 10 owner interviews (salons, cafés, dukas, trainers). Watch them brief EMMA; note where they hesitate.
- Founding offer: first 50 Pro users at KES 500 locked for 12 months.
- Distribution: LionsLane clients and referrals, The Other Side videos showing EMMA working in real time, WhatsApp SME groups, referral month.
- **Decision at day 30:** ≥ 20 paying Pro users → continue to v1.1; 5–19 → fix onboarding and offer, retest 30 days; < 5 → the buyer or the offer is wrong, go back to interviews.

## 6. Definition of done (every phase, every PR)
Typecheck + build pass · affected screens checked in a browser at 360px and desktop, in Mchana and Usiku · console clean · keyboard pass · docs updated · no secrets in code · for AI/billing/RLS changes, the relevant tests in 11 §10, 12 §8 and 13 §6 rerun.

## 7. Commands
```bash
npm run dev
```
```bash
npm run typecheck
```
```bash
npm run build
```
```bash
cd mobile && npx expo start
```
