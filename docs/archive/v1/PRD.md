# EMMA: Product Requirements

**LionsLane is the service. EMMA is the product.**
Owner: LionsLane · Status: v1 build · Last updated: 2026-10-09

## 1. What we're building

EMMA (Empowered Marketing & Media Assistant) is an AI marketing agent for small businesses. You brief her in one sentence and she plans the month, writes the posts, ads and emails, finds and scores leads worth calling, and keeps it all in one place. Nothing goes out until a person approves it.

One line: **the marketing team that already knows your business, from KES 0.**

## 2. Who it's for

| Persona | Situation | What they need from EMMA |
|---|---|---|
| **Owner-operator** (primary) | Runs a 1–20 person business in Kenya: salon, shop, clinic, training centre, café, agency. Sells on WhatsApp, Instagram, Facebook, LinkedIn. No marketer. | Something to post today, a plan for the month, follow-ups that don't slip. Cheap. Works on a phone. |
| **Marketing lead** | One person doing all the marketing at a 20–100 person SME. | A calendar, campaigns and leads in one place, faster drafts, proof of what's working. |
| **LionsLane strategist** (internal) | Runs EMMA for agency clients. | Many client workspaces, the Pitch Jury to stress-test offers, cost per client. |

Market: Kenya first (KES, M-Pesa, WhatsApp-first, Kenya Data Protection Act 2019), then East Africa.

## 3. Goals and non-goals

**Goals (v1)**
1. A business can sign up free, set up its profile in under 5 minutes, and get a usable content plan in its first session.
2. Every AI action is a proposal a person approves. No auto-posting.
3. Paid plans are profitable per user at the listed price (AI cost per user measured, not guessed).
4. Works on the web and as a native app (iOS + Android) from one backend.
5. Secure by default: real accounts, data isolated per business, no open endpoints that burn credits.

**Non-goals (v1)**
- Publishing directly to social platforms or ad accounts (v2).
- Syncing live ad / email / GA4 numbers (v2; numbers are entered or imported).
- White-labelling for other agencies.

## 4. Plans and pricing

| | **Free** | **Pro** | **Max** |
|---|---|---|---|
| Price | KES 0 | **KES 500 / month** | **KES 1,500 / month** |
| AI model | Claude Haiku 5.5 | Claude Sonnet 5.5 | Claude Opus 5.5 |
| Briefs to EMMA / month | 15 | 30 | 35 |
| Web research (searches / month) | – | 15 | 40 |
| Workspaces (brands) | 1 | 1 | 3 |
| Team seats | 1 | 1 | 3 |
| Pitch Jury | – | – | 4 trials / month |
| Leads stored | 50 | 1,000 | Unlimited |
| Export workspace | ✓ | ✓ | ✓ |
| Support | Help centre | Email | Priority + monthly LionsLane check-in (optional add-on) |

**Why these limits.** KES 500 ≈ USD 3.85 (at ~KES 129/USD; recheck). A typical brief costs roughly USD 0.005 on Haiku, 0.05–0.08 on Sonnet and 0.15–0.25 on Opus (estimates from token counts; replaced by real numbers from the usage table after launch). Each plan also has a **monthly AI-cost cap** (Free USD 0.15, Pro USD 1.90, Max USD 5.80, about half of revenue) so one unusually heavy user can't make a plan unprofitable. Limits live in one file (`src/lib/plans.ts`) and are tuned from real usage.

**Payments.** M-Pesa (STK push, monthly prepaid: pay, get 30 days) and cards via Stripe (auto-renewing subscription). Downgrade to Free at period end if unpaid; data is never deleted for non-payment.

**Upgrade moments.** Hitting a limit shows what you get on the next plan, never a dead end. The model is fixed per plan, so onboarding shows a sample Pro output to make the upgrade concrete.

## 5. Features

### 5.1 Accounts and onboarding
- Sign up / sign in with email (magic link or password) and Google.
- Onboarding: business name, what you sell, who you sell to, where you sell (channels), brand voice (pick a vibe + edit), palette (optional). EMMA drafts the six inputs from a short description; the user confirms.
- First-run: EMMA proposes a 2-week starter calendar automatically.

### 5.2 Command Center
- One composer: write or pick a quick command. Streaming replies with live status ("Reading your calendar", "Searching the web").
- Proposal cards: calendar entries, campaigns, leads, emails, tasks, library copy. Approve, edit, or discard. Review notes for anything sensitive.
- Threads saved server-side; continue on any device.
- Usage meter: briefs left this month, with upgrade prompt at 80%.

### 5.3 Operating surfaces
Dashboard · Content Calendar (month + list, full dossier per entry, drag to reschedule) · Campaigns · Leads (kanban pipeline, drag between stages, consent and verification flags) · Email Hub · Content Library · Catalog · ROI & Compliance · Client Profile.

### 5.4 Pitch Jury (internal + Max)
Nine isolated jurors vote on a pitch; a foreperson rewrites it. Built for LionsLane to stress-test offers. Available to staff and Max.

### 5.5 Bring-them-back loop
- Monday brief: what's scheduled, leads to follow up, one suggestion (in-app card; push on mobile).
- Approval reminders: proposals waiting > 24h.
- Key-date nudges: 7 days before a key date, EMMA offers a plan.
- Streak: weeks in a row with something published.

### 5.6 Mobile app (iOS + Android)
Same account and data. v1 scope: sign in, brief EMMA (streaming), approve proposals, calendar list, leads list with tap-to-call / WhatsApp, plan and usage, upgrade. Push notifications for approvals and the Monday brief (v1.1).

### 5.7 Billing
Plan page, M-Pesa STK push, Stripe Checkout + customer portal, receipts, status in-app.

### 5.8 Admin (LionsLane)
Users and plans, manual plan grants, usage and AI cost per user, jury.

## 6. Requirements

**Functional**
- R1 Every AI request is authenticated, attributed to a user and workspace, metered, and checked against the plan before it runs.
- R2 The server loads the workspace itself; it never trusts a workspace or conversation sent by the client.
- R3 Proposals change nothing until approved; approval is recorded (who, when).
- R4 A user can only read or write workspaces they are a member of (enforced in the database, not just the UI).
- R5 Payments only change a plan after the payment is verified server-side (signed Stripe webhook; M-Pesa confirmed by querying Safaricom).
- R6 Export all workspace data as JSON at any time. Delete account on request.

**Non-functional**
- Web: first load under 2.5s on 4G; works at 360px width.
- Accessibility: keyboard navigable, visible focus, status never colour-only, reduced-motion respected.
- Privacy: Kenya DPA. Privacy notice, data processing agreement for business clients, Anthropic and Stripe/Safaricom named as sub-processors, cross-border transfer disclosed.
- Reliability: a failed AI turn never corrupts the conversation; a failed payment never grants a plan.

## 7. Success metrics
Activation (profile + first approved proposal in session 1) ≥ 40% · Week-4 retention ≥ 25% · Free→paid ≥ 4% · AI cost ≤ 50% of plan revenue per paid user · Proposal approval rate ≥ 50%.

## 8. Open questions
- Exchange-rate assumption and the final limit numbers after two weeks of real usage.
- Whether a LionsLane strategist check-in becomes a paid add-on on Max.
- Stripe availability: Stripe does not onboard Kenyan-registered businesses directly; card billing may need Stripe via a supported entity, or Paystack/Flutterwave as the card processor. Code keeps the provider behind one interface.
