# EMMA · Empowered Marketing & Media Assistant

**LionsLane is the service. EMMA is the product.**

EMMA is the marketing team that already knows your business. Brief her in one sentence; she plans the month, writes the posts, ads and emails, and finds leads worth calling. Nothing goes out until you approve it.

**Plans:** Free (Claude Haiku 5.5) · Pro **KES 500/month** (Claude Sonnet 5.5) · Max **KES 1,500/month** (Claude Opus 5.5). Pay with M-Pesa or card.

Live: **https://emma.lionslane.co.ke**

## The African problem

Small businesses across Africa do not have a writing problem. Free tools already write. They have a **consistency and follow-up** problem: they post for a week and then stop, and the customer who asked the price on WhatsApp goes quiet and is never chased.

The tools that exist were not built for this market. They are English first, desktop first, and priced for agencies. The lead data that European and North American teams take for granted (Apollo, Lusha, LinkedIn Sales Navigator) is licensed in dollars per seat per month, which puts reliable B2B and B2C contact discovery out of reach for most African SMEs, and very little of it is mapped for African small business sectors.

EMMA runs the marketing a small business actually does: a one sentence brief in, a month of calendar, campaigns, follow up messages and leads out, in local currency, over WhatsApp, inside the local data protection law, and approved by the owner with **Sawa** or **Bado** before anything leaves.

**Kenya is the case study and the first launch market.** It is where EMMA was born, where Lions Lane already runs marketing for real businesses, and where the workflow was tested in shillings, M-Pesa and WhatsApp. The same design travels across East Africa and the rest of the continent, because the constraints repeat: mobile first, cash and mobile money, informal lead capture, and a marketing budget measured in tens of dollars a month.

## Why this saves a business money

- **No second lead database to buy.** Lead discovery happens inside the workspace and through metered web search that is already included in the plan, instead of a per seat contact database billed in dollars.
- **A fixed AI ceiling per plan.** Free, Pro and Max each carry a hard monthly AI cost cap, so a busy month cannot produce a surprise bill.
- **Fewer tools to pay for.** Plan, copy, calendar, follow up and a sendable WhatsApp message come out of one brief, so there is no separate scheduler, design tool or retainer keeping the calendar full.
- **Deterministic work stays in code.** Pricing, SMS segment maths, site audits and metering are not model calls, so they cost nothing per use.

## How we kept tokens low

1. **One cached persona block, byte-identical on every request**, so the expensive system prompt is billed as a cache read instead of fresh input on each brief.
2. **Bounded briefs:** zod caps the input at 4,000 characters, the agent loop stops at 14 tool steps, and tools read the workspace server-side rather than making the model re-read history.
3. **Deterministic work stays out of the model:** pricing, SMS segment maths, site audits and metering are code. The Swahili/Sheng localiser (`emma-sheng`) runs on a phrase bank with zero model calls at runtime.

## Run it locally

```bash
npm install
cp .env.example .env.local      # add ANTHROPIC_API_KEY; Supabase optional
npm run dev                     # http://localhost:5180
```

Without Supabase settings the app runs as a browser-only demo (Jua Coffee Co., fictional). With them, you get real accounts, onboarding, plans and payments.

Mobile app: `cd mobile && npm install && npx expo start` (Expo Go QR code) or `npx expo start --web`.

## What's where

| Area | Path |
|---|---|
| Landing, pricing, legal | `src/app/page.tsx`, `src/app/legal/*` |
| Sign-in, onboarding | `src/app/signin`, `src/app/app/welcome` |
| App surfaces | `src/app/app/*` (Command Center, Dashboard, Calendar, Campaigns, Leads, Email, Library, Catalog, ROI & Compliance, Billing, Business profile, Pitch Jury) |
| API | `src/app/api/*` (emma, jury, proposals, workspaces, account, billing) |
| Server helpers | `src/lib/server/*` (auth, quotas, agent loop, billing) |
| Plans and limits | `src/lib/plans.ts` |
| Database schema + RLS | `supabase/migrations/` |
| Mobile app (Expo) | `mobile/` |

## Documents

The **EMMA Build Pack v2.0** is in `docs/`. Start at [00Readme](docs/00Readme.md), or read everything in one file: [EmmaComplete.md](docs/EmmaComplete.md).

01 Vision · 02 PRD · 03 MVP Scope · 04 App Flow · 05 Brand Guidelines (Sokoni) · 06 Design Brief · 07 Screen Specs · 08 TRD · 09 Data Schema · 10 API Reference · 11 AI Agent · 12 Billing · 13 Security · 14 Mobile · 15 Legal · 16 Implementation Plan · 17 Agent Rules. Older v1 documents are in `docs/archive/v1/`. Agents read [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).

## Commands

| Task | Command |
|---|---|
| Dev | `npm run dev` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Mobile typecheck | `cd mobile && npx tsc --noEmit` |

## Status

Built and verified locally on the v1.1 (B-18) design. Next: the Sokoni redesign (phase 6), then deploy with LionsLane's Supabase, Vercel, Anthropic, payment, Apple and Google accounts. Both are in [docs/16ImplementationPlan.md](docs/16ImplementationPlan.md).
