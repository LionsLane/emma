# EMMA · Empowered Marketing & Media Assistant

**LionsLane is the service. EMMA is the product.**

EMMA is the marketing team that already knows your business. Brief her in one sentence; she plans the month, writes the posts, ads and emails, and finds leads worth calling. Nothing goes out until you approve it.

**Plans:** Free (Claude Haiku 5.5) · Pro **KES 500/month** (Claude Sonnet 5.5) · Max **KES 1,500/month** (Claude Opus 5.5). Pay with M-Pesa or card.

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
