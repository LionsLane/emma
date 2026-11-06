# 04 · App Flow

**EMMA Build Pack v2.0 · 2026-10-15**

What every click does and which screen comes next. No screen may be a dead end: each lists where it leads.

## Route map

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

## 1. First visit to first value
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

## 2. The Desk
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

## 3. Global (every app screen)
| Action | Result |
|---|---|
| Ctrl/⌘ K, or "Search or jump to…" | Command palette: pages, quick briefs, or type a brief (sends to EMMA and opens the drawer) |
| **Ask EMMA** (top bar) | Side drawer with the Desk's thread and pad |
| Sidebar link | Navigate |
| Account chip → Switch workspace | Loads that workspace (Max) |
| Account chip → Business profile / Plan & billing / Privacy / Sign out | Navigate; Sign out → Landing |
| Toast link | Navigate to the thing it mentions |
| Mobile web: tab bar (Desk, Planner, Tickets, Ledger, More) | More opens the command palette |

## 4. Wall Planner
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

## 5. Tickets
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

## 6. Other surfaces
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

## 7. Upgrade and payment
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

## 8. Errors and edge states
| Situation | What the user sees | Next |
|---|---|---|
| Session expired on an API call | Toast "Please sign in again" | Sign in, then back to `next` |
| Another device saved first | Toast "Updated from another device. You're seeing the latest." | Continue |
| Save failed (offline) | "Not saved" in top bar, toast | Retries on next edit |
| AI busy (one brief at a time) | Note "EMMA is still working on your last brief" | Wait |
| AI refusal | Note "EMMA can't help with that. Try rephrasing as a marketing brief." | Rephrase |
| Server error in a page | Error screen "Something went wrong. Your work is saved." | Try again / Back to EMMA |
| Workspace read-only after downgrade | Banner on that workspace + upgrade | Billing |

## 9. Mobile app flow
```
Launch ─(no session)─▶ Sign in (email → code) ─▶ Tabs
Tabs: Desk · Planner · Tickets · Me
Desk: brief ─▶ stream ─▶ card: swipe right = Sawa (stamp + haptic), left = Bado; tap = details
Planner: upcoming list ─ tap ─▶ entry (copy, Copy / Share to WhatsApp)
Tickets: list by score ─ Call / WhatsApp / Email buttons
Me: plan + usage, privacy links, Sign out ─▶ Sign in
(No purchase screens in v1: plans are managed on the web.)
```
