# 02 · Product Requirements (PRD)

**EMMA Build Pack v2.0 · 2026-10-15**

Feature by feature. Each requirement has an ID so builders, tests and tickets can refer to it. Screen details are in 07 Screen Specs; data in 09; endpoints in 10.

## Goals for v1
1. A business signs up free, sets up in under 5 minutes, and approves its first plan in session one.
2. Every AI action is a proposal a person approves. No auto-posting.
3. Paid plans are profitable per user at the listed price.
4. Web and native app (iOS + Android) on one backend.
5. Secure by default: real accounts, data isolated per business, no open credit-spending endpoints.

## Plans (summary; full detail in 12 Billing)

| | Free | Pro | Max |
|---|---|---|---|
| Price | KES 0 | KES 500/month | KES 1,500/month |
| Model | Claude Haiku 5.5 | Claude Sonnet 5.5 | Claude Opus 5.5 |
| Briefs/month | 15 | 30 | 35 |
| Web searches/month | 0 | 15 | 40 |
| Workspaces / seats | 1 / 1 | 1 / 1 | 3 / 3 |
| Leads stored | 50 | 1,000 | Unlimited |
| Pitch Jury | none | none | 4 trials/month |
| Monthly AI-cost cap | USD 0.15 | USD 1.90 | USD 5.80 |

---

## F1 · Accounts
- **F1.1** Sign up and sign in with email + 6-digit code (OTP). Google sign-in on web.
- **F1.2** New account automatically gets a profile and a Free subscription.
- **F1.3** Sessions persist; signing out clears local business data from the device.
- **F1.4** Delete account: type DELETE to confirm; sessions revoked, then all data deleted (usage kept anonymised for accounting).
- **F1.5** Export all workspace data as JSON at any time.
- *Acceptance:* a new email can go from landing to the desk in under 60 seconds excluding email delivery.

## F2 · Onboarding
- **F2.1** Three steps: (1) business name, what you sell, where; (2) who buys (chips) and where you sell (channels); (3) brand voice (one of four "vibes", editable later).
- **F2.2** Creates the workspace server-side within the plan's allowance.
- **F2.3** Immediately sends EMMA a starter brief: a two-week content plan with copy for those channels. The first brief cards are dealt onto the desk.
- **F2.4** First approval triggers a one-time celebration (kanga band animation) and a tip on where the posts went.
- *Acceptance:* 40% of sign-ups approve at least one card in session one (tracked).

## F3 · The Desk (Command Center)
- **F3.1** Brief pad: write a brief in plain words; quick briefs as tabs (Plan my week, Follow up leads, Write a post, Plan a campaign, Draft a sequence, How did last month go, Find prospects).
- **F3.2** EMMA streams her reply as margin notes, with live status ("Reading your calendar", "Searching the web") and source links.
- **F3.3** Proposals arrive as brief cards: kind, title, what's inside, review note if something must be checked. Actions: **Sawa** (approve and add), **Bado** (discard), **Edit** (open and change before stamping).
- **F3.4** Threads are saved server-side and continue on any device; "New thread" starts fresh; past threads are listed.
- **F3.5** "On your desk" panel: pending cards, coming-up key dates, tasks due, who to call today.
- **F3.6** Usage shown as briefs left this month; at 80% a gentle upgrade prompt; at 100% the upgrade sheet.
- **F3.7** Ask EMMA from any screen (side drawer, same thread).
- **F3.8** Command palette (Ctrl/⌘ K): jump anywhere, run quick briefs, or type a brief directly.

## F4 · Wall Planner (Content Calendar)
- **F4.1** Month and week views; list ("dossiers") view.
- **F4.2** Every entry carries the full dossier: date, sector, content type, platform, angle, featured business + contact details, linked offering, objective, KPI, audience, content mix, best practice, theme pillar, owner, draft due, review date, publish date, asset link, repurposing plan, campaign, status, copy.
- **F4.3** Drag a card to another day to reschedule; draft and review dates shift by the same amount.
- **F4.4** Status: idea → drafting → in review → scheduled → published.
- **F4.5** Key dates (holidays, launches, seasons) show as kanga banners on their days.
- **F4.6** "Write this one" asks EMMA to draft the copy for an entry.
- **F4.7** Copy to clipboard and "Share to WhatsApp" (opens WhatsApp with the copy) for publishing by hand.

## F5 · Tickets (Leads)
- **F5.1** Board of stages shown to users as **New, Talking, Serious, Quote sent, Won, Lost** (stored as new, contacted, qualified, proposal, won, lost).
- **F5.2** Drag tickets between stages; keyboard users change stage in the ticket sheet.
- **F5.3** Each ticket: name, company, role, phone, email, social, source (+ link), score (hot ≥ 75, warm ≥ 50, cold), value, last touch, notes, consent, verified.
- **F5.4** Call, WhatsApp and email in one tap.
- **F5.5** "Who to call today": open tickets untouched for 3+ days, sorted by score × value.
- **F5.6** "Draft next touch": EMMA drafts the next message, respecting consent (no broadcasts to people without consent).
- **F5.7** Researched leads arrive unverified, without consent, with the source link; "Mark verified" and "Record consent" actions.
- **F5.8** Weighted forecast: sum of open value × stage weight (new .05, contacted .15, qualified .35, proposal .6).
- **F5.9** Lead cap per plan enforced when approving lead proposals.

## F6 · Campaigns
- **F6.1** Table of paid campaigns: platform (LinkedIn, Meta, Google, Display, TikTok), status, budget, spent, impressions, clicks, CTR, CPC, conversions, ROAS.
- **F6.2** Pause/resume; open a campaign for details and ad copy; "Diagnose" asks EMMA for fixes.
- **F6.3** Figures are entered by the team or proposed by EMMA in v1 (no ad-account sync until v2).

## F7 · Email & WhatsApp sequences (Email Hub)
- **F7.1** Broadcasts and automations (multi-step with delays).
- **F7.2** Opted-in audiences only; EMMA is instructed never to target people without consent.
- **F7.3** Analytics: sent, open rate, click rate, top subject lines.

## F8 · Shelf (Content Library)
- **F8.1** Searchable assets by type (copy, image, video, document, presentation, design, template) and tag.
- **F8.2** Copy EMMA wrote lands here when approved; editable; copy to clipboard.

## F9 · Stall (Catalog)
- **F9.1** Offerings with price, customers, rating, repeat or completion rate, revenue.
- **F9.2** "Campaign" builds a full launch for an offering; "Put on trial" opens the Pitch Jury (Max/staff).

## F10 · Ledger (Dashboard) and ROI & Compliance
- **F10.1** Ledger: this week in one data-backed sentence, six numbers (leads this month with pace, pipeline value with weighted, ad spend, ROAS, email open rate, posts scheduled), activity, tasks, sparklines over full months.
- **F10.2** ROI: six-month spend vs revenue (one axis, two series), ROAS by channel, cost per lead, marketing ROI.
- **F10.3** Compliance: Kenya DPA checklist with status (OK / Attention / At risk, always icon + word), "Audit with EMMA".

## F11 · Business Profile (the six inputs)
- **F11.1** Identity: name, tagline, industry, location, currency, website.
- **F11.2** The six inputs EMMA works from: sectors; offerings; partners; key dates; brand voice (voice, pillars, always, never) and palette; compliance regime.
- **F11.3** Palette re-skins accents for agency client workspaces (brand-safe range only, see 05).
- **F11.4** Usage this month; "Where your data goes" disclosure; export, import (validated), new workspace (plan limit), delete account.

## F12 · Billing
- **F12.1** Plan page: current plan, usage, three plans side by side.
- **F12.2** M-Pesa: enter number → STK PIN prompt → waiting state → confirmed → plan active (30 days). "I've paid, check now" if it stalls.
- **F12.3** Card: Stripe Checkout (or Paystack) → return → plan active when webhook lands (polls up to 30 s).
- **F12.4** Manage card subscription (portal). Cancel keeps the plan to period end.
- **F12.5** Upgrade sheet opens on limit hit or from the usage meter.

## F13 · Pitch Jury (staff + Max)
- **F13.1** Case: title, kind, context, pitch, audience, price; or start from a catalog offering.
- **F13.2** Nine isolated jurors vote in parallel (guilty / not guilty, headline, reasoning, fix, confidence); verdicts appear as each finishes.
- **F13.3** Foreperson summarises, lists the objections that matter, rewrites the pitch without inventing facts (unknowns in [brackets]); "Use for next round".
- **F13.4** Every round kept; 9/9 acquittal offers "Hand it to EMMA" to build a launch.

## F14 · Bring-them-back loop (v1.1)
- **F14.1** Monday brief: what's planned, who to call, one suggestion (in-app card; push on mobile).
- **F14.2** Reminders for cards waiting more than 24 hours.
- **F14.3** Key-date nudges 7 days before.
- **F14.4** Streak: weeks in a row with something published.

## F15 · Mobile app
Sign in, the Desk (brief + stream + stamp cards; swipe right to Sawa, left to Bado), Planner list, Tickets with tap-to-call/WhatsApp, Me (plan, usage, privacy, sign out). No purchasing in-app in v1. See 14 Mobile.

## F16 · Admin (LionsLane)
Staff flag (server-only) unlocks Max limits and the Pitch Jury; manual plan grants via SQL in v1; usage and AI cost per user from `usage_events`.

## Non-functional requirements
- **NF1 Performance:** first load < 2.5 s on 4G; skeletons within 100 ms; streaming text starts < 3 s after send.
- **NF2 Accessibility:** WCAG 2.2 AA (see 06).
- **NF3 Responsive:** works from 360 px; mobile web has a bottom tab bar.
- **NF4 Privacy:** Kenya DPA; data processing disclosure in-product; sub-processors listed.
- **NF5 Reliability:** a failed AI turn never corrupts history; a failed payment never grants a plan; version-checked saves never silently overwrite.
- **NF6 Cost:** AI cost per paid user ≤ 50% of plan revenue.

## Success metrics
Activation (first Sawa in session 1) ≥ 40% · week-4 retention ≥ 25% · Free→paid ≥ 4% · approval rate ≥ 50% · AI cost ≤ 50% of revenue per paid user.
