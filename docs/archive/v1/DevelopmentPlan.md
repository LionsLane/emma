# EMMA: Development Plan

Phases, in order. Each phase ends working, tested and documented before the next starts. Status as of 2026-10-14.

| # | Phase | Scope | Status |
|---|---|---|---|
| 0 | Documents | PRD, Architecture (TRD), Essentials, MVP scope, User flows, Design system, Validation, AGENTS.md, CLAUDE.md | Done |
| 1 | Backend + security | Supabase schema with RLS (33 automated checks pass), accounts, server-side history, quotas, one-run lock, plans, metering, headers, security review | Done (code); needs a Supabase project |
| 2 | Cloud client | Sign-in (email code + Google), onboarding, workspace sync with version checks, server conversations, proposals via API, demo mode kept for local dev | Done (code); live test needs a Supabase project |
| 3 | Billing | Billing page, M-Pesa STK flow, Stripe Checkout + portal, webhooks, upgrade sheet, usage meter | Done (code); needs Stripe and Daraja keys |
| 4 | UI/UX | Landing + pricing, de-cluttered surfaces, skeletons, semantic colours, ⌘K palette, toasts, kanban leads, calendar drag to reschedule, legal pages, accessibility pass, error boundaries | Done |
| 5 | Mobile MVP | Expo app: sign in, brief, approve, calendar, leads, account | Done (code, typecheck, expo-doctor 21/21, web bundle); device test needs the live backend |
| 6 | Deploy | Supabase project + migration, Vercel project + env, custom SMTP, Stripe/Daraja keys, domain, analytics | Needs LionsLane accounts |
| 7 | Launch test | 10 owner interviews, 20 paying Pro users in 30 days (see Validation.md) | After deploy |
| 8 | v1.1 | Push notifications, Monday brief, team invites, Swahili, in-app purchases via RevenueCat (required before charging inside the iOS/Android apps) | Planned |
| 9 | v2 | Publishing to Meta/TikTok/LinkedIn, ads and GA4 sync, image generation | Planned |

## Definition of done (every phase)
Typecheck + build pass · the affected screens checked in a browser at desktop and 390px · console clean · keyboard pass · docs updated · no secrets in code.
