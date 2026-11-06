# EMMA Build Pack

**Version 2.0 · 15 October 2026 · Owner: LionsLane**

Everything needed to build EMMA fully, from product to pixels to payments. Hand this folder (or the single combined file `EmmaComplete.md`) to any builder, human or AI, and they should be able to build the whole app without asking what anything means.

**LionsLane is the service. EMMA is the product.**

## Reading order

| # | Document | Answers |
|---|---|---|
| 01 | [Vision](01Vision.md) | What EMMA is, who it's for, why it will last |
| 02 | [PRD](02PRD.md) | Every feature, requirement by requirement |
| 03 | [MVP Scope](03MVPScope.md) | What's in version 1 and what isn't |
| 04 | [App Flow](04AppFlow.md) | What every click does and which screen comes next |
| 05 | [Brand Guidelines](05BrandGuidelines.md) | The Sokoni brand: story, logo, voice, colour, type, motifs |
| 06 | [Design Brief](06DesignBrief.md) | Tokens, components, motion, accessibility |
| 07 | [Screen Specs](07ScreenSpecs.md) | How every screen looks and behaves, web and mobile |
| 08 | [TRD](08TRD.md) | Tech stack, architecture, rules that must never break |
| 09 | [Data Schema](09DataSchema.md) | Where data lives and who can see it |
| 10 | [API Reference](10APIReference.md) | Every endpoint, request, response, error |
| 11 | [AI Agent](11AIAgent.md) | EMMA's brain: prompt, tools, models, the Pitch Jury |
| 12 | [Billing](12Billing.md) | Plans, quotas, M-Pesa, cards |
| 13 | [Security](13Security.md) | Threats, fixes, checklists |
| 14 | [Mobile](14Mobile.md) | The iOS and Android app, store listing |
| 15 | [Legal](15Legal.md) | Privacy, terms, cookies, refunds, Kenyan law |
| 16 | [Implementation Plan](16ImplementationPlan.md) | Build order, status, what the owner must supply, launch checklist |
| 17 | [Agent Rules](17AgentRules.md) | Instructions for AI coding agents working on EMMA |

The v1 documents (PRD, Architecture, Security Review, Launch Checklist and others) are kept for reference in `archive/v1/`. Everything in them is merged into the numbered set above.

## Version history

| Version | Date | Change |
|---|---|---|
| 2.0 | 2026-10-15 | Full build pack. New brand: **Sokoni** (replaces B-18). Screen-by-screen specs, API and data references, billing, mobile, legal. |
| 1.1 | 2026-10-09 | Supabase backend, plans (Free / KES 500 / KES 1,500), security review, mobile MVP. |
| 1.0 | 2026-10-08 | First build: nine surfaces, agent loop, Pitch Jury. |

## Status in one paragraph

The web app (Next.js) and mobile app (Expo) are code-complete on the v1.1 design (B-18). Accounts, database rules (33 automated checks pass), plans, quotas, M-Pesa and Stripe billing, the agent and the Pitch Jury are built and tested against a mock AI service. Two things remain: build the **Sokoni** redesign specified here (16 Implementation Plan, phase 6), and connect LionsLane's accounts (Supabase, Vercel, Anthropic, Stripe or Paystack, Safaricom Daraja, Apple, Google) to launch.
