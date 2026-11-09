# EMMA · The Complete Build Pack

**Version 2.0 · 15 October 2026 · LionsLane**

Every EMMA document in one file: product, brand, design, screens, architecture, data, API, AI, billing, security, mobile, legal, plan and agent rules. Generated from `docs/00Readme.md` to `docs/17AgentRules.md`; edit those files, not this one.

## Contents

- [EMMA Build Pack](#part00)
- [01 · Vision](#part01)
- [02 · Product Requirements (PRD)](#part02)
- [03 · MVP Scope](#part03)
- [04 · App Flow](#part04)
- [05 · Brand Guidelines: Sokoni](#part05)
- [06 · Design Brief: the Sokoni design system](#part06)
- [07 · Screen Specs](#part07)
- [08 · Technical Requirements (TRD and Architecture)](#part08)
- [09 · Data Schema](#part09)
- [10 · API Reference](#part10)
- [11 · The AI Agent](#part11)
- [12 · Plans and Billing](#part12)
- [13 · Security](#part13)
- [14 · Mobile App and Store Listing](#part14)
- [15 · Legal and Compliance](#part15)
- [16 · Implementation Plan](#part16)
- [17 · Agent Rules](#part17)

---

<a id="part00"></a>

## EMMA Build Pack

**Version 2.0 · 15 October 2026 · Owner: LionsLane**

Everything needed to build EMMA fully, from product to pixels to payments. Hand this folder (or the single combined file `EmmaComplete.md`) to any builder, human or AI, and they should be able to build the whole app without asking what anything means.

**LionsLane is the service. EMMA is the product.**

### Reading order

| # | Document | Answers |
|---|---|---|
| 01 | [Vision](#part01) | What EMMA is, who it's for, why it will last |
| 02 | [PRD](#part02) | Every feature, requirement by requirement |
| 03 | [MVP Scope](#part03) | What's in version 1 and what isn't |
| 04 | [App Flow](#part04) | What every click does and which screen comes next |
| 05 | [Brand Guidelines](#part05) | The Sokoni brand: story, logo, voice, colour, type, motifs |
| 06 | [Design Brief](#part06) | Tokens, components, motion, accessibility |
| 07 | [Screen Specs](#part07) | How every screen looks and behaves, web and mobile |
| 08 | [TRD](#part08) | Tech stack, architecture, rules that must never break |
| 09 | [Data Schema](#part09) | Where data lives and who can see it |
| 10 | [API Reference](#part10) | Every endpoint, request, response, error |
| 11 | [AI Agent](#part11) | EMMA's brain: prompt, tools, models, the Pitch Jury |
| 12 | [Billing](#part12) | Plans, quotas, M-Pesa, cards |
| 13 | [Security](#part13) | Threats, fixes, checklists |
| 14 | [Mobile](#part14) | The iOS and Android app, store listing |
| 15 | [Legal](#part15) | Privacy, terms, cookies, refunds, Kenyan law |
| 16 | [Implementation Plan](#part16) | Build order, status, what the owner must supply, launch checklist |
| 17 | [Agent Rules](#part17) | Instructions for AI coding agents working on EMMA |

The v1 documents (PRD, Architecture, Security Review, Launch Checklist and others) are kept for reference in `archive/v1/`. Everything in them is merged into the numbered set above.

### Version history

| Version | Date | Change |
|---|---|---|
| 2.0 | 2026-10-15 | Full build pack. New brand: **Sokoni** (replaces B-18). Screen-by-screen specs, API and data references, billing, mobile, legal. |
| 1.1 | 2026-10-09 | Supabase backend, plans (Free / KES 500 / KES 1,500), security review, mobile MVP. |
| 1.0 | 2026-10-08 | First build: nine surfaces, agent loop, Pitch Jury. |

### Status in one paragraph

The web app (Next.js) and mobile app (Expo) are code-complete on the v1.1 design (B-18). Accounts, database rules (33 automated checks pass), plans, quotas, M-Pesa and Stripe billing, the agent and the Pitch Jury are built and tested against a mock AI service. Two things remain: build the **Sokoni** redesign specified here (16 Implementation Plan, phase 6), and connect LionsLane's accounts (Supabase, Vercel, Anthropic, Stripe or Paystack, Safaricom Daraja, Apple, Google) to launch.

---

<a id="part01"></a>

## 01 · Vision

**EMMA Build Pack v2.0 · 2026-10-15**

### The one line
**EMMA is the marketing team that already knows your business, from KES 0.**

### What EMMA is
EMMA (Empowered Marketing & Media Assistant) is an AI marketing agent for small businesses, built in Nairobi by LionsLane. You brief her in one sentence. She reads what she knows about your business (what you sell, who buys, your calendar, your leads), then plans, writes and finds. Every piece of work arrives as a **brief card** on your desk. You stamp it **Sawa** to approve or **Bado** to send it back. Nothing goes out without you.

### Who it's for

| Persona | Their day | What they need |
|---|---|---|
| **Wanjiru, owner-operator** (primary) | Runs a 6-person salon in Kilimani. Sells through WhatsApp and Instagram. Posts when she remembers. Tried a KES 15,000 freelancer for two months, stopped. | Something to post today, a plan for the month, and follow-ups for the women who asked the price and went quiet. Cheap. On her phone. |
| **Brian, the one-person marketing team** | Does all the marketing at a 40-person training company. | A calendar, campaigns and leads in one place, faster drafts, and numbers he can show his boss. |
| **LionsLane strategist** (internal) | Runs marketing for agency clients. | Many client workspaces, the Pitch Jury to stress-test offers, cost per client. |

Market: Kenya first (shillings, M-Pesa, WhatsApp-first, Kenya Data Protection Act 2019), then East Africa.

### The problem, in owners' words
- "I don't know what to post."
- "I post for a week, then I stop."
- "People ask the price on WhatsApp and disappear."
- "Agencies are too expensive and freelancers vanish."

The real problem isn't writing. It's **consistency and follow-up**. Writing is the easy part, and free tools already do it.

### What EMMA must do best (in this order)
1. **Never let a lead go cold.** Track every enquiry, draft the next WhatsApp or email on time, and show "who to call today".
2. **Always know what to post.** A wall planner built around their offers, holidays and busy seasons, refilled every week.
3. **Prove it worked, in shillings.** Leads, sales and spend in one place.
4. **Stay in their voice and the law.** Brand voice, consent flags, approval before anything leaves.

### Why EMMA lasts (defensibility)
EMMA is not "AI that writes posts". That's a feature ChatGPT, Meta AI and Canva already ship. EMMA survives by being **the place a small business runs its marketing**.

| Startup killer | EMMA's honest answer |
|---|---|
| **Feature pretending to be a company** (biggest risk) | Platforms can copy text generation, not workflow. EMMA keeps your calendar, leads, follow-ups, history and brand voice. After three months, leaving means losing your marketing memory. |
| **Founders who don't know the industry** | LionsLane runs marketing for real Kenyan businesses. EMMA is built from those playbooks. |
| **Marketplace with no wedge** | Not a marketplace. If one is ever added (strategists, designers): one city, one category, LionsLane as first supply. |
| **Hardware-style bad economics** | AI cost is our version. Model per plan, monthly cost caps, cost per user measured from day one, gross margin above 50% on paid plans. |
| **Demand that only exists because we push** | Measure pull: week-4 retention ≥ 25% without reminders, organic sign-ups rising, users referring other businesses. |

**What gets stronger as EMMA grows:** more businesses per sector give better sector playbooks. More months per business make it harder to leave. More LionsLane clients mean cheaper distribution. More Sawa/Bado decisions make EMMA sharper for that business.

### Competition (researched 2026-10-09)

| Who | Price | Note |
|---|---|---|
| Fursa Connect (Nairobi) | from KES 2,999/month | Closest local competitor; website + AI content + ads bundle |
| Ocoya | $15–159/month | AI social content and scheduling |
| Predis.ai | ~$19–32/month | AI posts, images, video |
| Jasper | $59–69/seat/month | Copy and brand voice |
| Freelancers / agencies | KES 10,000–80,000 / 15,000–150,000 per month | The real incumbent |

At KES 500, EMMA Pro is a sixth of Fursa's entry price and 20–50× cheaper than a freelancer. The objection flips from "too expensive" to "is it any good?", so **the first session must prove it**.

### Validation scorecard

| Question | Light | Evidence / next step |
|---|---|---|
| Are three real competitors charging money? | Green | Table above |
| Can we describe the exact buyer and what they Google? | Amber | Hypothesis (Wanjiru). Run 10 owner interviews; pull keyword volumes for "social media manager Kenya price", "digital marketing agency Nairobi cost", "content ideas for salon". |
| Will people pay in the next 30 days? | Red until tested | Target: **20 paying Pro users by 30 days after launch**. Under 5 means the offer or the buyer is wrong. |

### Distribution
1. LionsLane's client book and their referrals.
2. Short-form video of EMMA doing real work in real time (The Other Side series).
3. WhatsApp business communities and SME groups.
4. Referral: give a month of Pro, get a month.
5. Partnerships with SME associations and business trainers.

### Appendix: the Pitch Jury's verdict on EMMA
EMMA's pitch was run through her own nine-juror Pitch Jury (first customer, skeptic, engineer, lawyer, competitor, investor, marketer, partner, CFO). It went from 1/9 to 5/9 to 9/9 by:
- naming the buyer and a price;
- promising only what's built;
- leading with memory and approval rather than writing;
- making the guarantee objective;
- adding a founding offer.

The conditions attached to the 9/9 verdict were a hosted database, a privacy notice with a processing agreement, and measured AI cost per client. The first and third are built; the second is in 15 Legal. (The jury's KES 25,000 price was a placeholder; real plans are in 12 Billing.)

---

<a id="part02"></a>

## 02 · Product Requirements (PRD)

**EMMA Build Pack v2.0 · 2026-10-15**

Feature by feature. Each requirement has an ID so builders, tests and tickets can refer to it. Screen details are in 07 Screen Specs; data in 09; endpoints in 10.

### Goals for v1
1. A business signs up free, sets up in under 5 minutes, and approves its first plan in session one.
2. Every AI action is a proposal a person approves. No auto-posting.
3. Paid plans are profitable per user at the listed price.
4. Web and native app (iOS + Android) on one backend.
5. Secure by default: real accounts, data isolated per business, no open credit-spending endpoints.

### Plans (summary; full detail in 12 Billing)

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

### F1 · Accounts
- **F1.1** Sign up and sign in with email + 6-digit code (OTP). Google sign-in on web.
- **F1.2** New account automatically gets a profile and a Free subscription.
- **F1.3** Sessions persist; signing out clears local business data from the device.
- **F1.4** Delete account: type DELETE to confirm; sessions revoked, then all data deleted (usage kept anonymised for accounting).
- **F1.5** Export all workspace data as JSON at any time.
- *Acceptance:* a new email can go from landing to the desk in under 60 seconds excluding email delivery.

### F2 · Onboarding
- **F2.1** Three steps: (1) business name, what you sell, where; (2) who buys (chips) and where you sell (channels); (3) brand voice (one of four "vibes", editable later).
- **F2.2** Creates the workspace server-side within the plan's allowance.
- **F2.3** Immediately sends EMMA a starter brief: a two-week content plan with copy for those channels. The first brief cards are dealt onto the desk.
- **F2.4** First approval triggers a one-time celebration (kanga band animation) and a tip on where the posts went.
- *Acceptance:* 40% of sign-ups approve at least one card in session one (tracked).

### F3 · The Desk (Command Center)
- **F3.1** Brief pad: write a brief in plain words; quick briefs as tabs (Plan my week, Follow up leads, Write a post, Plan a campaign, Draft a sequence, How did last month go, Find prospects).
- **F3.2** EMMA streams her reply as margin notes, with live status ("Reading your calendar", "Searching the web") and source links.
- **F3.3** Proposals arrive as brief cards: kind, title, what's inside, review note if something must be checked. Actions: **Sawa** (approve and add), **Bado** (discard), **Edit** (open and change before stamping).
- **F3.4** Threads are saved server-side and continue on any device; "New thread" starts fresh; past threads are listed.
- **F3.5** "On your desk" panel: pending cards, coming-up key dates, tasks due, who to call today.
- **F3.6** Usage shown as briefs left this month; at 80% a gentle upgrade prompt; at 100% the upgrade sheet.
- **F3.7** Ask EMMA from any screen (side drawer, same thread).
- **F3.8** Command palette (Ctrl/⌘ K): jump anywhere, run quick briefs, or type a brief directly.

### F4 · Wall Planner (Content Calendar)
- **F4.1** Month and week views; list ("dossiers") view.
- **F4.2** Every entry carries the full dossier: date, sector, content type, platform, angle, featured business + contact details, linked offering, objective, KPI, audience, content mix, best practice, theme pillar, owner, draft due, review date, publish date, asset link, repurposing plan, campaign, status, copy.
- **F4.3** Drag a card to another day to reschedule; draft and review dates shift by the same amount.
- **F4.4** Status: idea → drafting → in review → scheduled → published.
- **F4.5** Key dates (holidays, launches, seasons) show as kanga banners on their days.
- **F4.6** "Write this one" asks EMMA to draft the copy for an entry.
- **F4.7** Copy to clipboard and "Share to WhatsApp" (opens WhatsApp with the copy) for publishing by hand.

### F5 · Tickets (Leads)
- **F5.1** Board of stages shown to users as **New, Talking, Serious, Quote sent, Won, Lost** (stored as new, contacted, qualified, proposal, won, lost).
- **F5.2** Drag tickets between stages; keyboard users change stage in the ticket sheet.
- **F5.3** Each ticket: name, company, role, phone, email, social, source (+ link), score (hot ≥ 75, warm ≥ 50, cold), value, last touch, notes, consent, verified.
- **F5.4** Call, WhatsApp and email in one tap.
- **F5.5** "Who to call today": open tickets untouched for 3+ days, sorted by score × value.
- **F5.6** "Draft next touch": EMMA drafts the next message, respecting consent (no broadcasts to people without consent).
- **F5.7** Researched leads arrive unverified, without consent, with the source link; "Mark verified" and "Record consent" actions.
- **F5.8** Weighted forecast: sum of open value × stage weight (new .05, contacted .15, qualified .35, proposal .6).
- **F5.9** Lead cap per plan enforced when approving lead proposals.

### F6 · Campaigns
- **F6.1** Table of paid campaigns: platform (LinkedIn, Meta, Google, Display, TikTok), status, budget, spent, impressions, clicks, CTR, CPC, conversions, ROAS.
- **F6.2** Pause/resume; open a campaign for details and ad copy; "Diagnose" asks EMMA for fixes.
- **F6.3** Figures are entered by the team or proposed by EMMA in v1 (no ad-account sync until v2).

### F7 · Email & WhatsApp sequences (Email Hub)
- **F7.1** Broadcasts and automations (multi-step with delays).
- **F7.2** Opted-in audiences only; EMMA is instructed never to target people without consent.
- **F7.3** Analytics: sent, open rate, click rate, top subject lines.

### F8 · Shelf (Content Library)
- **F8.1** Searchable assets by type (copy, image, video, document, presentation, design, template) and tag.
- **F8.2** Copy EMMA wrote lands here when approved; editable; copy to clipboard.

### F9 · Stall (Catalog)
- **F9.1** Offerings with price, customers, rating, repeat or completion rate, revenue.
- **F9.2** "Campaign" builds a full launch for an offering; "Put on trial" opens the Pitch Jury (Max/staff).

### F10 · Ledger (Dashboard) and ROI & Compliance
- **F10.1** Ledger: this week in one data-backed sentence, six numbers (leads this month with pace, pipeline value with weighted, ad spend, ROAS, email open rate, posts scheduled), activity, tasks, sparklines over full months.
- **F10.2** ROI: six-month spend vs revenue (one axis, two series), ROAS by channel, cost per lead, marketing ROI.
- **F10.3** Compliance: Kenya DPA checklist with status (OK / Attention / At risk, always icon + word), "Audit with EMMA".

### F11 · Business Profile (the six inputs)
- **F11.1** Identity: name, tagline, industry, location, currency, website.
- **F11.2** The six inputs EMMA works from: sectors; offerings; partners; key dates; brand voice (voice, pillars, always, never) and palette; compliance regime.
- **F11.3** Palette re-skins accents for agency client workspaces (brand-safe range only, see 05).
- **F11.4** Usage this month; "Where your data goes" disclosure; export, import (validated), new workspace (plan limit), delete account.

### F12 · Billing
- **F12.1** Plan page: current plan, usage, three plans side by side.
- **F12.2** M-Pesa: enter number → STK PIN prompt → waiting state → confirmed → plan active (30 days). "I've paid, check now" if it stalls.
- **F12.3** Card: Stripe Checkout (or Paystack) → return → plan active when webhook lands (polls up to 30 s).
- **F12.4** Manage card subscription (portal). Cancel keeps the plan to period end.
- **F12.5** Upgrade sheet opens on limit hit or from the usage meter.

### F13 · Pitch Jury (staff + Max)
- **F13.1** Case: title, kind, context, pitch, audience, price; or start from a catalog offering.
- **F13.2** Nine isolated jurors vote in parallel (guilty / not guilty, headline, reasoning, fix, confidence); verdicts appear as each finishes.
- **F13.3** Foreperson summarises, lists the objections that matter, rewrites the pitch without inventing facts (unknowns in [brackets]); "Use for next round".
- **F13.4** Every round kept; 9/9 acquittal offers "Hand it to EMMA" to build a launch.

### F14 · Bring-them-back loop (v1.1)
- **F14.1** Monday brief: what's planned, who to call, one suggestion (in-app card; push on mobile).
- **F14.2** Reminders for cards waiting more than 24 hours.
- **F14.3** Key-date nudges 7 days before.
- **F14.4** Streak: weeks in a row with something published.

### F15 · Mobile app
Sign in, the Desk (brief + stream + stamp cards; swipe right to Sawa, left to Bado), Planner list, Tickets with tap-to-call/WhatsApp, Me (plan, usage, privacy, sign out). No purchasing in-app in v1. See 14 Mobile.

### F16 · Admin (LionsLane)
Staff flag (server-only) unlocks Max limits and the Pitch Jury; manual plan grants via SQL in v1; usage and AI cost per user from `usage_events`.

### Non-functional requirements
- **NF1 Performance:** first load < 2.5 s on 4G; skeletons within 100 ms; streaming text starts < 3 s after send.
- **NF2 Accessibility:** WCAG 2.2 AA (see 06).
- **NF3 Responsive:** works from 360 px; mobile web has a bottom tab bar.
- **NF4 Privacy:** Kenya DPA; data processing disclosure in-product; sub-processors listed.
- **NF5 Reliability:** a failed AI turn never corrupts history; a failed payment never grants a plan; version-checked saves never silently overwrite.
- **NF6 Cost:** AI cost per paid user ≤ 50% of plan revenue.

### Success metrics
Activation (first Sawa in session 1) ≥ 40% · week-4 retention ≥ 25% · Free→paid ≥ 4% · approval rate ≥ 50% · AI cost ≤ 50% of revenue per paid user.

---

<a id="part03"></a>

## 03 · MVP Scope

**EMMA Build Pack v2.0 · 2026-10-15**

### In version 1
- Accounts (email code, Google on web), account deletion, data export.
- Onboarding (3 steps) with an instant starter plan.
- The Desk: brief pad, streaming margin notes, brief cards with Sawa / Bado / Edit, saved threads, Ask EMMA drawer, command palette.
- Wall Planner, Tickets (leads board), Campaigns, Email Hub, Shelf, Stall, Ledger, ROI & Compliance, Business Profile.
- Plans Free / Pro / Max with enforced limits and cost caps.
- Payments: M-Pesa STK (30 days prepaid) and cards (recurring).
- Pitch Jury for staff and Max.
- Legal pages: privacy, terms, cookies, refunds.
- Mobile app (iOS + Android): sign in, Desk, Planner, Tickets, Me.
- Security baseline: RLS on every table, server-side history, quotas, one AI run at a time, headers, error boundaries.
- The Sokoni brand and design system (05, 06, 07).

### Not in version 1
| Deferred | When | Why |
|---|---|---|
| Posting directly to Instagram, Facebook, TikTok, LinkedIn; sending WhatsApp messages | v2 | Platform approvals and risk; v1 uses copy + "Share to WhatsApp" |
| Syncing Meta Ads, Google Ads, GA4, email providers | v2 | Integration effort; figures entered by hand in v1 |
| In-app purchases on iOS/Android | v1.1 (before selling in apps) | Store rules; RevenueCat |
| Push notifications, Monday brief | v1.1 | Retention loop after launch data |
| Team invites UI (Max seats) | v1.1 | Owner-only in v1 |
| Swahili interface | v1.1 | English first; Swahili micro-words already used in stamps |
| Image and video generation | v2 | Cost and quality control |
| Marketplace of strategists | not planned | See 01 Vision, wedge rule |

---

<a id="part04"></a>

## 04 · App Flow

**EMMA Build Pack v2.0 · 2026-10-15**

What every click does and which screen comes next. No screen may be a dead end: each lists where it leads.

### Route map

| Route | Screen | Access |
|---|---|---|
| `/` | Landing (with pricing, FAQ) | Public |
| `/legal/privacy` · `/legal/terms` · `/legal/cookies` · `/legal/refunds` | Legal | Public |
| `/signin` | Sign in (email code, Google) | Public; signed-in users are sent to `/app` |
| `/auth/callback` | Google return (no UI) | Public |
| `/app/welcome` | Onboarding | Signed in, no workspace yet |
| `/app` | The Desk (Command Center) | Signed in |
| `/app/dashboard` | Ledger | Signed in |
| `/app/calendar` | Wall Planner | Signed in |
| `/app/campaigns` | Campaigns | Signed in |
| `/app/leads` | Tickets | Signed in |
| `/app/email` | Email Hub | Signed in |
| `/app/library` | Shelf | Signed in |
| `/app/catalog` | Stall | Signed in |
| `/app/roi` | ROI & Compliance | Signed in |
| `/app/jury` | Pitch Jury | Staff or Max (hidden otherwise) |
| `/app/billing` | Plan & Billing | Signed in |
| `/app/settings` | Business Profile | Signed in |
| any other | 404 ("That page doesn't exist" → Open EMMA / Home) | Public |

Signed-out visits to `/app/*` redirect to `/signin?next=<path>`; after sign-in the user returns to `next` (same-site paths only).

### 1. First visit to first value
```
Landing ──[Start free]──▶ Sign in
   │                         │ enter email ─[Email me a code]─▶ code step
   │                         │ enter 6 digits ─[Sign in]─▶ (has workspace?) ─no─▶ Onboarding
   │                         └─[Continue with Google]─▶ Google ─▶ /auth/callback ─▶ same check
   ├─[See pricing]──▶ #pricing ──[Choose Pro/Max]──▶ Sign in (then Billing after onboarding)
   └─[FAQ / How it works]──▶ in-page sections

Onboarding step 1 ─[Continue]─▶ step 2 ─[Continue]─▶ step 3 ─[Build my plan]─▶ The Desk
   (Back on steps 2–3 returns one step; data kept)

The Desk (first time): EMMA's starter brief streams; brief cards are dealt
   ─[Sawa]─▶ card stamps, entries go to the Wall Planner, celebration band, toast "9 posts added · Open planner"
   ─[Open planner]─▶ Wall Planner with the new entries highlighted
```

### 2. The Desk
| Action | Result | Next |
|---|---|---|
| Type a brief + Enter (or Send) | Brief appears on the pad's log; EMMA's margin notes stream | Same screen |
| Shift + Enter | New line in the brief | — |
| Click a quick brief tab | Fills the pad with that brief (not sent) | Edit, then send |
| **Sawa** on a card | Stamp animation, server applies it, toast with link | Toast link → relevant screen |
| **Bado** on a card | Card slides off, marked "Sent back" | — |
| **Edit** on a card | Card opens full-size with editable items | Save → back to card; Sawa from inside |
| Source link in a note | Opens the source in a new tab | — |
| "New thread" | Clears the pad | — |
| Thread history (left of pad) | Opens a past thread | — |
| On your desk → a pending card | Scrolls to that card | — |
| On your desk → "Who to call today" item | Opens the ticket sheet | Tickets |
| On your desk → key date | Opens Wall Planner on that date | Wall Planner |
| Usage meter "Upgrade" | Upgrade sheet | Billing |
| Brief refused at limit | Error note + upgrade sheet | Billing |

### 3. Global (every app screen)
| Action | Result |
|---|---|
| Ctrl/⌘ K, or "Search or jump to…" | Command palette: pages, quick briefs, or type a brief (sends to EMMA and opens the drawer) |
| **Ask EMMA** (top bar) | Side drawer with the Desk's thread and pad |
| Sidebar link | Navigate |
| Account chip → Switch workspace | Loads that workspace (Max) |
| Account chip → Business profile / Plan & billing / Privacy / Sign out | Navigate; Sign out → Landing |
| Toast link | Navigate to the thing it mentions |
| Mobile web: tab bar (Desk, Planner, Tickets, Ledger, More) | More opens the command palette |

### 4. Wall Planner
| Action | Result |
|---|---|
| ‹ / Today / › | Change month |
| Month · Week · Dossiers toggle | Change view |
| Platform / sector filters | Filter cards |
| Click a card | Dossier sheet: all fields, status select, copy editor |
| Drag a card to another day | Rescheduled; draft/review shift; toast "Moved to 22 Oct" with Undo |
| Sheet → **Write this one** | Drawer opens; EMMA drafts the copy as a library card |
| Sheet → Copy / Share to WhatsApp | Copies text / opens WhatsApp with the text |
| Sheet → Delete | Confirm, removed, toast with Undo |
| **Plan with EMMA** | Drawer; EMMA plans the next four weeks |

### 5. Tickets
| Action | Result |
|---|---|
| Board / List toggle | Change view |
| Search | Filters tickets by name, company, role, source |
| Drag a ticket to a column | Stage changes, last touch = today, toast |
| Click a ticket | Ticket sheet: stage select, details, notes, flags |
| Sheet → Call / WhatsApp / Email | Opens tel:, wa.me, mailto: |
| Sheet → Draft next touch | Drawer; EMMA drafts it (consent-aware) |
| Sheet → Mark verified / Record consent | Flag cleared |
| **Who to call today** | Filters to stale open tickets, best first |
| **Find prospects** (Pro/Max) | Drawer; EMMA researches with web search, proposes unverified tickets |
| On Free → Find prospects | Upgrade sheet ("Web research is part of Pro") |

### 6. Other surfaces
| Screen | Primary actions → result |
|---|---|
| Campaigns | Row → sheet (details, ad copy, Diagnose with EMMA, Delete) · Pause/Play → status toggle + toast · Optimise with EMMA → drawer |
| Email Hub | Broadcasts / Automations / Analytics tabs · row → sheet (body, steps, Improve with EMMA, Delete) · Draft with EMMA → drawer |
| Shelf | Search, type filter · tile → sheet (edit copy, copy to clipboard, delete) · Repurpose with EMMA → drawer |
| Stall | Campaign → drawer (full launch) · Put on trial → Pitch Jury prefilled (Max/staff) or upgrade sheet |
| Ledger | Numbers link to their screens (leads → Tickets, spend → Campaigns, posts → Planner) · tasks tick off inline |
| ROI & Compliance | Ask EMMA where to spend → drawer · Audit with EMMA → drawer · check status select → updates score |
| Business Profile | Edit fields (auto-saved, "Saved" indicator) · Add rows · Export · Import (confirm) · New workspace (plan limit or upgrade sheet) · Delete account (type DELETE) → Landing |
| Plan & Billing | Upgrade to Pro/Max → checkout sheet (M-Pesa / Card) · Manage card subscription → Stripe portal |
| Pitch Jury | New case → form · Put it on trial → verdicts stream in · Use this for the next round → fills next round · Run it again · Hand it to EMMA (9/9) → drawer |

### 7. Upgrade and payment
```
Limit hit / meter / Find prospects on Free / Jury on Pro
   └▶ Upgrade sheet (Free · Pro · Max) ─[Upgrade to Pro]─▶ /app/billing?plan=pro → checkout sheet
        ├ M-Pesa: number ─[Pay KES 500]─▶ "Check your phone" (polls 4 s × 30)
        │      ├ paid ─▶ "You're on Pro" ─[Done]─▶ Billing (meter updated)
        │      ├ cancelled/failed ─▶ message, try again
        │      └ stalled ─[I've paid, check now]─▶ status query
        └ Card ─[Continue to secure checkout]─▶ Stripe ─▶ /app/billing?status=success (polls 30 s) ─▶ toast
                                                       └▶ ?status=cancelled ─▶ toast "Nothing was charged"
```

### 8. Errors and edge states
| Situation | What the user sees | Next |
|---|---|---|
| Session expired on an API call | Toast "Please sign in again" | Sign in, then back to `next` |
| Another device saved first | Toast "Updated from another device. You're seeing the latest." | Continue |
| Save failed (offline) | "Not saved" in top bar, toast | Retries on next edit |
| AI busy (one brief at a time) | Note "EMMA is still working on your last brief" | Wait |
| AI refusal | Note "EMMA can't help with that. Try rephrasing as a marketing brief." | Rephrase |
| Server error in a page | Error screen "Something went wrong. Your work is saved." | Try again / Back to EMMA |
| Workspace read-only after downgrade | Banner on that workspace + upgrade | Billing |

### 9. Mobile app flow
```
Launch ─(no session)─▶ Sign in (email → code) ─▶ Tabs
Tabs: Desk · Planner · Tickets · Me
Desk: brief ─▶ stream ─▶ card: swipe right = Sawa (stamp + haptic), left = Bado; tap = details
Planner: upcoming list ─ tap ─▶ entry (copy, Copy / Share to WhatsApp)
Tickets: list by score ─ Call / WhatsApp / Email buttons
Me: plan + usage, privacy links, Sign out ─▶ Sign in
(No purchase screens in v1: plans are managed on the web.)
```

---

<a id="part05"></a>

## 05 · Brand Guidelines: Sokoni

**EMMA Build Pack v2.0 · 2026-10-15 · Replaces the B-18 brand (v1)**

### Why a new brand
B-18 (dark navy, glass panels, a glowing orb, a purple-to-pink gradient) looked like every AI product of 2025–26. Nothing about it said *Kenya*, *small business* or *marketing*. Small-business owners don't want a spaceship; they want a sharp, warm colleague who gets their market.

**Sokoni** means "at the market". The brand borrows from the places Kenyan business actually happens: the market stall, the kanga cloth with its message, the notebook, the rubber stamp, the M-Pesa receipt. It's warm paper and ink by day, deep night by night, with colour used like a market uses it: bold, deliberate, purposeful.

### The idea in one sentence
**Every brief is a message, and every approval is a stamp.**

The kanga cloth always carries a *jina*, a saying printed into the cloth. Marketing is the same: a message worth wearing. EMMA writes your messages; you stamp them **Sawa** ("okay, good") when they're right, or **Bado** ("not yet") when they're not.

### Personality
| EMMA is | EMMA is not |
|---|---|
| A sharp, warm strategist who's been to your shop | A robot, a wizard, a genie |
| Confident and specific | Hype-y, vague, "revolutionary" |
| Local and proud of it | Folkloric or touristy |
| Calm, organised, on top of things | Busy, flashy, noisy |
| Honest about what she doesn't know | Over-promising |

### Logo

#### Wordmark
`emma` set in **Instrument Serif Italic**, lowercase, in Ink, followed by a small **Saffron sun** (a filled circle at 30% of the x-height, sitting on the baseline). Below it, optional endorsement in Bricolage Grotesque 600, tracking +8%: `BY LIONSLANE`.

- Minimum size: wordmark 18 px tall on screen.
- Clear space: the height of the "e" on every side.
- Never: outline, gradient, shadow, rotate, recolour the sun, set in another font, or put on busy photos.

#### The Stamp (app icon, favicon, approval mark)
A circular rubber-stamp mark: an outer ring of kanga triangles, an inner ring of text, a centre letter or word.

| Use | Centre | Ring text |
|---|---|---|
| App icon / favicon / avatar | Italic `e` | `EMMA · BY LIONSLANE ·` |
| Approve | `SAWA` | `APPROVED · <DATE> ·` |
| Send back | `BADO` | `NOT YET · <DATE> ·` |

Reference SVG (approval stamp, 120×120, colour from CSS `currentColor`):
```svg
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Approved">
  <defs>
    <path id="ring" d="M60,60 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
    <pattern id="kanga" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M0 10 L5 0 L10 10 Z" fill="currentColor" />
    </pattern>
  </defs>
  <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="3" />
  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#kanga)" stroke-width="8" />
  <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="1.5" />
  <text font-family="Bricolage Grotesque" font-weight="700" font-size="9" letter-spacing="2" fill="currentColor">
    <textPath href="#ring">APPROVED · 15 OCT 2026 · APPROVED ·</textPath>
  </text>
  <text x="60" y="68" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="22" letter-spacing="1" fill="currentColor">SAWA</text>
</svg>
```
Stamps render in **Clay** for Sawa and **Ink 2** for Bado, rotated −8° to −12° (random per card), at 90% opacity with a subtle ink-texture mask (see 06 Motion).

### Colour

Sokoni is **light-first** ("Mchana", day) with a full dark theme ("Usiku", night). All text colours pass WCAG AA; ratios are measured, not estimated.

#### Day (Mchana)
| Token | Hex | Role | Contrast |
|---|---|---|---|
| Paper | `#F5EFE3` | Page background (warm, unbleached) | — |
| Card | `#FFFCF5` | Cards, sheets, inputs | — |
| Ink | `#1A1814` | Primary text, primary buttons | 15.5 on Paper |
| Ink 2 | `#45403A` | Secondary text | 9.0 |
| Muted | `#6B6458` | Labels, meta | 5.1 |
| Line | `rgba(26,24,20,.12)` | Dividers, card edges | — |
| **Clay** | `#A63D24` | **EMMA's colour.** Her mark, her margin notes' rule, Sawa stamps, AI actions | 5.5 (text) · white on Clay 6.3 |
| **Saffron** | `#F2A900` | Highlights, the sun, active tab underline, kanga accents. **Never text on paper.** Ink on Saffron 8.8 | — |
| Saffron text | `#8A5A00` | When saffron must be text (rare) | 5.2 |
| **Indigo** | `#2E3FA3` | Links, focus ring, secondary actions, selection | 7.8 · white on Indigo 8.9 |
| Success | `#1F7A4D` | Won, approved, paid | 4.6 |
| Warning | `#8F5300` | Needs attention, unverified | 5.4 |
| Danger | `#B42318` | Errors, at risk, no consent | 5.7 |
| Info | Indigo | Neutral information | 7.8 |
| Chart 1 / 2 | `#3E52C4` / `#A87200` | Two-series charts (validated for colour-blind separation) | ≥ 3:1 |

#### Night (Usiku)
| Token | Hex | Contrast on Night |
|---|---|---|
| Night | `#131210` | — |
| Card | `#1D1B17` | — |
| Ink | `#F4EEE2` | 16.2 |
| Ink 2 | `#CFC6B6` | 11.1 |
| Muted | `#A39A89` | 6.7 |
| Clay | `#EE8A6E` | 7.6 |
| Saffron | `#F5B82E` | 10.5 (allowed as text at night) |
| Indigo | `#9AA6FF` | 8.3 |
| Success / Warning / Danger | `#4CC38A` / `#F0B44C` / `#FF7A6B` | 8.5 / 10.1 / 7.4 |
| Chart 1 / 2 | `#7482EE` / `#C08A14` | validated |

#### Colour rules
1. **Clay belongs to EMMA.** Anything coloured Clay was made or is being done by EMMA. No other element uses Clay.
2. **Saffron is a highlighter, not a paint.** Under 5% of any screen: the sun, active-tab underline, the kanga band, one key number.
3. **Ink buttons for the main action**, Clay buttons only for "send to EMMA" and Sawa.
4. **Status colours are reserved** and always come with an icon and a word.
5. Agency client palettes may replace **Indigo** (links/selection) and add a client accent for their own content badges. Clay, Saffron and the status colours never change, so EMMA always looks like EMMA.

### Typography
| Role | Font (Google Fonts, OFL) | Use |
|---|---|---|
| Display + EMMA's voice | **Instrument Serif** (regular + italic) | Page hero lines, big numbers in the Ledger, EMMA's margin notes (italic) |
| Interface | **Bricolage Grotesque** (variable, 400–800) | Everything else: navigation, labels, buttons, body |
| Data & receipts | **IBM Plex Mono** (400, 500) | Money, dates in tickets, counters, codes |

Scale (px): Display 56 / 40 / 32 · Serif note 19 (min 17 for italic) · Heading 20 / 17 / 15 · Body 15 (min) · Small 13 · Micro label 11.5 (uppercase only for ≤ 3 words, +6% tracking). Numbers use tabular figures.

### Motifs (use sparingly, each has one job)
| Motif | Where | Job |
|---|---|---|
| **Kanga band**: a repeating border of triangles and dots in Ink, Saffron and Clay | Landing hero edge, onboarding header, celebration on first approval, empty states | Says "Kenya" without a single cliché |
| **Ruled paper**: faint horizontal rules every 28 px, a Clay margin line | The brief pad only | "Write EMMA a brief" |
| **Brief card**: cream card, folded top-right corner, kind label like a file tab | Proposals | Work waiting for your stamp |
| **The stamp** | Approve / send back; app icon | Decision made |
| **Masking tape**: a translucent strip with a slight angle | Week headers in the Wall Planner | The wall planner on your shop wall |
| **Ticket**: perforated top edge, mono numbers | Leads | Like an M-Pesa or till receipt |
| **Ledger lines**: thin double rule under totals | Ledger, ROI, Billing | Money, counted properly |

Never stack motifs. A screen may have at most one decorative motif plus functional ones (cards, tickets).

### Iconography
- 24 px grid, 1.75 px stroke, round caps and joins, slight hand-made softness (no perfect geometry).
- Filled only for the active state of tab-bar icons.
- Icons always paired with a label in navigation; icon-only buttons need an accessible name.

### Imagery
- Real Kenyan businesses: salons, cafés, dukas, workshops, market stalls, hands at work. Licensed or own photography only.
- Warm natural light; never stock "AI robot", circuit brains or neon gradients.
- No fake testimonials, no fake customer logos.

### Voice and tone
- **Plain Kenyan English.** Short sentences. Specific numbers. Shillings, not dollars.
- **Swahili as seasoning, in fixed UI words only:** Sawa (approve), Bado (send back), Karibu (welcome), Asante (thanks). Always paired with an English accessible name (e.g. the Sawa button's label reads "Sawa, approve"). Never in generated client copy unless the client's voice asks for it.
- EMMA speaks in first person in margin notes: "I've planned three weeks around Mashujaa Day."
- No hype words: revolutionary, game-changer, magic, supercharge, unleash. No emoji in the interface.
- Errors say what happened and what to do next, without blame: "That code didn't work. It may have expired; request a new one."

| Context | Write | Don't write |
|---|---|---|
| Empty planner | "Nothing planned yet. Brief EMMA: *plan my week*." | "Your calendar is empty! 🚀 Let AI do the magic!" |
| Approval toast | "9 posts added to your planner." | "Success!!" |
| Limit | "You've used all 15 briefs on Free this month. Pro gives you 30 and a smarter EMMA." | "Upgrade now to unlock unlimited AI power!" |

### Do and don't
| Do | Don't |
|---|---|
| Paper, ink, and one bold colour moment per screen | Gradients, glass, glow, neon |
| Let EMMA's Clay mark tell users what she made | Use Clay for decoration |
| Use the stamp for decisions | Use checkmark confetti |
| Kanga band at moments that matter | Kanga patterns behind text or everywhere |
| Real photos of real businesses | Stock AI imagery |
| Big serif numbers for money | Tiny grey numbers |

### Migrating from B-18
| B-18 | Sokoni |
|---|---|
| Dark-only navy | Light-first Paper + Night theme |
| Glowing orb avatar | The Stamp (`e`) and Clay margin rule |
| Purple→pink AI gradient | Clay, flat |
| Unbounded + Manrope + JetBrains Mono | Instrument Serif + Bricolage Grotesque + IBM Plex Mono |
| Glass cards | Paper cards with a 1 px line and a soft 2-layer shadow |
| Approve / Discard buttons | Sawa / Bado stamps |

---

<a id="part06"></a>

## 06 · Design Brief: the Sokoni design system

**EMMA Build Pack v2.0 · 2026-10-15**

How the brand in 05 becomes interface. Every value here maps to a CSS token in `src/app/globals.css` (web) and `mobile/src/lib/theme.ts` (mobile). Components never hardcode a colour, a font or a duration.

### 1. Design principles
1. **The desk, not the dashboard.** EMMA is a colleague who leaves work on your desk. The home screen is a place to brief and decide, not a wall of charts.
2. **Decisions are physical.** Approving is a stamp, rescheduling is moving a sticky note, a lead is a ticket you move along. Every key action has a tactile metaphor and a plain-button equivalent.
3. **Clay means EMMA.** Users should always be able to tell at a glance what EMMA made versus what they made.
4. **One bold moment per screen.** Paper and ink everywhere; colour where it carries meaning.
5. **Calm by default, alive on action.** Nothing moves unless something happened.
6. **No clutter.** Headings say what the page is. No explanatory subheaders. One line of help maximum, only where people get stuck.

### 2. Tokens

```css
:root {
  /* Mchana (day) */
  --paper: #F5EFE3;   --card: #FFFCF5;   --card-2: #FBF6EC;
  --ink: #1A1814;     --ink-2: #45403A;  --muted: #6B6458;
  --line: rgba(26,24,20,.12);  --line-strong: rgba(26,24,20,.22);
  --clay: #A63D24;    --clay-wash: rgba(166,61,36,.08);
  --saffron: #F2A900; --saffron-text: #8A5A00; --saffron-wash: rgba(242,169,0,.16);
  --indigo: #2E3FA3;  --indigo-wash: rgba(46,63,163,.08);
  --ok: #1F7A4D;  --warn: #8F5300;  --risk: #B42318;  --info: var(--indigo);
  --chart-1: #3E52C4; --chart-2: #A87200;
  --on-ink: var(--paper); --on-clay: #FFFFFF; --on-saffron: var(--ink);

  /* Type */
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-ui: "Bricolage Grotesque", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Space (4-based) */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 20px; --s6: 24px; --s8: 32px; --s12: 48px; --s16: 64px;

  /* Shape */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-pill: 999px;
  --shadow-card: 0 1px 0 rgba(26,24,20,.04), 0 6px 18px -8px rgba(26,24,20,.18);
  --shadow-lift: 0 2px 0 rgba(26,24,20,.05), 0 18px 40px -16px rgba(26,24,20,.30);

  /* Motion */
  --t-fast: 140ms; --t-med: 240ms; --t-slow: 420ms;
  --ease-out: cubic-bezier(.22,1,.36,1);
  --ease-stamp: cubic-bezier(.2,1.6,.4,1);   /* slight overshoot for the stamp only */

  /* Texture */
  --grain: url("/grain.png");                 /* 160px tile, 3% opacity */
}

:root[data-theme="night"] {
  --paper: #131210;  --card: #1D1B17;  --card-2: #23211C;
  --ink: #F4EEE2;    --ink-2: #CFC6B6; --muted: #A39A89;
  --line: rgba(244,238,226,.12); --line-strong: rgba(244,238,226,.22);
  --clay: #EE8A6E;   --clay-wash: rgba(238,138,110,.12);
  --saffron: #F5B82E; --saffron-text: #F5B82E;
  --indigo: #9AA6FF;
  --ok: #4CC38A; --warn: #F0B44C; --risk: #FF7A6B;
  --chart-1: #7482EE; --chart-2: #C08A14;
  --on-ink: #131210; --on-clay: #131210;
  --shadow-card: 0 1px 0 rgba(0,0,0,.3), 0 8px 24px -10px rgba(0,0,0,.6);
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="day"]) { /* same as night */ } }
```

Theme choice: System (default) · Mchana · Usiku, in the account menu. Stored per device.

### 3. Layout

#### Web app shell
```
┌──────────────┬──────────────────────────────────────────────┐
│ emma●        │  Desk                      ⌘K  Ask EMMA  (W) │  ← top bar 56px
│              ├──────────────────────────────────────────────┤
│ Desk         │                                              │
│ Wall Planner │                 page content                 │
│ Tickets      │            max-width 1240, gutter 32         │
│ Campaigns    │                                              │
│ Email Hub    │                                              │
│ Shelf        │                                              │
│ Stall        │                                              │
│ Ledger       │                                              │
│ ROI          │                                              │
│ ───────      │                                              │
│ Pitch Jury   │                                              │
│              │                                              │
│ [8/15 briefs]│                                              │
└──────────────┴──────────────────────────────────────────────┘
  sidebar 232px, paper-2 background, kanga band 6px at the very top of the window
```
- Sidebar active item: ink text, a 3px saffron underline under the label (not a filled pill).
- Under 1024px: sidebar collapses to icons; under 768px: bottom tab bar (Desk, Planner, Tickets, Ledger, More).
- Grid: 12 columns, 24px gutters on desktop; 4 columns, 16px gutters on mobile.

#### Breakpoints
360 (min supported) · 768 (tablet: tab bar off, sidebar icons) · 1024 (sidebar full) · 1440 (wide: Desk shows "On your desk" as a right column).

### 4. Components

Each component lists its states. All interactive elements have hover, focus-visible, active, disabled and (where it applies) loading states.

#### Buttons
| Variant | Look | Use |
|---|---|---|
| Primary | Ink fill, paper text, r-md, 44px tall | The main action on a screen (one per view) |
| EMMA | Clay fill, white text, small stamp glyph at left | Send a brief, Sawa, any "ask EMMA" action |
| Secondary | Card fill, 1px line-strong border, ink text | Other actions |
| Quiet | Text only, indigo, underline on hover | Tertiary links in context |
| Danger | Card fill, risk border and text; fills risk on confirm step | Delete |

Press: translateY(1px) and shadow drops. Loading: label stays, a 3-dot ink "typing" mark replaces the icon. Never a spinner over the label.

#### The Stamp button (Sawa / Bado)
- Rest: round 56px button with the stamp outline in Clay (Sawa) or Ink 2 (Bado), label beneath: **Sawa** / **Bado**. Accessible names: "Sawa, approve" / "Bado, send back".
- On press (Sawa): the stamp scales from 1.6 → 1.0 with `--ease-stamp` over 260ms, lands on the brief card at a random −8° to −12°, a 2px "ink spread" blur fades over 300ms, the card then lifts and files away to its destination (planner, tickets) over `--t-slow`. Haptic `success` on mobile.
- On press (Bado): the Bado stamp lands lighter (70% opacity), the card slides 24px down and fades to a "Sent back" stub that can be restored for 10 seconds.
- Keyboard: `S` = Sawa, `B` = Bado, `E` = Edit when a card has focus. Announced via a polite live region: "Approved. 9 posts added to your planner."
- Reduced motion: no scale or fly; the stamp simply appears and the card fades.

#### Brief card (proposal)
```
 ┌───────────────────────────────────────────╮  ← folded corner (top right, 18px)
 │ CALENDAR                       ⟡ by EMMA  │  kind tab (micro label) · Clay mark
 │ Two weeks around Mashujaa Day             │  serif title 22px
 │ 9 posts · Instagram, WhatsApp · 14–27 Oct │  mono meta
 │ ─────────────────────────────────────────  │
 │ • Mon 14  Reel: behind the counter         │  first 3 items, "+6 more"
 │ • Wed 16  Carousel: 3 drinks under 300     │
 │ • Fri 18  Status: weekend hours            │
 │ ⚠ Check: prices for the new menu           │  review note in warn, icon + word
 │                                            │
 │   (Sawa)      (Bado)      Edit             │
 └────────────────────────────────────────────┘
```
- Background `--card`, 1px `--line`, `--shadow-card`; on hover `--shadow-lift` and 2px rise.
- Kind tab colours are neutral (ink on card-2). Clay only for the "by EMMA" mark.
- Dealt onto the desk: each card enters from 12px below with a 60ms stagger and a 1–2° random tilt that settles to 0.

#### Brief pad (composer)
- Ruled lines every 28px (`repeating-linear-gradient` of `--line`), a 1px Clay margin line 44px from the left, placeholder in serif italic: *Dear EMMA, plan my week around the new menu…*
- Quick briefs sit above it as file tabs: Plan my week · Follow up leads · Write a post · Plan a campaign · Draft a sequence · How did last month go · Find prospects (Pro/Max shows a small indigo dot).
- Send button: EMMA variant, "Send to EMMA". Enter sends, Shift+Enter new line. Character count appears after 3,500 of 4,000.
- While EMMA works, the pad dims to 60% and shows the live status line.

#### EMMA's margin note (assistant message)
- Serif italic 19px, ink, on paper (no bubble), with a 2px Clay rule on the left and the small stamp avatar at the top of the rule.
- Status lines (mono 12.5px, muted) with a slow pulse dot in Clay: "Reading your calendar", "Searching the web (2 of 5)".
- Sources as small cards: favicon, site name, title; open in a new tab; always passed through `safeHref`.
- User briefs appear as typed text on the pad's log: UI font 15px, ink, right-aligned, no bubble, with time in mono.

#### Sticky note (planner entry)
- 4px radius square-ish card tinted by platform with low-saturation washes (Instagram clay-wash, WhatsApp ok at 10%, Facebook indigo-wash, TikTok ink at 6%, LinkedIn indigo at 12%), label always written (platform name), never colour alone.
- Status shown as a tiny stamp-like chip: Idea · Drafting · In review · Scheduled · Published (Published gets the ok colour and a check).
- Drag: lifts with `--shadow-lift`, tilts 2°, drop target day highlights with a saffron-wash fill.

#### Masking-tape week header
- A 28px translucent saffron-wash strip, rotated −1°, ends cut with a zigzag mask; text in UI 600 13px: "Week of 20 Oct".

#### Kanga banner (key date)
- A full-width strip across the day cell(s): 4px kanga triangle border top and bottom (ink/saffron/clay), label in UI 600 12px: "Mashujaa Day". Multi-day dates span cells.

#### Ticket (lead)
```
 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ← perforation (radial-gradient dots)
 │ HOT · 82          #0142    │   score chip · mono ticket number
 │ Amina Otieno               │   UI 600 16px
 │ Owner, Kilele Salon        │   ink-2
 │ KES 24,000   · 4 days ago  │   mono value · last touch (warn if ≥ 3 days)
 │ ☎  ◎ WhatsApp  ✉           │   one-tap actions (44px targets)
 │ ⚠ Unverified · No consent  │   flags, icon + word
 └────────────────────────────┘
```
- Columns: New · Talking · Serious · Quote sent · Won · Lost. Column header shows count and total value in mono; Won header in ok, Lost header muted.
- Dragging a ticket shows the column's weighted value updating live.

#### Ledger numbers
- Big numbers in Instrument Serif 40px, tabular; label above in micro label; change vs last month as a word and arrow-free sign: "+12 on September" in ok or risk.
- Totals sit on a double rule (`border-bottom: 3px double var(--line-strong)`).
- One sentence at the top in serif 24px, written from data: "*14 new enquiries this month, 5 of them from WhatsApp. Three are waiting for a reply.*"

#### Other components
Chip · Input / Select / Textarea (card fill, line-strong border, 44px, label above) · Tabs (underline style, saffron 3px active) · Sheet (right side, 480px, card fill, slides 24px with fade) · Modal (centred, 520px) · Toast (bottom centre, ink fill, paper text, one action link in saffron) · Command palette (⌘K, card fill, serif placeholder *What do you need?*) · Meter (ink track at 12%, ink fill; at 80% warn; at 100% risk, with words) · Upgrade sheet · Account menu · Empty state · Table (ruled rows, no zebra, mono numbers right-aligned).

### 5. Loading
- Skeletons shaped like the final layout, in `--card-2` with a slow left-to-right shimmer of `--line` (1.4s). For the Desk: three blank brief cards with folded corners.
- EMMA working: the status line plus the pad dimmed; never a blank wait. First text within 3 seconds or the status line says what she's doing.
- Spinners only inside small controls (and as the 3-dot ink mark in buttons).

### 6. Empty states
One serif line, one action, and (only here) the kanga band at 40% opacity above the line.
| Screen | Line | Action |
|---|---|---|
| Desk, no cards | *Nothing on your desk. What should we work on?* | Focus the pad |
| Wall Planner | *Nothing planned yet.* | Plan with EMMA |
| Tickets | *No tickets yet. Every enquiry belongs here.* | Add a ticket · Find prospects |
| Shelf | *Nothing on the shelf yet.* | Write a post with EMMA |
| Campaigns | *No campaigns yet.* | Plan a campaign with EMMA |

### 7. Motion
| Moment | Motion | Duration |
|---|---|---|
| Hover / press | Lift 2px / press 1px | `--t-fast` |
| Menus, toasts, tabs | Fade + 6px rise | `--t-med` |
| Sheets, page entrance | Fade + 12–24px slide | `--t-slow` |
| Brief cards dealt | Rise + settle tilt, 60ms stagger | `--t-slow` |
| Sawa stamp | Scale 1.6→1, overshoot, ink spread | 260ms + 300ms |
| Card filed away | Shrinks toward its destination in the sidebar, which pulses once in saffron | `--t-slow` |
| First approval celebration | The kanga band draws across the top of the window left to right, once | 900ms |
| Live status | Clay dot opacity pulse | 1.6s loop |

Rules: nothing loops except the live status dot while EMMA is working. No confetti, no bounce on idle, no parallax. `prefers-reduced-motion: reduce` turns every transform off and keeps only opacity fades under 120ms.

### 8. Accessibility (WCAG 2.2 AA, non-negotiable)
- Contrast: text ≥ 4.5:1, large text and UI boundaries ≥ 3:1. Measured values in 05. Saffron is never text on paper.
- Every drag has a non-drag path: ticket stage select in the sheet; planner date field in the dossier sheet; "Move to…" menu on each card.
- Stamps have plain accessible names ("Sawa, approve") and keyboard shortcuts; shortcuts listed under `?`.
- Focus ring: 2px indigo outline + 2px paper offset, on every focusable element, never removed.
- Status never by colour alone: icon + word everywhere (ok/warn/risk, platform, score).
- Live regions: EMMA's streaming reply (polite, announced per paragraph, not per token), toasts (polite), errors (assertive).
- Dialogs and sheets trap focus, close on Escape, return focus to the trigger.
- Touch targets ≥ 44×44px; spacing ≥ 8px between targets.
- Text zooms to 200% without loss; layout reflows at 320 CSS px.
- Italic serif is never below 17px and never used for long UI text (it's EMMA's voice, kept to notes and headlines).
- The paper grain and the kanga band are decorative (`aria-hidden`) and switched off in `forced-colors: active`.
- Language: `lang="en"` on the document; Swahili stamp words wrapped in `<span lang="sw">`.

### 9. Mobile (Expo)
- Same tokens via `theme.ts`; system fonts fall back if the custom fonts aren't loaded yet (load with `expo-font` before hiding the splash).
- Tab bar: Desk · Planner · Tickets · Me. Active icon filled, saffron 3px bar above it.
- Desk cards are full-width; **swipe right = Sawa** (stamp lands at 40% of the swipe, haptic success), **swipe left = Bado** (light haptic); buttons are always present for people who don't swipe.
- Pull to refresh on lists, skeletons on first load, offline banner in warn when the network drops.

### 10. Quality bar (check before shipping a screen)
1. Does the screen have exactly one primary action?
2. Can you tell what EMMA made (Clay) from what the user made?
3. Is there any explanatory subheader? Remove it.
4. Does every drag have a button path, every icon a label, every status a word?
5. Does it work at 360px, at 200% zoom, with a keyboard only, and in Usiku?
6. Is there a skeleton for every async view and a one-line empty state?

---

<a id="part07"></a>

## 07 · Screen Specs

**EMMA Build Pack v2.0 · 2026-10-15**

Every screen, top to bottom: purpose, layout, content, states, and the code file it lives in. Components and tokens are defined in 06. Navigation between screens is in 04.

Legend: **P** = primary action (one per screen) · **E** = EMMA action (Clay) · *italic* = serif voice.

---

### Public

#### S1 · Landing `/` (`src/app/page.tsx`)
**Purpose:** make a salon owner think "she gets my business" in 10 seconds, then start free.

1. **Kanga band** 6px across the very top.
2. **Nav:** wordmark · How it works · Pricing · FAQ · Sign in (quiet) · **Start free** (P).
3. **Hero** (two columns ≥ 1024, stacked below):
   - Left: serif 56px *The marketing team that already knows your business.* One line in UI 18px ink-2: "Brief EMMA in one sentence. Stamp what you like. From KES 0." Buttons: **Start free** (P), See pricing (secondary).
   - Right: **live desk preview**: a brief pad with *Dear EMMA, plan two weeks around Mashujaa Day* typing itself, then three brief cards dealt onto paper, then a Sawa stamp landing on the first one. Loops once, then rests on the stamped card (reduced motion: shows the final state).
4. **Three-step strip** (no icons in circles): Brief → Stamp → Done, each with a small illustration in ink line art (pad, stamp, phone with WhatsApp share).
5. **What EMMA does best** (4 rows, alternating, each a real screen crop): Never let a lead go cold · Always know what to post · Prove it in shillings · Stay in your voice.
6. **Pricing** (`#pricing`): three plan cards (Free, Pro, Max) on a ledger-ruled background; prices in serif 40px mono-suffix "/month"; Pro card has a saffron top border and "Most businesses start here". Payment line: "Pay with M-Pesa or card. Cancel anytime."
7. **FAQ** (6 questions, accordion): Is my data private? · Does EMMA post for me? (No, you approve and publish) · Which AI? · Can I pay with M-Pesa? · What happens at the limit? · Can my agency use it? (Max).
8. **Footer:** wordmark, "Made in Nairobi by LionsLane", legal links, company details from env (empty fields hidden).

States: none dynamic. Lighthouse accessibility ≥ 95, LCP < 2.5s on 4G (hero preview is CSS/SVG, no video).

#### S2 · Sign in `/signin` (`src/app/signin/SignIn.tsx`)
- Split layout ≥ 1024: left a paper panel with the stamp mark large, rotated −10°, and *Karibu.*; right the form card.
- Step 1: email input, **Email me a code** (P), divider "or", Continue with Google (secondary). Small print: "By continuing you agree to the Terms and Privacy Policy" (links).
- Step 2: six single-digit boxes (paste fills all, auto-advance, `inputmode="numeric"`, `autocomplete="one-time-code"`), **Sign in** (P), "Use a different email", "Send a new code" (enabled after 30s, countdown in mono).
- Errors inline under the field, risk colour + icon: "That code didn't work. It may have expired; request a new one."
- Loading: button shows the 3-dot mark; inputs disabled.

#### S3 · Legal `/legal/[slug]` (`src/app/legal/content.tsx`)
Single column 720px, serif H1, UI body 16px, "Last updated" in mono, table of contents for long pages, links between the four documents. Company details from env.

#### S4 · 404 and errors
- 404: big serif *Hmm.* and "That page doesn't exist." Buttons: Open EMMA (P) · Home.
- App error: *Something went sideways.* "Your work is saved." Try again (P) · Back to the Desk.

---

### Onboarding

#### S5 · Welcome `/app/welcome` (`src/app/app/welcome/page.tsx`)
Centred card 560px on paper, kanga band header inside the card, step dots in mono "1 of 3".
1. **Your business:** name, what you sell (textarea, 200 chars, placeholder *Coffee, pastries and catering in Westlands*), where (town/area). Continue (P).
2. **Who buys and where you sell:** chips (multi-select): Young professionals · Students · Families · Businesses · Tourists · Other (free text); channels: Instagram · WhatsApp · Facebook · TikTok · LinkedIn · Email · Walk-in. Back · Continue (P).
3. **How you sound:** four voice cards, each with a sample line in serif italic:
   - Warm & local: *Karibu! Fresh mandazi just out of the oven.*
   - Polished & premium · Playful & bold · Straight-talking expert.
   Back · **Build my plan** (E).
- On submit: workspace created server-side, user lands on the Desk where the starter brief is already streaming.
- Errors: plan workspace limit → upgrade sheet; network → toast + retry (data kept).

---

### The app

#### S6 · The Desk `/app` (`src/app/app/page.tsx`)
**Purpose:** brief EMMA and decide. This is home.

Layout ≥ 1440: pad + thread (8 cols) | On your desk (4 cols). Below 1440: On your desk collapses into a horizontal strip above the pad.

1. **Greeting line** (serif 32px): *Habari, Wanjiru.* followed by one data sentence in UI 16px ink-2: "3 cards waiting · 2 people to call · Mashujaa Day in 5 days." (Each phrase is a link.) No other heading.
2. **Thread:** the log of briefs (user text right) and margin notes (EMMA, serif italic, Clay rule), with brief cards dealt inline after the note that produced them. Thread switcher (mono "Thread · 14 Oct") with "New thread" and past threads in a menu.
3. **Brief pad** pinned at the bottom of the thread column: quick-brief tabs above, ruled pad, **Send to EMMA** (E, also P). Usage meter text beside the button: "8 of 15 briefs left" (muted; warn at 80%).
4. **On your desk** column:
   - *Waiting for your stamp* (pending cards, count; click scrolls to the card).
   - *Who to call today* (up to 5 tickets: name, value, days since touch; click opens the ticket sheet).
   - *Coming up* (next 3 key dates as small kanga banners).
   - *Due* (tasks this week, tick inline).
- **States:**
  - First run: starter brief streaming, skeleton cards appear as proposals stream in.
  - Empty (no thread): serif *What should we work on today?* above the pad, quick briefs enlarged as 2×4 tiles.
  - Working: pad dimmed, status line, Stop button (secondary) cancels the request.
  - Limit reached: pad replaced by a ledger-style note: "You've used all 15 briefs this month. They come back on 1 Nov." Upgrade (P).
  - Error: margin note in risk colour (no Clay rule): "I couldn't finish that. Nothing was charged to your briefs." Try again.
  - Viewer role: pad hidden; cards show "Waiting for an editor".

#### S7 · Ask EMMA drawer (global, `src/components/Shell.tsx`)
Right sheet 480px with the current thread and a compact pad. Opens from the top bar, ⌘K briefs, and every "…with EMMA" button (prefilled brief, not auto-sent unless the action says "Write this one"). Brief cards inside the drawer stamp the same way.

#### S8 · Command palette (⌘K / Ctrl K)
Serif placeholder *What do you need?* Groups: Go to (screens) · Ask EMMA (quick briefs) · Recent tickets · Recent planner entries. Typing a sentence and pressing Enter with no match sends it as a brief and opens the drawer. Arrow keys, Enter, Escape.

#### S9 · Wall Planner `/app/calendar` (`src/app/app/calendar/page.tsx`)
1. Toolbar: ‹ Month › · Today · Month | Week | Dossiers · Platform filter · Sector filter · **Plan with EMMA** (E, P).
2. **Month view:** 7-column grid on paper; masking-tape headers per week; day cells show up to 3 sticky notes + "+2"; kanga banners for key dates; today's cell has a saffron 2px top edge and the date in a filled ink circle.
3. **Week view:** 7 tall columns, notes stacked by time slot (Morning/Afternoon/Evening).
4. **Dossiers view:** table: date (mono) · platform · title · objective · status · owner · publish; row → sheet.
5. **Dossier sheet:** title (editable), date field, platform, status select, copy editor (textarea with character count per platform: Instagram 2,200; X 280; LinkedIn 3,000), the full dossier fields in a collapsible "Details" group, actions: **Write this one** (E) · Copy · Share to WhatsApp · Delete (danger, with Undo toast).
- States: skeleton grid; empty (see 06 empty states); drag a note → "Moved to 22 Oct · Undo".

#### S10 · Tickets `/app/leads` (`src/app/app/leads/page.tsx`)
1. Toolbar: Board | List · search · **Who to call today** (toggle chip) · Find prospects (E; Free shows a small lock and opens the upgrade sheet) · Add ticket (P).
2. Summary strip (mono): Open value KES 312,000 · Weighted KES 96,400 · Won this month KES 48,000.
3. **Board:** six columns as in 06; tickets draggable; column "Move to…" menu per ticket for keyboard users.
4. **List:** table with score, name, company, stage, value, last touch, flags.
5. **Ticket sheet:** name/company/role, stage select, score, value, phone/email/social, source link (safeHref), notes (timeline: each touch with date), flags with actions (Mark verified · Record consent), buttons: Call · WhatsApp · Email · **Draft next touch** (E).
- States: skeleton columns; empty state; lead cap reached on Free: banner "50 of 50 tickets on Free. Pro holds 1,000." with Upgrade.

#### S11 · Campaigns `/app/campaigns`
Table with platform, status chip (Draft/Active/Paused/Ended, icon + word), budget/spent as a thin meter, CTR, CPC, conversions, ROAS (mono, right-aligned). Row → sheet: details, ad copy, Diagnose with EMMA (E), Pause/Resume, Delete. Toolbar: Optimise with EMMA (E, P). Note under the table in muted 13px: "Figures are entered by hand until ad accounts can be connected." (Only shown when a campaign has no figures.)

#### S12 · Email Hub `/app/email`
Tabs: Broadcasts · Automations · Analytics. Broadcasts and automations as rows (name, audience, status, sent, open rate). Automation sheet shows steps as a vertical timeline with delays ("Day 0 → Day 2 → Day 7"). Analytics: three big ledger numbers (sent, open rate, click rate) and top subject lines. **Draft with EMMA** (E, P).

#### S13 · Shelf `/app/library`
Masonry grid of tiles (type label, title, first lines of copy in serif for copy items, thumbnail for media links). Search, type filter. Tile → sheet (edit, copy, delete). **Repurpose with EMMA** (E, P).

#### S14 · Stall `/app/catalog`
Offerings as price-tag cards (a tag shape with a punched hole, price in serif, customers/rating/revenue in mono). Actions per card: Campaign (E) · Put on trial (Max/staff; others see the upgrade sheet). Add offering (P).

#### S15 · Ledger `/app/dashboard`
1. Serif sentence from data (see 06).
2. Six ledger numbers in a 3×2 grid: Leads this month (with pace) · Pipeline (weighted) · Ad spend · ROAS · Email open rate · Posts scheduled. Each links to its screen.
3. Sparklines over full months only (chart-1), with a legend if two series.
4. Activity (latest 8, mono times) · Tasks (tick inline).
No primary button: the Ledger is for reading. (Ask EMMA "How did last month go" is in the top bar.)

#### S16 · ROI & Compliance `/app/roi`
- ROI: spend vs revenue, six months, one axis, two series (chart-1 spend, chart-2 revenue), legend, tooltips; ROAS by channel bars; cost per lead; marketing ROI as one big number.
- Compliance: compact heading "Kenya Data Protection Act · ODPC"; checklist rows with status select (OK / Attention / At risk, icon + word), score as "7 of 10 OK". **Audit with EMMA** (E, P).

#### S17 · Business Profile `/app/settings`
Sections as cards: Identity · What you sell (offerings table) · Sectors · Partners · Key dates · Brand voice (voice, pillars, always, never, palette picker limited to the brand-safe range) · Compliance regime · Usage this month · Where your data goes · Data (Export, Import with confirm) · Workspaces (New workspace) · Danger zone (Delete account: type DELETE). Auto-save with "Saved" / "Saving…" / "Not saved" in the top bar.

#### S18 · Plan & Billing `/app/billing` (`src/app/app/billing/page.tsx`)
1. Current plan card: plan name in serif, renewal or expiry date in mono, provider ("Paid with M-Pesa · ends 14 Nov" or "Card · renews 14 Nov"), Manage card subscription (if Stripe).
2. Usage meters: briefs, web searches, tickets, jury trials (Max).
3. Three plan cards with Upgrade buttons.
4. **Checkout sheet:** tabs M-Pesa | Card.
   - M-Pesa: phone input (accepts 07…, 01…, +254…; shows normalised 2547… in mono), **Pay KES 500** (P). Waiting state: a phone illustration and "Check your phone and enter your M-Pesa PIN." with a mono timer; "I've paid, check now" after 20s. Success: Sawa stamp lands on a receipt: "You're on Pro until 14 Nov." Done.
   - Card: summary and **Continue to secure checkout** (P) → Stripe. On return: "Confirming your payment…" then toast.
- Errors: cancelled ("You cancelled on your phone. Nothing was charged."), insufficient funds, timeout, wrong amount (never grants the plan).

#### S19 · Pitch Jury `/app/jury` (staff + Max)
1. Case list (left) and case view (right).
2. New case form: title, kind, context, pitch, audience, price; or "Start from an offering".
3. **Put it on trial** (E, P). Nine juror seats in a 3×3 grid; each seat flips from a blank card to a verdict card as its result arrives: role, verdict stamp (NOT GUILTY in ok / GUILTY in risk, both with words), headline, reasoning, the fix, confidence in mono.
4. Foreperson panel: tally in serif 40px "7–2", objections that matter, revised pitch with [unknowns in brackets], **Use this for the next round**. 9/9 acquittal: kanga band draws, "Hand it to EMMA" (E).
- Rounds kept as tabs "Round 1 · 1/9", "Round 2 · 5/9".

---

### Mobile app (Expo, `mobile/src/app`)

#### M1 · Sign in (`signin.tsx`)
Stamp mark, *Karibu.*, email → code (six boxes, OS one-time-code autofill), Sign in. No Google in v1.

#### M2 · Desk (`(tabs)/index.tsx`)
Greeting line, pending cards as a vertical stack (swipe right Sawa, left Bado, tap for detail sheet), margin notes in the thread, pad at the bottom with quick-brief chips in a horizontal scroller. Keyboard-avoiding; Send in Clay.

#### M3 · Planner (`(tabs)/calendar.tsx`)
Upcoming list grouped by masking-tape day headers; entry → sheet with copy, Copy, Share to WhatsApp.

#### M4 · Tickets (`(tabs)/leads.tsx`)
List sorted by "who to call today" first, then score; each row a compact ticket with Call / WhatsApp / Email buttons.

#### M5 · Me (`(tabs)/account.tsx`)
Plan and usage meters, theme (System/Mchana/Usiku), privacy and terms links, "Manage plan on the web" (opens the browser; no purchase UI), Sign out.

---

### Screen checklist (each screen ships with)
Skeleton · empty state · error state · 360px layout · keyboard path · Usiku check · one primary action · no explanatory subheader · page `<title>` "Desk · EMMA" format.

---

<a id="part08"></a>

## 08 · Technical Requirements (TRD and Architecture)

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces Architecture.md and ArchitectureEssentials.md

### Essentials (read this first)

**What:** an AI marketing agent for small businesses. You brief it in one sentence, it returns proposals (calendar, campaigns, leads, emails, tasks, copy), and a person approves them. Web, iOS and Android.

**Stack:** Next.js 16 on Vercel · Supabase (Postgres + Auth, RLS everywhere) · Anthropic Claude (server-only) · Stripe (cards) + M-Pesa Daraja (prepaid) · Expo for mobile.

**Rules that must never break**
1. The server never trusts a workspace, history, model, plan or price from the client.
2. Every AI call goes: authenticate (`getClaims`) → validate (zod) → load the workspace through the user's RLS client → check plan + quota + one-run lock → run → meter.
3. AI tools only propose. Writes happen on explicit approval (`/api/proposals/:id`).
4. Secret keys (`SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY`, Stripe, Daraja) stay on the server. Clients get the URL and the publishable key only.
5. Payments change plans only after server-side verification (Stripe signature; M-Pesa STK query).
6. RLS on every table, explicit grants, `with check` on updates, no `user_metadata` in authorisation.
7. Links built from model or web data: http(s) only, through `safeHref()`.
8. Conversation history is append-only; a failed turn appends nothing.

### 1. System overview
```
 ┌──────────────┐     ┌──────────────────┐
 │ Web (Next.js)│     │ Mobile (Expo RN) │
 └──────┬───────┘     └────────┬─────────┘
        │ cookie session       │ Bearer JWT
        ▼                      ▼
 ┌─────────────────────────────────────────┐
 │ Next.js route handlers on Vercel        │
 │  /api/emma      agent loop (NDJSON)     │
 │  /api/jury      Pitch Jury (Max/staff)  │
 │  /api/proposals approve / discard       │
 │  /api/billing/* Stripe + M-Pesa         │
 │  /api/account   plan, usage, delete     │
 │  /api/workspaces create (within plan)   │
 └───┬───────────────┬──────────────┬──────┘
     │ user JWT (RLS) │ secret key   │ server-only keys
     ▼                ▼              ▼
 ┌──────────┐   ┌──────────┐  ┌────────────────────────┐
 │ Supabase │   │ Supabase │  │ Anthropic · Stripe ·    │
 │ Auth     │   │ Postgres │  │ Safaricom Daraja        │
 └──────────┘   └──────────┘  └────────────────────────┘
```
- **Web:** Next.js App Router. Client components read and write the workspace document through Supabase with the user's session (RLS enforces access). Anything that costs money or needs a secret goes through route handlers.
- **Mobile:** Expo Router app, same Supabase project, calls the same route handlers with `Authorization: Bearer <access token>`.
- **No separate API server:** Vercel route handlers are the API.

### 2. Technology and versions (pinned, each at least two weeks old when chosen)

| Concern | Choice | Version |
|---|---|---|
| Web framework | Next.js (App Router, `proxy.ts`), React, TypeScript strict | next 16.4.0 · react 19.3 |
| State | zustand with persist (demo mode only) | 5.x |
| Validation | zod (request bodies, tool inputs, imports, structured outputs) | 4.6.5 |
| Database + auth | Supabase: `@supabase/ssr`, `@supabase/supabase-js` | 0.12.7 · 2.117.1 |
| AI | `@anthropic-ai/sdk` | 0.132.1 |
| Cards | `stripe` (API 2026-08-26.dahlia) | 22.6.2 |
| M-Pesa | Daraja REST (fetch, no SDK) | — |
| Analytics | `@vercel/analytics` (cookieless), mounted only after the visitor taps Allow (`src/components/Consent.tsx`) | 2.0.1 |
| Mobile | Expo SDK 57, React Native 0.86.3, Expo Router, expo-sqlite (session storage), `expo/fetch` (streaming) | expo ~57.0.28 |
| Tests | PGlite for RLS; mock Anthropic server for AI routes | pglite 0.5.8 |
| Styling | Hand-written CSS with tokens (no Tailwind, no component kit) | — |

Why no component library: the Sokoni look (stamps, tickets, ruled paper) is custom by design; tokens + ~25 components are cheaper than fighting a kit.

### 3. Request flows

#### 3.1 Brief EMMA (`POST /api/emma`)
1. Authenticate: cookie session (web) or Bearer token (mobile) → `getClaims()`. Reject if missing (401).
2. JSON only (415 otherwise), size limit, `Origin` must match for cookie requests (403).
3. Validate with zod: `{ workspaceId, conversationId?, text ≤ 4,000 }`.
4. Load the workspace with the **user's** client (RLS proves membership); viewers can't brief.
5. Resolve plan → limits. Count this month's completed briefs and cost from `usage_events` (months in Africa/Nairobi). Refuse with a `quota` event if over.
6. Acquire the run lock (`ai_runs` unique running row; stale after 5 minutes). Refuse if busy.
7. Load prior `messages` (server only), append the user turn in memory.
8. Run the tool loop with the plan's model (see 11). Tools read the server-loaded workspace and only propose.
9. Stream NDJSON events. On success persist: new messages (append-only), proposals, display transcript, usage event. On failure: record usage (tokens were spent) with `completed=false`, append nothing to history.
10. Release the lock in `finally`.

#### 3.2 Approve or discard (`POST /api/proposals/:id`)
Validate `{ action: "approve" | "discard" }`, check membership and editor role, apply items to `workspaces.data` with a version check (retry once on conflict), enforce the plan's lead cap, mark the proposal decided with `decided_by/at`. Server-side, so web and mobile behave the same.

#### 3.3 Workspace edits (web)
Client edits update local state immediately, then a debounced save:
`update workspaces set data=?, version=version+1, updated_at=now() where id=? and version=?`
Zero rows updated means another device saved first → reload and toast "Updated from another device."

#### 3.4 Billing
See 12 Billing. Stripe webhook verifies the signature on the raw body; M-Pesa callbacks are never trusted alone (STK query confirms).

#### 3.5 Pitch Jury (`POST /api/jury`)
Staff or Max only, counted against the jury quota, same auth/validation/lock/metering as briefs. Nine juror calls in parallel with structured output, then a foreperson call.

### 4. Environments and configuration

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web (+ `EXPO_PUBLIC_…` on mobile) | Safe to expose; RLS protects data |
| `SUPABASE_SECRET_KEY` | Server | Bypasses RLS; only for usage, subscriptions, messages, proposals, payments, ai_runs |
| `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_BASE_URL` for the local mock) | Server | |
| `NEXT_PUBLIC_APP_URL` | Web | Origin checks, Stripe/M-Pesa return URLs |
| `NEXT_PUBLIC_COMPANY_LEGAL_NAME`, `_ADDRESS`, `_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL`, `NEXT_PUBLIC_COMPANY_PHONE` | Web | Footer + legal pages; empty fields hidden |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_MAX` | Server | |
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV`, `MPESA_CALLBACK_SECRET`, optional `MPESA_TRANSACTION_TYPE`, `MPESA_PARTYB` | Server | `MPESA_ENV` = sandbox or production |
| `CORS_ORIGINS` | Server | Extra origins allowed to call `/api/*` with Bearer tokens (dev adds `localhost:8081`) |

**Local demo mode:** with no Supabase variables, the web app runs in the browser on the fictional Jua Coffee Co. workspace (storage key `emma-demo`, no sign-in). AI routes accept demo requests only when `NODE_ENV !== "production"`.

### 5. Folder structure
```
emma/
  AGENTS.md  CLAUDE.md  README.md  .env.example  next.config.ts (CSP + headers)
  docs/                         this build pack (00–17) + screens/
  supabase/migrations/          SQL schema, RLS, grants
  src/
    proxy.ts                    session refresh, auth redirects, CORS for /api
    app/
      page.tsx  site.tsx  site.css         landing
      signin/                               sign in (email code, Google)
      auth/callback/                        Google return
      legal/[slug]/  legal/content.tsx      legal pages
      app/                                  signed-in app (layout = Shell)
        page.tsx                            Desk
        welcome/ calendar/ leads/ campaigns/ email/ library/
        catalog/ dashboard/ roi/ jury/ billing/ settings/
      api/                                  emma, jury, proposals/[id], account,
                                            workspaces, health, billing/{stripe,mpesa}
      error.tsx  global-error.tsx  not-found.tsx  globals.css
    components/                 ui.tsx, Chrome.tsx, Shell.tsx, charts
    lib/
      agent/                    prompt.ts, tools.ts
      server/                   http, auth, quota, agent, workspace, billing
      supabase/                 env, browser, server (+ admin)
      plans.ts                  plan limits (single source of truth)
      types.ts store.ts chat.ts safe.ts proposals.ts importWorkspace.ts company.ts seed.ts
  mobile/                       Expo app (own package.json, src/app routes)
```

### 6. Performance budgets
| Metric | Budget |
|---|---|
| Landing LCP (4G, mid Android) | < 2.5 s |
| App shell to skeleton | < 100 ms after navigation |
| First streamed token after send | < 3 s (status line within 500 ms) |
| JS on the landing page | < 170 KB gzipped |
| Workspace document | < 4 MB (DB constraint); tools return slices, never the whole document |
| Vercel function | `maxDuration = 300` for AI routes; max 14 tool steps |

### 7. Decisions (ADR log)
1. **Workspace as one JSON document** with version-checked saves; trusted data (money, usage, history, proposals) normalised and server-written. Revisit when a Max customer passes ~5,000 leads or concurrent editing becomes common: leads move first to their own table.
2. **Proposal-only agent:** tools never write; approval is a separate authenticated call.
3. **Model per plan** (Haiku / Sonnet / Opus) plus count caps and monthly cost caps.
4. **No custom backend server:** Vercel route handlers + Supabase.
5. **M-Pesa as prepaid 30 days** (no auto-renew); Stripe for recurring cards; card processor behind one module so Paystack/Flutterwave can replace Stripe.
6. **Email codes (OTP), not magic links:** they work in the native app without deep-link handling.
7. **Sokoni brand (v2.0)** replaces B-18: light-first paper and ink, Clay reserved for EMMA. Migration is phase 6 in 16.
8. **Supabase over Convex:** RLS + Postgres + auth in one, works on web and mobile, SQL-testable policies.

### 8. Edge cases and decisions
| Case | Decision |
|---|---|
| Two briefs at once (two tabs, web + phone) | One running AI run per user, enforced by a unique partial index on `ai_runs`; stale after 5 minutes |
| Client disconnects mid-stream | Usage always recorded in `finally`; the brief counts toward the quota only if completed |
| Model refusal | Friendly message; not counted as a brief; tokens still metered |
| Large workspace | Lead caps per plan; tools return slices |
| Two editors | Version-checked saves; on conflict reload + toast; no realtime in v1 |
| Downgrade from Max with 3 workspaces | Extra workspaces become read-only; nothing deleted |
| "This month" | Calendar months in Africa/Nairobi |
| Supabase default email limits | Launch blocker: custom SMTP |
| M-Pesa callback missing / double pay / wrong amount / 07… numbers | "Check now" runs STK query; idempotent per receipt; amount must equal the plan price; phones normalised to 2547…/2541… |
| Stripe webhook before the user returns | Billing page polls subscription status for 30 seconds |
| Long Opus turn | `maxDuration = 300`, effort medium, 14 steps; stream ends with a "continue" hint if cut |
| Account deletion | Revoke sessions, delete user (cascades), keep anonymised usage |

### 9. What we deliberately didn't build
A separate admin app (a staff flag is enough) · realtime collaboration · normalising every surface into tables · a payment-provider plugin system · the Pitch Jury for every plan.

---

<a id="part09"></a>

## 09 · Data Schema

**EMMA Build Pack v2.0 · 2026-10-15**

Two layers: **Postgres tables** (trusted data, server-written, RLS everywhere) and the **workspace document** (`workspaces.data`, one JSON document per business, edited by members). Source files: `supabase/migrations/20261009120000_init.sql` (the timestamped name is required by the Supabase CLI) and `src/lib/types.ts`.

### 1. Entity map
```
auth.users ─1:1─ profiles
     │ 1:1─ subscriptions
     │ 1:n─ mpesa_payments
     │ 1:n─ usage_events ─n:1─ workspaces
     │ 1:n─ ai_runs
     └ n:m ─ workspace_members ─ workspaces ─1:n─ conversations ─1:n─ messages
                                    │                  └─1:n─ proposals
                                    └ data (jsonb Workspace document)
```

### 2. Tables

#### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid PK → auth.users | cascade delete |
| full_name | text ≤ 120 | user-editable |
| is_staff | boolean | **server-only**; unlocks Max limits + Pitch Jury |
| onboarded | boolean | user-editable |
| created_at | timestamptz | |

#### workspaces
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid → auth.users | never client-writable |
| name | text 1–120 | |
| data | jsonb | the Workspace document; `pg_column_size < 4 MB` |
| version | int > 0 | optimistic concurrency |
| created_at, updated_at | timestamptz | |

#### workspace_members
`(workspace_id, user_id)` PK, `role ∈ owner | editor | viewer`. Written by the server only (creation route; invites in v1.1).

#### subscriptions
| Column | Type | Notes |
|---|---|---|
| user_id | uuid PK | |
| plan | free \| pro \| max | |
| status | active \| trialing \| past_due \| canceled \| expired | |
| provider | none \| stripe \| mpesa \| manual | |
| current_period_end | timestamptz | null on Free |
| stripe_customer_id, stripe_subscription_id | text unique | |
| updated_at | timestamptz | |

**Effective plan** = `plan` if `status ∈ (active, trialing)` and `current_period_end > now()`, else `free`. Staff get Max limits.

#### usage_events
One row per AI request: user, workspace, `kind ∈ brief | jury`, model, `completed`, input/output/cache read/cache write tokens, searches, `cost_usd numeric(12,6)`, created_at. Index `(user_id, created_at desc)`. Users can read their own; only the server writes.

#### ai_runs
The one-at-a-time lock: `user_id`, `kind`, `started_at`, `finished_at`. Unique partial index `(user_id) where finished_at is null`. No client access.

#### conversations
`workspace_id`, `user_id`, `title ≤ 200`, `display jsonb` (rendered transcript: text, statuses, sources, proposal ids), timestamps. Members read; server writes.

#### messages
Raw model history: `conversation_id`, `seq` (unique per conversation), `role ∈ user | assistant`, `content jsonb`. **Append-only, no client access at all** (no RLS policy on purpose).

#### proposals
`workspace_id`, `conversation_id`, `kind ∈ calendar | campaign | leads | email | tasks | asset`, `title`, `summary`, `review_note`, `items jsonb`, `status ∈ pending | approved | discarded`, `decided_by`, `decided_at`. Members read; server writes.

#### mpesa_payments
`checkout_request_id` PK, `merchant_request_id`, `user_id`, `plan ∈ pro | max`, `amount > 0`, `phone`, `status ∈ pending | paid | failed | cancelled`, `receipt unique`, `result_desc`, timestamps. User reads own; server writes.

### 3. Security definer helpers (schema `private`, not exposed to the API)
- `private.member_role(ws)` → role or null for `auth.uid()`.
- `private.is_member(ws)` → boolean.
- `private.can_edit(ws)` → owner or editor.
- `private.handle_new_user()` trigger on `auth.users` insert: creates the profile and a Free subscription.

All use `set search_path = ''` and check `auth.uid()` themselves.

### 4. RLS and grants summary

| Table | Select | Insert | Update | Delete |
|---|---|---|---|---|
| profiles | own | trigger | own: `full_name`, `onboarded` only | cascade |
| workspaces | members | server | editors: `name`, `data`, `version`, `updated_at` only | owner |
| workspace_members | members of that workspace | server | server | server |
| subscriptions | own | trigger | server | cascade |
| usage_events | own | server | — | — |
| ai_runs | — | server | server | server |
| conversations | members | server | server | cascade |
| messages | — | server | — (append-only) | cascade |
| proposals | members | server | server | cascade |
| mpesa_payments | own | server | server | cascade |

Nothing is granted to `anon`. Every update policy has `with check`. Grants are explicit because Supabase stops auto-exposing new public tables from 2026-10-30. Tested by 33 automated PGlite checks.

### 5. The workspace document (`workspaces.data`)

```ts
interface Workspace {
  version: number;
  profile: ClientProfile;      // the six inputs EMMA works from
  calendar: CalendarEntry[];   // Wall Planner
  campaigns: Campaign[];
  leads: Lead[];               // Tickets
  emails: EmailItem[];         // Email Hub
  library: Asset[];            // Shelf
  tasks: Task[];
  activity: Activity[];        // "by: emma | team"
  compliance: ComplianceCheck[];
  history: MonthPoint[];       // YYYY-MM spend, revenue, leads
  juries: JuryCase[];          // Pitch Jury
  usage: UsageMonth[];         // demo mode only; cloud uses usage_events
}
```

#### ClientProfile
`name, tagline, industry, location, currency ("KES"), website, demo, sectors[], offerings[] (Stall), partners[], keyDates[], brand { voice, pillars[], doSay[], dontSay[], palette }, compliance { regime, regulator, notes }`.

- **Offering:** id, name, kind, price, description, customers, rating 0–5, repeatRate 0–1, revenue.
- **Partner:** id, name, sector, contact, email, phone, social, website, relationship.
- **KeyDate:** id, name, date (ISO), kind ∈ launch | event | season | holiday | deadline, note.
- **Palette (Sokoni change):** v1 stored `{ primary, accent, aiFrom, aiTo }` for B-18. v2 stores `{ link, accent }`. `link` replaces Indigo for links and selection, `accent` tints client content badges. Both are validated against the brand-safe range (contrast ≥ 4.5:1 on Paper and Night). Clay, Saffron and status colours can't be changed. **Migration:** on load, map `primary → link`, drop `aiFrom/aiTo`, keep `accent` if it passes contrast, otherwise fall back to the default.

#### CalendarEntry (the dossier)
id, date, sector, contentType, platform (LinkedIn, Instagram, Facebook, TikTok, X, WhatsApp, Email, Blog, YouTube, Google Business), angle, featuredBusiness, website, keyContact, email, phone, socialHandle, linkedOffering, objective, kpi, audienceSegment, contentMix, bestPractice, themePillar, owner, draftDue, reviewDate, publishDate, assetLink, repurposingPlan, campaign, status (idea → drafting → in review → scheduled → published), copy?.

#### Campaign
id, name, platform (LinkedIn, Meta, Google, Display, TikTok), status (draft, active, paused, ended), objective, audience, offering, budget, spent, impressions, clicks, conversions, revenue, startDate, endDate, headline?, body?. Derived (never stored): CTR = clicks/impressions, CPC = spent/clicks, ROAS = revenue/spent.

#### Lead (Ticket)
id, name, company, role, email, phone, social, source, sourceUrl?, stage (new, contacted, qualified, proposal, won, lost; shown as New, Talking, Serious, Quote sent, Won, Lost), score 0–100 (hot ≥ 75, warm ≥ 50, else cold), value, lastTouch, notes, verified, consent.
Derived: weighted forecast = Σ open value × weight (new .05, contacted .15, qualified .35, proposal .6). Who to call today = open, lastTouch ≥ 3 days ago, sorted by score × value.

#### EmailItem
id, name, kind (broadcast, automation), status (draft, scheduled, sent, running, paused), audience, subject, body, steps[{ delayDays, subject, body }], scheduledFor, sent, opens, clicks.

#### Asset (Shelf)
id, title, type (image, video, document, presentation, design, copy, template), tags[], updated, downloads, owner, body?, platform?.

#### Task · Activity · ComplianceCheck · MonthPoint
- Task: id, title, due, owner, done, area.
- Activity: id, at, text, by (emma, team).
- ComplianceCheck: id, area, item, status (ok, attention, risk), note.
- MonthPoint: month (YYYY-MM), spend, revenue, leads.

#### JuryCase
id, title, kind, context, createdAt, example?, rounds[{ id, at, pitch, audience, price, verdicts[{ role, verdict (not_guilty, guilty), headline, reasoning, fix, confidence, error? }], summary?, objections?, revisedPitch?, changes? }]. Roles: customer, skeptic, engineer, lawyer, competitor, investor, marketer, partner, cfo.

### 6. Proposal items by kind
| kind | items are | Applied to |
|---|---|---|
| calendar | CalendarEntry (without id/status; status starts "idea") | `calendar` |
| campaign | Campaign (status "draft", figures 0) | `campaigns` |
| leads | Lead (stage "new", verified false, consent false) | `leads`, capped by plan |
| email | EmailItem (status "draft") | `emails` |
| tasks | Task (done false) | `tasks` |
| asset | Asset (type "copy") | `library` |

Every approval also appends an Activity (`by: "emma"`, "Approved: <title>").

### 7. Validation and limits
- Every field from a model tool or a request body is parsed with zod before use (`src/lib/agent/tools.ts`, `src/lib/importWorkspace.ts`).
- Import: JSON only, ≤ 3 MB, validated against the Workspace schema.
- Lead caps: Free 50, Pro 1,000, Max unlimited.
- Text caps: brief ≤ 4,000 chars; names ≤ 120; titles ≤ 200.

### 8. Future migrations (not in v1)
1. `leads` table (when a workspace passes ~5,000 leads or team editing grows), with RLS like proposals.
2. `invites` table for Max seats (v1.1).
3. `push_tokens` table for mobile notifications (v1.1).
4. `iap_receipts` for App Store / Play purchases via RevenueCat (v1.1).

Each is a new file in `supabase/migrations/` (never edit an applied migration), with RLS on, explicit grants and `with check` on updates.

---

<a id="part10"></a>

## 10 · API Reference

**EMMA Build Pack v2.0 · 2026-10-15**

All endpoints are Next.js route handlers under `src/app/api/`, Node runtime, on Vercel.

### Conventions
- **Auth:** web sends the Supabase session cookie; mobile sends `Authorization: Bearer <access token>`. Both are verified with `getClaims()` in `requireUser(req)` (`src/lib/server/auth.ts`).
- **Bodies:** `Content-Type: application/json` only (415 otherwise), size-limited, validated with zod.
- **Origin:** cookie requests must come from `NEXT_PUBLIC_APP_URL` (403 otherwise). Bearer requests from origins in `CORS_ORIGINS` get CORS headers (preflight 204); others get 403.
- **Errors:** `{ "error": "<plain sentence for the user>", ...extra }`. Internal details never leave the server (`publicError`).
- **Status codes:** 400 invalid body · 401 not signed in · 402 plan limit (`upgrade: true` when an upgrade would help) · 403 role or origin · 404 not found (also for "not yours") · 409 state conflict · 413 too large · 415 not JSON · 429 busy or too many attempts · 502 provider failed · 503 not configured.
- **Streaming:** AI routes return `application/x-ndjson`, one JSON event per line.

---

### AI

#### `POST /api/emma` · brief EMMA
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

#### `POST /api/jury` · Pitch Jury (staff + Max)
```json
{ "case": { "title": "≤200", "kind": "≤60", "context": "≤1500" },
  "round": { "pitch": "1–4000", "audience": "≤500", "price": "≤200" } }
```
Stream: `juror` (one per juror as it finishes, `JurorVerdict`) → `foreperson` `{ summary, objections[], revisedPitch, changes[] }` → `usage` → `done`, or `error`. 402 if not on Max/staff or jury quota used.

---

### Proposals

#### `POST /api/proposals/:id`
```json
{ "action": "approve" | "discard" }
```
- Discard → `{ "status": "discarded" }`
- Approve → `{ "status": "approved", "added": 9, "skipped": 0, "version": 42, "data": { ...Workspace } }` (`skipped` counts leads over the plan cap)
- 403 viewer · 404 not found or not a member · 409 already decided, or the workspace kept changing after retry.

---

### Account and workspaces

#### `GET /api/account`
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

#### `DELETE /api/account`
Revokes all sessions, deletes the auth user (cascades to profile, workspaces they own, subscriptions, payments), keeps anonymised usage. → `{ "deleted": true }`.

#### `POST /api/workspaces`
```json
{ "name": "1–120", "profile": { "tagline", "industry", "location", "website", "sectors": ["≤12"], "voice" } }
```
→ 201 `{ id, name, version, data }`. 402 when the plan's workspace allowance is used.

#### `GET /api/health`
`{ "connected": boolean, "cloud": boolean }`, no-store. Never reveals models or keys.

---

### Billing

#### `POST /api/billing/mpesa/stk`
`{ "plan": "pro" | "max", "phone": "0712 345 678 | 2547… | +254…" }` → `{ checkoutRequestId, message }`. Amount comes from `plans.ts`, never from the client. 429 after 3 prompts in 10 minutes. 503 if Daraja isn't configured.

#### `GET /api/billing/mpesa/status?id=<checkoutRequestId>`
→ `{ "status": "pending" | "paid" | "failed" | "cancelled" }`. Runs an STK query while pending; only the payment's owner can read it.

#### `POST /api/billing/mpesa/callback/<MPESA_CALLBACK_SECRET>`
Called by Safaricom. Always answers `{ ResultCode: 0, ResultDesc: "Accepted" }`. The body is treated as a hint only: the server confirms with the STK query API, checks the amount and that the request is ours and unclaimed, then extends the plan 30 days (idempotent per receipt).

#### `POST /api/billing/stripe/checkout`
`{ "plan": "pro" | "max" }` → `{ url }` (Stripe Checkout, KES price id from env, `client_reference_id` = user id).

#### `POST /api/billing/stripe/portal`
→ `{ url }` for the customer portal. 404 if no card subscription.

#### `POST /api/billing/paystack/init`
Auth. `{ plan: "pro" | "max" }` → `{ url }` (checkout.paystack.com). 503 when Paystack isn't set up, or test keys for a non-staff user in production. 429 after 5 checkouts in 10 minutes.

#### `GET /api/billing/paystack/verify?reference=emma-<uuid>`
Auth, owner of the payment only. → `{ status: "pending" | "paid" | "failed" }`, settling through Paystack's verify API.

#### `POST /api/billing/paystack/webhook`
Paystack only. Raw body ≤ 200 KB, `x-paystack-signature` = HMAC SHA512 with `PAYSTACK_SECRET_KEY`. `charge.success` → `settlePaystack` (re-verifies with Paystack). Returns 500 on settle failure so Paystack retries.

#### `POST /api/billing/stripe/webhook`
Stripe only. Raw body ≤ 512 KB, signature verified with `STRIPE_WEBHOOK_SECRET`. Handles `checkout.session.completed`, `customer.subscription.created|updated|deleted` → `syncStripeSubscription` (period end read from the subscription item). Returns 500 on handler failure so Stripe retries.

---

### Auth

#### `GET /auth/callback?code=…&next=/app/…`
Exchanges the Google OAuth code for a session. `next` must be a same-site path starting with `/` (no `//`, no scheme); otherwise `/app`.

#### Proxy (`src/proxy.ts`)
Matcher `/app/:path*`, `/signin`, `/api/:path*`: refreshes the Supabase session cookie, redirects signed-out `/app/*` to `/signin?next=…` and signed-in `/signin` to `/app`, and applies CORS to `/api/*`.

---

### Direct Supabase access from clients
Clients use the publishable key with the user's session, limited by RLS (see 09):
- read: own profile, subscription, usage, payments; workspaces, members, conversations and proposals of workspaces they belong to.
- write: `profiles.full_name`, `profiles.onboarded`; `workspaces.name|data|version|updated_at` (editors, version-checked).
Everything else goes through the endpoints above.

### Testing endpoints locally
```bash
npm run dev
```
Point `ANTHROPIC_BASE_URL` at the mock server to exercise `/api/emma` without spending credits; expect the event sequence `status → text… → proposal → usage → done`.

---

<a id="part11"></a>

## 11 · The AI Agent

**EMMA Build Pack v2.0 · 2026-10-15**

How EMMA thinks, what she can touch, what she costs, and how she stays safe. Code: `src/lib/agent/prompt.ts`, `src/lib/agent/tools.ts`, `src/lib/server/agent.ts`, `src/app/api/emma/route.ts`, `src/app/api/jury/route.ts`.

### 1. Models by plan
| Plan | Model | Web search | Server-side fallback |
|---|---|---|---|
| Free | `claude-haiku-5-5` | No | No (not supported on Haiku) |
| Pro | `claude-sonnet-5-5` | Yes, up to 15/month | Yes (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) |
| Max / staff | `claude-opus-5-5` | Yes, up to 40/month | Yes |

Call settings (`modelSettings`): `client.beta.messages.stream`, adaptive thinking, `output_config.effort = "medium"`, `max_tokens 32000`, up to **14 tool steps** per brief, `maxDuration = 300` on the route.

### 2. The system prompt
Two blocks, in this order, both cached (`cache_control: ephemeral`):
1. **PERSONA** (byte-identical across all requests so it caches): who EMMA is, how she works, her 10-rule contract, rules for leads and personal data, formatting.
2. **Client context** (`clientContext(profile, today)`): today's date and the six inputs (sectors, offerings with ids and prices, partners, key dates, brand voice with do/don't, compliance regime).

#### The contract (summary)
1. Consistent persona: professional, warm, sharp.
2. Accuracy: never invent facts, prices, dates, certifications or results.
3. Confidentiality: nothing leaves the workspace; no personal data in public content without consent.
4. Inclusive, pan-African, no stereotypes.
5. Write inside the client's brand voice.
6. Remember the thread; ask when it matters.
7. Automate and personalise.
8. Tie activity to leads, sales and return on spend.
9. Read the workspace before answering about it.
10. Human review: anything sensitive, legal, financial, health, compliance-adjacent or making claims about prices/dates/certifications gets a `review_note`.

#### Sokoni voice additions (v2.0, add to PERSONA)
- Write replies as short **margin notes** in the first person: "I've planned two weeks around Mashujaa Day. Check the prices on the new menu before you stamp it."
- After proposing, end with one line on what to check, nothing else. The card holds the work.
- Plain Kenyan English, shillings, specific numbers. No hype words (revolutionary, game-changer, magic, supercharge, unleash). No emoji unless the client's voice asks for it.
- Never use the UI words Sawa/Bado in generated client copy; they belong to the interface.

### 3. Tools

All tools are **propose-only** except `query_workspace` (read-only). Inputs stream (`eager_input_streaming`) and are re-validated with zod before use, because streamed inputs aren't validated by the API.

| Tool | Does | Creates |
|---|---|---|
| `query_workspace` | Reads a slice: calendar, campaigns, leads, emails, library, catalog, partners, tasks, compliance, history, activity, or an overview with counts | nothing |
| `propose_calendar_entries` | Calendar entries with the full dossier and copy | `calendar` card |
| `propose_campaign` | Paid campaigns with budget, dates, targeting, ad copy | `campaign` card |
| `propose_leads` | Leads found with web search, source URL required | `leads` card (unverified, no consent) |
| `propose_email` | Broadcast or automation with steps | `email` card |
| `propose_tasks` | Tasks with due dates and owners | `tasks` card |
| `save_to_library` | Finished copy (captions, scripts, blog drafts, ad variations) | `asset` card |
| `web_search_20260209` (server tool) | Current info, competitors, prospects; `max_uses = min(5, searches left)` | sources in the stream |

Status labels shown to users: Reading the workspace · Building calendar entries · Drafting the campaign · Compiling leads · Writing the email · Planning tasks · Writing copy for the library · Searching the web.

Proposal ids are `crypto.randomUUID()` so the id in the stream equals the database id.

### 4. The loop (`runAgent`)
```
history (server) + user turn
  └▶ stream request (model, system blocks, tools, thinking)
       ├ text deltas → emit text
       ├ server web search results → emit source (top 3)
       ├ tool_use → validate (zod) → runTool → tool_result (+ emit proposal)
       └ stop_reason: end_turn → done | tool_use → next step | max_tokens → "continue" hint
  repeat ≤ 14 steps · abort on client disconnect (signal)
```
- On success: append the new user and assistant messages to `messages` (append-only), save proposals, update the display transcript, record usage (`completed=true`).
- On failure or abort: record usage with `completed=false` (tokens were spent), append nothing to history, release the lock. A failed brief doesn't count against the brief quota.
- `describeAgentError` turns provider errors into plain sentences (rate limit, overloaded, refusal).

### 5. Cost control
Rates per million tokens (`MODEL_RATES` in `plans.ts`):

| Model | Input | Output | Cache read | Cache write |
|---|---|---|---|---|
| Haiku 5.5 | $0.10 | $0.50 | $0.01 | $0.125 |
| Sonnet 5.5 | $2 | $10 | $0.20 | $2.50 |
| Opus 5.5 | $4 | $20 | $0.20 | $5 |

Plus a fixed cost per web search (`SEARCH_USD`). `costUSD()` computes every turn; `usage_events.cost_usd` stores it.

**Guards** (all server-side, `src/lib/server/quota.ts`):
1. Briefs per month: 15 / 30 / 35.
2. Searches per month: 0 / 15 / 40.
3. **Monthly cost cap per user:** USD 0.15 / 1.90 / 5.80. Hitting it refuses further briefs that month even if brief count remains.
4. One AI run at a time per user.
5. Text ≤ 4,000 characters; tools return slices, never the whole document.
6. Prompt caching on the persona and client blocks.

Target: AI cost ≤ 50% of plan revenue per paid user (Pro KES 500 ≈ USD 3.85; cap 1.90).

### 6. Safety
| Risk | Control |
|---|---|
| Prompt injection from web pages or imported data | Tools only propose; nothing changes until a person stamps Sawa. Web content can't trigger writes. |
| Fake history / system messages from the client | History lives only on the server (`messages`, no client access). Clients send just the new text. |
| Malicious links | `safeHref()`: http/https only, everything else dropped. |
| Invented contact details | PERSONA rule: only details found in a source, with `sourceUrl`; leads arrive unverified and without consent. |
| Spam / non-consensual messaging | EMMA never adds non-consenting contacts to broadcasts; Draft next touch is one-to-one for them. |
| Claims about prices, dates, health, legal | `review_note` on the card; shown in warn with "Check:". |
| Refusals | Shown as a plain note; not counted as a brief. |

### 7. Structured outputs (Pitch Jury)
Juror and foreperson outputs use a raw JSON schema generated from zod (`jsonFormat()` via `z.toJSONSchema`) and are parsed again with zod (`readStructured()`). The SDK's zod helper was avoided because it moved enums into descriptions.

- **Jurors (9, in parallel, isolated):** customer, skeptic, engineer, lawyer, competitor, investor, marketer, partner, CFO. Each returns `{ verdict: not_guilty | guilty, headline, reasoning, fix, confidence }`.
- **Foreperson:** `{ summary, objections[], revisedPitch, changes[] }`; never invents facts, puts unknowns in [brackets].

### 8. Quick briefs (exact text sent)
The code today has agency-flavoured quick commands in `src/components/Chat.tsx` (`QUICK_COMMANDS`: Build a calendar, Write a blog, Nurture leads, Plan a campaign, Draft a sequence, Analyse last month, Find prospects). Sokoni replaces them in phase 6 with this owner-first set, in this order:

| Tab | Brief |
|---|---|
| Plan my week | Plan my content for the next 7 days around my offers and any key dates. |
| Follow up leads | Look at my open leads and draft the next message for the ones I haven't touched in 3+ days. |
| Write a post | Write one post for today for my best channel, with a caption and hashtags. |
| Plan a campaign | Plan a small paid campaign for my best-selling offer with a budget I can afford. |
| Draft a sequence | Draft a 3-message follow-up sequence for people who asked about prices and went quiet. |
| How did last month go | How did last month go? Tell me what worked, what didn't and one thing to change. |
| Find prospects (Pro/Max) | Find 10 businesses near me that could buy from us, with sources. |
| Starter (onboarding) | Build me a two-week content plan for my channels, with copy, around my offers and any key dates. |

### 9. Learning from Sawa and Bado (v1.1)
- Record every decision with the proposal kind and, for Bado, an optional one-tap reason (Wrong tone · Wrong timing · Not my offer · Too much · Other).
- Feed the last 10 Bado reasons for the workspace into the client context as "Recently sent back because…". No fine-tuning; it's context, so it stays per business and private.
- Approval rate per kind becomes a success metric (target ≥ 50%).

### 10. Testing the agent without credits
1. Start the mock (`scratchpad/mockanthropic.mjs` or a copy in `scripts/`) on a local port.
2. Set `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>` and any non-empty `ANTHROPIC_API_KEY` in `.env.local`.
3. `npm run dev`, brief EMMA, and confirm: status → text → proposal → usage → done; then stamp Sawa and confirm the planner updated.
4. Negative tests: a `system` role in demo history → 400; `text/plain` body → 415; second brief while one runs → 429.

---

<a id="part12"></a>

## 12 · Plans and Billing

**EMMA Build Pack v2.0 · 2026-10-15**

Single source of truth for limits: `src/lib/plans.ts`. Payment code: `src/lib/server/billing.ts` and `src/app/api/billing/*`.

### 1. Plans
| | **Free** | **Pro** | **Max** |
|---|---|---|---|
| Price | KES 0 | **KES 500/month** | **KES 1,500/month** |
| Blurb | Try EMMA on your business. No card needed. | For owners who market every week. | Our best thinking, for growing teams and multiple brands. |
| Model | Claude Haiku 5.5 | Claude Sonnet 5.5 | Claude Opus 5.5 |
| Briefs / month | 15 | 30 | 35 |
| Web searches / month | 0 | 15 | 40 |
| Pitch Jury trials / month | 0 | 0 | 4 |
| Workspaces / seats | 1 / 1 | 1 / 1 | 3 / 3 |
| Tickets (leads) stored | 50 | 1,000 | Unlimited |
| Monthly AI-cost cap | USD 0.15 | USD 1.90 | USD 5.80 |

Staff (`profiles.is_staff`) get Max limits at no charge.

#### Unit economics (at KES 130 ≈ USD 1)
| | Pro | Max |
|---|---|---|
| Revenue | USD 3.85 | USD 11.54 |
| AI cost cap | USD 1.90 (49%) | USD 5.80 (50%) |
| M-Pesa / card fees (≈ 1.5–4%) | ≈ USD 0.15 | ≈ USD 0.45 |
| Gross margin at cap | ≥ 46% | ≥ 46% |
Most users won't reach the cap; average margin will be higher. Free users cost ≤ USD 0.15/month each.

#### When a limit is hit
| Limit | What happens |
|---|---|
| 80% of briefs | Meter turns warn; one gentle line on the Desk: "3 briefs left this month." |
| 100% of briefs or cost cap | Pad replaced by the limit note; upgrade sheet; resets on the 1st (Africa/Nairobi) |
| Searches used | EMMA works without web search and says so in her note |
| Leads cap | Approval adds up to the cap, reports "skipped"; banner with upgrade |
| Workspaces | New workspace → upgrade sheet; after a downgrade, extra workspaces become read-only |
| Jury | Pro/Free see the upgrade sheet ("Pitch Jury is part of Max") |

### 2. Payment methods
| Method | Model | Renewal | Plan active when |
|---|---|---|---|
| **M-Pesa** (Daraja STK push) | Prepaid 30 days | Manual: pay again (reminder 3 days before, v1.1) | STK query confirms payment and amount |
| **Paystack** (hosted checkout: M-Pesa or card, KES) | Prepaid 30 days | Manual: pay again | Paystack verify API confirms success, KES and amount |
| **Card** (Stripe Checkout, KES prices) | Subscription | Automatic monthly | Signed webhook lands |
| Manual (LionsLane grants) | SQL by staff | — | Immediately |

**Stripe and Kenya:** Stripe doesn't onboard Kenya-registered businesses directly, so Stripe runs on a test account and **Paystack** (chosen 7 Nov 2026: free to open, KES, M-Pesa and cards) is the live route while Daraja waits for a Till or PayBill.

**Which methods a customer sees:** `GET /api/account` returns `payments: { mpesa, paystack, card }`. A method shows only when its keys are set, and test keys (Stripe `sk_test_`, Daraja sandbox, Paystack `sk_test_`) count only for staff in production. With none open, checkout says payments open once the accounts are verified.

### 3. M-Pesa flow
```
User: phone + plan ─▶ POST /api/billing/mpesa/stk
  server: normalise phone (07…/01…/+254… → 2547…/2541…), amount = plan price,
          rate limit 3 prompts / 10 min, Daraja STK push, insert mpesa_payments(pending)
  ◀─ checkoutRequestId
Phone: PIN prompt ─▶ Safaricom ─▶ POST /api/billing/mpesa/callback/<secret>   (hint only)
  server: STK query ─▶ ResultCode 0? amount matches? request ours and unclaimed?
          ─▶ claim (idempotent, unique receipt) ─▶ subscriptions: plan, provider=mpesa,
             current_period_end = max(now, existing end) + 30 days
Browser: polls GET /status every 4 s × 30 ─▶ paid → "You're on Pro until 14 Nov"
         stalled → "I've paid, check now" (runs STK query)
```
- Paying while still active extends from the current end date (no lost days).
- Upgrading Pro → Max via M-Pesa: the new 30 days are Max; remaining Pro days aren't refunded in v1 (stated on the checkout sheet).
- Sandbox: Daraja test credentials and the sandbox phone. Production needs Lipa na M-Pesa Online on a PayBill or Till (`MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline`, `MPESA_PARTYB=<till>` for a Till).

### 3a. Paystack flow
1. `POST /api/billing/paystack/init { plan }`: our row first (`paystack_payments`, reference `emma-<uuid>`, amount from `PLANS`), then Paystack `transaction/initialize` (amount × 100, `KES`, channels `mobile_money` and `card`, callback `/app/billing?paystack=1`). Max 5 checkouts per user per 10 minutes.
2. The customer pays on `checkout.paystack.com`; Paystack sends them back with `?reference=`.
3. `GET /api/billing/paystack/verify?reference=` (owner only) and the signed webhook `POST /api/billing/paystack/webhook` (`charge.success`, HMAC SHA512 of the raw body with the secret key) both call `settlePaystack`, which asks Paystack's verify API, requires `success`, `KES` and the exact amount, claims the row once (`pending → paid`), then `extendPlan` adds 30 days.
4. Paystack dashboard setting: webhook URL `https://emma.lionslane.co.ke/api/billing/paystack/webhook`. Key: `PAYSTACK_SECRET_KEY` (Desktop button 9, then Vercel env).

### 4. Card flow (Stripe)
```
POST /api/billing/stripe/checkout { plan } ─▶ Checkout Session (mode subscription,
  price STRIPE_PRICE_PRO|MAX, client_reference_id = user id, success/cancel → /app/billing?status=…)
Stripe ─▶ POST /api/billing/stripe/webhook (signature verified on raw body)
  checkout.session.completed → retrieve subscription → syncStripeSubscription
  customer.subscription.created|updated|deleted → syncStripeSubscription
     (period end read from the subscription item, API 2026-08-26.dahlia)
Browser returns ─▶ polls /api/account for 30 s ─▶ toast "You're on Pro"
Manage ─▶ POST /api/billing/stripe/portal ─▶ cancel / change card
```
Cancel keeps the plan to the period end; `deleted` sets status canceled and the plan falls back to Free at period end.

### 5. Mobile apps
No purchasing in the iOS/Android apps in v1, and no links or calls to action to buy elsewhere (App Store 3.1.1, Google Play Billing). The Me tab says "Manage plan on the web" only where store rules allow; otherwise it shows the plan without a purchase path. Before selling inside the apps: RevenueCat with App Store / Play products mirroring Pro and Max, receipts verified server-side into `subscriptions` (provider `iap`, new migration).

### 6. Refunds and receipts
- Draft policy (`/legal/refunds`): the first paid-plan payment is refunded in full if asked within **7 days**; later payments aren't refunded, but plans can stop at any time (M-Pesa simply ends after 30 days; card cancellation stops the next renewal). Owner to confirm the window.
- M-Pesa receipt number shown on the Billing page; Stripe sends its own receipts.
- VAT position and tax invoices: confirm with LionsLane's accountant before launch; no "prices include VAT" claim until confirmed.

### 7. Admin
- Grant a plan manually:
```sql
update subscriptions set plan='pro', status='active', provider='manual',
  current_period_end = now() + interval '30 days' where user_id = '<uuid>';
```
- Make someone staff: `update profiles set is_staff = true where id = '<uuid>';`
- Cost per user this month: `select user_id, sum(cost_usd) from usage_events where created_at >= date_trunc('month', now() at time zone 'Africa/Nairobi') group by 1 order by 2 desc;`

### 8. Billing tests (before launch)
1. Free user hits 15 briefs → upgrade sheet → M-Pesa sandbox → plan shows Pro with the right end date.
2. Same payment callback sent twice → plan extended once.
3. Callback with a wrong amount → plan unchanged, payment marked failed.
4. Stripe test card → webhook → Pro; cancel in portal → stays Pro until period end.
5. Webhook with a bad signature → 400, nothing changes.

---

<a id="part13"></a>

## 13 · Security

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces SecurityReview.md

Reviewed the way an attacker would look at it: who could spend our money, read someone else's data, or trick EMMA? Each finding is in plain English, with the fix and its status. First review 2026-10-09; updated 2026-10-15.

### 1. Threat model in one table
| Asset | Threat | Main defence |
|---|---|---|
| Anthropic credit | Anonymous or abusive use of AI routes | Accounts, quotas, cost caps, one run at a time |
| Business data | One customer reading another's workspace | RLS on every table, membership helpers |
| Plans and money | Self-upgrade, fake payments, replayed callbacks | Server-only writes, Stripe signatures, M-Pesa STK query, idempotent claims |
| EMMA's behaviour | Prompt injection, forged history | Server-side history, propose-only tools, human approval |
| Users' browsers | XSS, clickjacking, CSRF | CSP, frame-ancestors none, JSON-only + Origin check, safeHref |
| Secrets | Leaks to clients or logs | Server-only env vars, no secrets in logs, publishable key only in clients |

### 2. Findings from the prototype review (all fixed)
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

### 3. Controls by layer

#### Identity and sessions
- Supabase Auth: email OTP (6 digits), email link (`/auth/confirm`, token hash), passkeys, and Google on web. Google uses Google's own button (`accounts.google.com/gsi`, ID token with a per-page SHA-256 nonce, `signInWithIdToken`), so Google's screen names emma.lionslane.co.ke; the redirect flow is the fallback. Google's script loads only after the visitor taps Continue with Google (our own button first), so opening /signin sends nothing to Google. `getClaims()` verifies the JWT signature on every API call.
- Two-step: a user whose session is `aal1` is refused by every API (`401 {mfa:true}`) when Supabase's admin API lists a verified factor for them. The factor list never comes from the session cookie, which the browser can edit; `src/proxy.ts` uses the cookie only to steer screens.
- HttpOnly cookies refreshed by `src/proxy.ts`; mobile stores the session in expo-sqlite-backed localStorage and sends a Bearer token.
- `user_metadata` is never used for authorisation; staff is `profiles.is_staff`, server-only.
- OAuth callback accepts only same-site `next` paths (no open redirects).
- Account deletion revokes sessions globally first.

#### Authorisation (database)
- RLS on all 10 tables; nothing granted to `anon`; column-level update grants; `with check` on every update policy; `security definer` helpers in an unexposed `private` schema with `search_path = ''`.
- `messages` and `ai_runs` have no policies: clients can never read them.
- 33 automated PGlite tests: cross-tenant reads, self-upgrade, self-staff, usage tampering, history reads, workspace creation past plan, anonymous access.

#### API
- JSON only (415), size limits (413), zod validation (400), Origin check for cookie requests (403), CORS only for listed origins with Bearer tokens.
- The server never accepts a workspace, history, model, plan or price from the client.
- Rate limits: plan quotas, cost caps, one AI run per user, 3 M-Pesa prompts per 10 minutes.

#### AI
- Propose-only tools; approval is a separate authenticated call by an editor.
- Inputs from streamed tool calls re-validated with zod.
- Researched leads arrive unverified and without consent; EMMA won't broadcast to non-consenting contacts.
- Review notes for sensitive claims.

#### Payments
- Stripe webhook: raw body ≤ 512 KB, signature verified, retries on handler failure.
- M-Pesa callback at a secret path, body never trusted: STK query confirms, amount must match `plans.ts`, request must be ours and unclaimed, receipt unique.

#### Browser
- CSP (`next.config.ts`): `default-src 'self'`; scripts self + inline (Next hydration); connect-src self + Supabase; `frame-ancestors 'none'`; `form-action 'self'` + Stripe Checkout.
- React escaping for all text; no `dangerouslySetInnerHTML` with model output; Markdown rendered with a safe renderer and links through `safeHref`.

#### Secrets and logs
- Server-only env vars on Vercel; `.env*` git-ignored; `.env.example` lists names only.
- Never log secrets, tokens, full prompts or personal data; log error class + route + user id.

### 4. Launch security checklist
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

### 5. Accepted risks
- CSP allows inline scripts (Next.js hydration). Revisit with nonces.
- A user can edit their own workspace document to exceed the displayed lead count; it costs only storage, and approvals still enforce the cap.
- Expo SDK dependency advisories as above.

### 6. Security tests to rerun before every release
1. Two accounts: B can't read A's workspace, conversations, proposals or payments (RLS suite).
2. Signed-out `POST /api/emma` → 401; `text/plain` → 415; foreign Origin with cookie → 403.
3. Demo history containing a `system` role → 400.
4. Second brief while one runs → 429.
5. M-Pesa callback replay → plan extended once; wrong amount → unchanged.
6. Stripe webhook with a bad signature → 400.
7. A lead with `sourceUrl: "javascript:alert(1)"` renders as plain text.
8. Response headers include CSP, X-Frame-Options, HSTS, nosniff.

---

<a id="part14"></a>

## 14 · Mobile App and Store Listing

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces StoreListing.md

### 1. What the app is
The owner's pocket desk: brief EMMA, stamp cards, see what's planned, call the people who asked. Same account, same backend as the web. Plans are managed on the web in v1.

### 2. Stack
| Item | Choice |
|---|---|
| SDK | Expo SDK 57 (`expo ~57.0.28`), React Native 0.86.3 |
| Routing | Expo Router, routes in `mobile/src/app`, typed routes |
| Auth | `@supabase/supabase-js` 2.117.1; session in expo-sqlite-backed `localStorage` |
| Streaming | `expo/fetch` reading NDJSON from `/api/emma` |
| Builds | EAS (`mobile/eas.json`) |
| Identity | name EMMA, slug `emma`, scheme `emma`, bundle/package `co.lionslane.emma` (owner to confirm) |
| Theme | `mobile/src/lib/theme.ts` mirrors the Sokoni tokens (06) |

Folder:
```
mobile/
  app.json  eas.json  package.json  tsconfig.json  .env.example
  src/app/_layout.tsx           Gate: session → tabs, else sign in
  src/app/signin.tsx
  src/app/(tabs)/_layout.tsx    Desk · Planner · Tickets · Me
  src/app/(tabs)/index.tsx      Desk
  src/app/(tabs)/calendar.tsx   Planner
  src/app/(tabs)/leads.tsx      Tickets
  src/app/(tabs)/account.tsx    Me
  src/lib/{theme,supabase,api,session}.ts(x)
  src/components/ui.tsx
```

### 3. Screens
See 07 (M1–M5). Key behaviours:
- **Desk:** swipe right = Sawa (stamp lands at 40% of the swipe, haptic success); swipe left = Bado (light haptic); buttons always visible; tap = detail sheet.
- **Planner:** upcoming entries by day, Copy and Share to WhatsApp (`Linking.openURL("whatsapp://send?text=…")`, falling back to `https://wa.me/?text=…`).
- **Tickets:** Call (`tel:`), WhatsApp (`https://wa.me/<2547…>`), Email (`mailto:`).
- **Me:** plan and usage, theme, privacy and terms links, sign out.
- Offline: warn banner, cached last lists (read-only), briefs disabled with a reason.

### 4. Sokoni on mobile
- Load Instrument Serif, Bricolage Grotesque and IBM Plex Mono with `expo-font` before hiding the splash.
- Splash: Paper background with the Stamp `e` mark in Clay; Usiku splash on dark devices.
- App icon: the Stamp `e` in Clay on Paper, kanga ring; Android adaptive icon with the stamp on the foreground layer, Paper background.
- Haptics: `expo-haptics` success on Sawa, light impact on Bado, nothing else.

### 5. Running it
```bash
cd mobile && npx expo start
```
Scan the QR code in Expo Go. Web preview:
```bash
cd mobile && npx expo start --web
```
`mobile/.env`: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_API_URL=https://<app domain>`. For local web testing, the web server's `CORS_ORIGINS` already allows `http://localhost:8081` in development.

Checks that pass today: `tsc`, `expo-doctor` 21/21, Expo web export bundles. Device testing needs the live backend.

### 6. Building and submitting
1. Accounts: Apple Developer (USD 99/year), Google Play Console (USD 25 once). Owner action.
2. Confirm the bundle id in `mobile/app.json`.
3. Build:
```bash
cd mobile && npx eas-cli@latest build --platform all
```
4. Submit (after the store listings are filled in):
```bash
cd mobile && npx eas-cli@latest submit --platform all
```
5. Before selling inside the apps: RevenueCat in-app purchases (see 12 §5).

### 7. Store listing (paste-ready)
- **App name** (30): `EMMA: AI Marketing Assistant`
- **Subtitle, iOS** (30): `Plan, write, follow up`
- **Short description, Play** (80): `The marketing team that already knows your business. Brief, stamp, done.`

**Description**
> EMMA is the marketing team that already knows your business.
>
> Tell EMMA what you need in one sentence and she gets to work: a plan for the week, posts and captions in your voice, follow-ups for the people who asked your prices, and a list of who to call today.
>
> Nothing goes out without you. Every plan, post and message arrives as a brief card. Stamp it Sawa to approve or Bado to send it back.
>
> WHAT EMMA DOES
> • Plans your posts around your offers, holidays and busy seasons
> • Writes captions, ads, emails and WhatsApp messages in your voice
> • Keeps every enquiry on a ticket, with call, WhatsApp and email in one tap
> • Tells you who to follow up today, so leads don't go cold
> • Shows what you've planned and what's working
>
> BUILT FOR KENYAN BUSINESSES
> • Made in Nairobi by LionsLane
> • Designed around WhatsApp, Instagram, Facebook, TikTok and LinkedIn
> • Consent flags on every contact, in line with the Kenya Data Protection Act
>
> Free to start. Your workspace is private to your account. EMMA's work is generated by AI and can be wrong: review everything before you publish it.

- **Keywords** (iOS, 100): `marketing,social media,content,planner,captions,instagram,whatsapp,leads,small business,kenya`
- **Categories:** Business (primary), Productivity (secondary)
- **Age rating:** 4+ / Everyone
- **URLs:** support `<app>/legal/terms` (until a support page exists), privacy `<app>/legal/privacy`, marketing `<app>`

#### Privacy answers (App Store label and Play Data safety)
| Data | Collected | Linked to user | Tracking |
|---|---|---|---|
| Email | Yes (account) | Yes | No |
| Name | Optional | Yes | No |
| User content (workspace, briefs) | Yes (app functionality) | Yes | No |
| Contacts the user enters (leads) | Yes (app functionality) | Yes | No |
| Usage (brief counts) | Yes (app functionality) | Yes | No |
| Diagnostics | No | — | — |
| Purchases | No (v1) | — | — |
Encrypted in transit; deletion available (web account settings → Delete account; add an in-app path before submission, which Apple requires for apps with account creation).

#### Review notes
- Provide a demo account in the review notes (a Supabase test user with a fixed OTP, owner to create).
- State that the app sells nothing in v1 and has no external purchase links.

#### Screenshots (generate from the running app on the live backend)
Sizes: iPhone 6.9" (1320×2868), 6.5" (1242×2688), Android phone (≥ 1080×1920). Five frames on Paper with a serif caption above each:
1. *Brief EMMA in one sentence.* (Desk, a note streaming)
2. *Stamp it Sawa. Nothing posts without you.* (a brief card mid-stamp)
3. *Your week, planned and written.* (Planner)
4. *Every enquiry on a ticket.* (Tickets with call/WhatsApp)
5. *Made in Nairobi.* (Me, with the kanga band)

### 8. Before submission (checklist)
- [ ] Live backend URL in `mobile/.env`, tested on a real Android and iPhone
- [ ] In-app account deletion path
- [ ] Demo account for reviewers
- [ ] Icons, splash and screenshots in Sokoni
- [ ] `npx expo install --fix` then audit
- [ ] Privacy answers entered in both consoles

---

<a id="part15"></a>

## 15 · Legal and Compliance

**EMMA Build Pack v2.0 · 2026-10-15**

Not legal advice. The pages below are drafts written for clarity; **a Kenyan advocate must review them before launch.** Source: `src/app/legal/content.tsx`, served at `/legal/<slug>`. Company details come from `NEXT_PUBLIC_COMPANY_*` env vars; empty fields are hidden, never invented.

### 1. Laws that apply
| Law / rule | What it means for EMMA |
|---|---|
| **Kenya Data Protection Act 2019** + regulations | Register with the ODPC as data controller (and processor for agency workspaces). Lawful basis per purpose, data subject rights, breach notice within 72 hours, cross-border transfer safeguards (Anthropic, Vercel, Supabase, Stripe are outside Kenya). |
| Consumer Protection Act 2012 | Clear prices, honest claims, fair cancellation and refund terms. |
| Kenya Information and Communications Act (unsolicited messages) | EMMA never broadcasts to contacts without consent; consent flag on every lead. |
| Tax rules (KRA, VAT, eTIMS) | Keep payment records for the legal period; confirm VAT registration and invoices with the accountant. |
| App Store Review Guidelines 3.1.1 / Google Play Payments | No in-app purchases or external purchase links in v1 apps; IAP before selling in-app. Account deletion in-app. |
| Anthropic usage policies | No prohibited uses; AI output disclosed as AI-generated and reviewed by a person. |
| Platform terms (Meta, TikTok, LinkedIn, WhatsApp) | v1 doesn't post or message automatically; users publish by hand. v2 integrations need each platform's approval. |

### 2. The four public documents (outline of the drafts)
#### Privacy Policy `/legal/privacy`
Who we are · What we collect (account email and name, workspace content, contacts users enter, usage counts, payment references; no card numbers) · Why (lawful basis: contract for the service, legitimate interest for security, consent for marketing) · Who processes it (Supabase, Vercel, Anthropic, Stripe or the card processor, Safaricom) · How long (while the account is open; deleted within 30 days of account deletion except records the law requires; security logs up to 90 days) · Your rights (access, correction, deletion, objection, portability via Export, complaint to the ODPC) · Security · Children (not for under-18s) · Changes.

#### Terms of Service `/legal/terms`
The service · Your account · Plans and payment (Free/Pro/Max, M-Pesa prepaid 30 days, cards renew monthly) · Acceptable use (no spam or unsolicited marketing, no contact without a lawful basis, no false claims, consent is the user's responsibility) · **AI-generated content** (EMMA can be wrong; you review and are responsible for what you publish; researched leads are unverified) · Your content (you own it and EMMA's outputs made for you; processed only to provide the service; export any time. Consider adding an explicit "not used to train models" line once the processor terms are confirmed) · Availability and changes · Liability (capped at fees paid in the last 3 months) · Ending the agreement · Law (Kenya) · Contact.

#### Cookie Notice `/legal/cookies`
Strictly necessary cookies and storage need no consent (session, CSRF-safe auth, `emma-cloud`, `emma-consent`). Every analytics script (Google Analytics and Vercel Web Analytics) and every other third-party script waits for consent: the consent bar asks first, nothing loads until the visitor taps Allow, No thanks is remembered, and Cookie settings in the footer reopens the choice. Google's sign-in script loads only when the visitor taps Continue with Google. Stripe and Paystack set their own cookies on their checkout pages.

#### Refund Policy `/legal/refunds`
First paid-plan payment refunded in full within 7 days · later payments not refunded but plans can stop any time · if something went wrong (double charge, failed activation) we fix or refund · how to ask (privacy/company email).

### 3. In-product legal touchpoints
| Where | What |
|---|---|
| Sign in | "By continuing you agree to the Terms and Privacy Policy" with links |
| Business Profile → Where your data goes | Plain list of processors and what each receives (Anthropic gets the brief and the workspace slices EMMA reads) |
| Brief cards | Review notes for claims about prices, dates, health, legal, certifications |
| Tickets | Verified and consent flags; Record consent action stores who and when (v1.1: consent source text) |
| Footer | Registered name, address, contact from env; legal links |
| Delete account | Type DELETE; explains what's deleted and what's kept (payment records) |

### 4. Business customers (agencies, Max)
- Data Processing Agreement template: EMMA/LionsLane as processor for the agency's client data; sub-processors listed; breach notice; deletion on termination. **To draft with the advocate.**
- Agencies confirm they have the right to load their clients' data.

### 5. Launch legal checklist
| Item | Owner | Status |
|---|---|---|
| Advocate review of all four documents | LionsLane | Open |
| ODPC registration (controller + processor) | LionsLane | Open |
| Registered company name, address, emails, phone in env | LionsLane | Open |
| Refund window confirmed (draft 7 days) | LionsLane | Open |
| VAT / eTIMS position with the accountant | LionsLane | Open |
| DPA template for agencies | LionsLane + advocate | Open |
| Cross-border transfer clause (processors outside Kenya) | Advocate | Open |
| No fake testimonials, logos or unprovable claims on the site | Product | Done |
| Fonts and icons licensed (OFL Google Fonts; own icons and stamp) | Product | Done |
| Accessibility statement page (optional, recommended) | Product | v1.1 |

---

<a id="part16"></a>

## 16 · Implementation Plan

**EMMA Build Pack v2.0 · 2026-10-15** · Replaces DevelopmentPlan.md and LaunchChecklist.md

Phases in order. Each one ends working, tested and documented before the next starts.

### 1. Status
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

### 2. Phase 6: Sokoni redesign (detailed)
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

### 3a. Live setup (updated 7 November 2026)

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

Still open: Paystack compliance and live keys, Kopo Kopo, Daraja go-live (Till or PayBill), Stripe verification, EMMA on the Lions Lane Google Business Profile, Ahrefs Webmaster Tools, Google brand verification (shows "EMMA" on Google's screen), Eve's Cloudflare destination.

### 3. Phase 7: Deploy (owner-supplied items first)

#### Owner items (blocking)
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

#### Steps
1. **Supabase:** create project (region nearest Kenya, e.g. Frankfurt); run the migration (`supabase link` then `supabase db push`); copy URL, publishable and secret keys; enable Email OTP (template includes `{{ .Token }}`); connect custom SMTP; optional Google provider with redirect `https://<domain>/auth/callback`; set Site URL and redirect allow-list; mark staff (`update profiles set is_staff = true …`).
2. **Vercel:** push `emma/` to a private GitHub repo (owner confirms before any push); import in Vercel (root `emma`); set env vars (08 §4); add domain; enable Web Analytics; add a Firewall rule for `/api/*`.
3. **Payments:** create Pro and Max prices in KES; webhook to `/api/billing/stripe/webhook` with the four events; customer portal on. Daraja sandbox first, then production credentials; `MPESA_CALLBACK_SECRET` = 32+ random characters.
4. **Smoke test** (below), then announce.

### 4. Go-live checks
1. Fresh email → code → onboarding → starter plan streams → Sawa → planner updated.
2. Two accounts can't see each other's data.
3. Free account hits 15 briefs → upgrade sheet → M-Pesa sandbox → Pro with the right end date.
4. Card test → webhook → Pro; portal cancel keeps Pro to period end.
5. `npm audit` clean · `npm run build` passes · Lighthouse a11y ≥ 95 on landing and sign-in · headers present.
6. Mobile on a real phone against production: sign in, brief, swipe Sawa, call a ticket.

### 5. Phase 8: Launch test
- Week 1–2: 10 owner interviews (salons, cafés, dukas, trainers). Watch them brief EMMA; note where they hesitate.
- Founding offer: first 50 Pro users at KES 500 locked for 12 months.
- Distribution: LionsLane clients and referrals, The Other Side videos showing EMMA working in real time, WhatsApp SME groups, referral month.
- **Decision at day 30:** ≥ 20 paying Pro users → continue to v1.1; 5–19 → fix onboarding and offer, retest 30 days; < 5 → the buyer or the offer is wrong, go back to interviews.

### 6. Definition of done (every phase, every PR)
Typecheck + build pass · affected screens checked in a browser at 360px and desktop, in Mchana and Usiku · console clean · keyboard pass · docs updated · no secrets in code · for AI/billing/RLS changes, the relevant tests in 11 §10, 12 §8 and 13 §6 rerun.

### 7. Commands
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

---

<a id="part17"></a>

## 17 · Agent Rules

**EMMA Build Pack v2.0 · 2026-10-15**

For any AI coding agent (Claude Code, Cursor, Codex) or developer working on EMMA. `AGENTS.md` and `CLAUDE.md` at the repo root point here.

### 1. Read first
1. 08 TRD → "Essentials": the eight rules that must never break.
2. 02 PRD: what the feature is for, by requirement id.
3. The doc for the area you touch: 06/07 (UI), 09 (data), 10 (API), 11 (AI), 12 (billing), 13 (security), 14 (mobile).

### 2. Plan before you code
- State the change in one sentence and the requirement id(s) it serves.
- Name which Essentials rule(s) it touches. If it touches auth, RLS, billing, AI routes or anything that costs money, list the security checks you'll keep (13 §6).
- Prefer the smallest change that works. No new dependency without a written reason; pin exact versions at least two weeks old.

### 3. Code rules
- TypeScript strict. Validate every request body and every model tool input with zod.
- Server code that needs a user: `requireUser(req)` from `src/lib/server/auth.ts`. Never read `user_metadata` for permissions.
- Load workspaces with the user's Supabase client (RLS). The secret-key admin client only for `usage_events`, `subscriptions`, `messages`, `proposals`, `mpesa_payments`, `ai_runs`.
- Plan limits only from `src/lib/plans.ts`.
- AI calls only from route handlers. Tools propose; they never write.
- Conversation history (`messages`) is append-only. Never rewrite earlier turns.
- Links from model or web data go through `safeHref()`.

### 4. Design rules (Sokoni)
- Colours, fonts, radii, shadows and durations only as tokens (06 §2). No hex values in components.
- **Clay is EMMA's colour only.** Saffron never as text on Paper. Status always icon + word.
- One primary action per screen. No explanatory subheaders. Empty state = one serif line + one action.
- Every drag has a button path; every icon-only control has an accessible name; every async view has a skeleton.
- Respect `prefers-reduced-motion` and `forced-colors`. Test in Mchana and Usiku at 360px.
- Copy: plain Kenyan English, specific, no hype words, no emoji. Swahili only for the fixed UI words (Sawa, Bado, Karibu, Asante, Habari) with English accessible names.

### 5. Data and migrations
- New migration file per change (`supabase migration new <name>`); the CLI's timestamped, underscored filename is a tool requirement and the only exception to the no-hyphens/underscores naming rule.
- RLS on, explicit grants, `with check` on update policies, nothing for `anon`. Never edit an applied migration.
- Add RLS tests for every new table (two users, cross-tenant read must fail).

### 6. Secrets and outward actions
- Never commit `.env*` or keys. Never log secrets, tokens, full prompts or personal data.
- Never borrow keys from other projects. Keys go in `.env.local` by the owner.
- Confirm with the owner before any outward action: deploy, GitHub push, store submission, sending email or messages, payments in production.

### 7. Testing
- `npm run typecheck` and `npm run build` pass.
- Run the app (`npm run dev`, port 5180, bound to 127.0.0.1) and check the affected screen in the browser; console clean.
- AI routes without credits: mock via `ANTHROPIC_BASE_URL` (11 §10).
- RLS changes: PGlite suite plus a two-user check.
- Mobile: `cd mobile && npx expo start --web`, then Expo Go on a phone.

### 8. Naming
- Deliverable files (docs, exports, images for people): no hyphens or underscores, e.g. `EmmaComplete.md`, `LeadsBoard.png`.
- Code follows framework conventions (Next.js route folders, Expo Router groups); where a tool forces a name, keep it and note it.
- User-facing surface names: Desk, Wall Planner, Tickets, Campaigns, Email Hub, Shelf, Stall, Ledger, ROI & Compliance, Business Profile, Plan & Billing, Pitch Jury. Routes keep their v1 paths (`/app/calendar`, `/app/leads`…) so links don't break.

### 9. When you change a rule
Update the doc that owns it in the same change: limits → 12 and `plans.ts`; tables → 09; endpoints → 10; tokens → 06; flows → 04; requirements → 02. Then regenerate `docs/EmmaComplete.md` with `python scripts/buildcomplete.py docs`.
