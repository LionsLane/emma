# 07 · Screen Specs

**EMMA Build Pack v2.0 · 2026-10-15**

Every screen, top to bottom: purpose, layout, content, states, and the code file it lives in. Components and tokens are defined in 06. Navigation between screens is in 04.

Legend: **P** = primary action (one per screen) · **E** = EMMA action (Clay) · *italic* = serif voice.

---

## Public

### S1 · Landing `/` (`src/app/page.tsx`)
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

### S2 · Sign in `/signin` (`src/app/signin/SignIn.tsx`)
- Split layout ≥ 1024: left a paper panel with the stamp mark large, rotated −10°, and *Karibu.*; right the form card.
- Step 1: email input, **Email me a code** (P), divider "or", Continue with Google (secondary). Small print: "By continuing you agree to the Terms and Privacy Policy" (links).
- Step 2: six single-digit boxes (paste fills all, auto-advance, `inputmode="numeric"`, `autocomplete="one-time-code"`), **Sign in** (P), "Use a different email", "Send a new code" (enabled after 30s, countdown in mono).
- Errors inline under the field, risk colour + icon: "That code didn't work. It may have expired; request a new one."
- Loading: button shows the 3-dot mark; inputs disabled.

### S3 · Legal `/legal/[slug]` (`src/app/legal/content.tsx`)
Single column 720px, serif H1, UI body 16px, "Last updated" in mono, table of contents for long pages, links between the four documents. Company details from env.

### S4 · 404 and errors
- 404: big serif *Hmm.* and "That page doesn't exist." Buttons: Open EMMA (P) · Home.
- App error: *Something went sideways.* "Your work is saved." Try again (P) · Back to the Desk.

---

## Onboarding

### S5 · Welcome `/app/welcome` (`src/app/app/welcome/page.tsx`)
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

## The app

### S6 · The Desk `/app` (`src/app/app/page.tsx`)
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

### S7 · Ask EMMA drawer (global, `src/components/Shell.tsx`)
Right sheet 480px with the current thread and a compact pad. Opens from the top bar, ⌘K briefs, and every "…with EMMA" button (prefilled brief, not auto-sent unless the action says "Write this one"). Brief cards inside the drawer stamp the same way.

### S8 · Command palette (⌘K / Ctrl K)
Serif placeholder *What do you need?* Groups: Go to (screens) · Ask EMMA (quick briefs) · Recent tickets · Recent planner entries. Typing a sentence and pressing Enter with no match sends it as a brief and opens the drawer. Arrow keys, Enter, Escape.

### S9 · Wall Planner `/app/calendar` (`src/app/app/calendar/page.tsx`)
1. Toolbar: ‹ Month › · Today · Month | Week | Dossiers · Platform filter · Sector filter · **Plan with EMMA** (E, P).
2. **Month view:** 7-column grid on paper; masking-tape headers per week; day cells show up to 3 sticky notes + "+2"; kanga banners for key dates; today's cell has a saffron 2px top edge and the date in a filled ink circle.
3. **Week view:** 7 tall columns, notes stacked by time slot (Morning/Afternoon/Evening).
4. **Dossiers view:** table: date (mono) · platform · title · objective · status · owner · publish; row → sheet.
5. **Dossier sheet:** title (editable), date field, platform, status select, copy editor (textarea with character count per platform: Instagram 2,200; X 280; LinkedIn 3,000), the full dossier fields in a collapsible "Details" group, actions: **Write this one** (E) · Copy · Share to WhatsApp · Delete (danger, with Undo toast).
- States: skeleton grid; empty (see 06 empty states); drag a note → "Moved to 22 Oct · Undo".

### S10 · Tickets `/app/leads` (`src/app/app/leads/page.tsx`)
1. Toolbar: Board | List · search · **Who to call today** (toggle chip) · Find prospects (E; Free shows a small lock and opens the upgrade sheet) · Add ticket (P).
2. Summary strip (mono): Open value KES 312,000 · Weighted KES 96,400 · Won this month KES 48,000.
3. **Board:** six columns as in 06; tickets draggable; column "Move to…" menu per ticket for keyboard users.
4. **List:** table with score, name, company, stage, value, last touch, flags.
5. **Ticket sheet:** name/company/role, stage select, score, value, phone/email/social, source link (safeHref), notes (timeline: each touch with date), flags with actions (Mark verified · Record consent), buttons: Call · WhatsApp · Email · **Draft next touch** (E).
- States: skeleton columns; empty state; lead cap reached on Free: banner "50 of 50 tickets on Free. Pro holds 1,000." with Upgrade.

### S11 · Campaigns `/app/campaigns`
Table with platform, status chip (Draft/Active/Paused/Ended, icon + word), budget/spent as a thin meter, CTR, CPC, conversions, ROAS (mono, right-aligned). Row → sheet: details, ad copy, Diagnose with EMMA (E), Pause/Resume, Delete. Toolbar: Optimise with EMMA (E, P). Note under the table in muted 13px: "Figures are entered by hand until ad accounts can be connected." (Only shown when a campaign has no figures.)

### S12 · Email Hub `/app/email`
Tabs: Broadcasts · Automations · Analytics. Broadcasts and automations as rows (name, audience, status, sent, open rate). Automation sheet shows steps as a vertical timeline with delays ("Day 0 → Day 2 → Day 7"). Analytics: three big ledger numbers (sent, open rate, click rate) and top subject lines. **Draft with EMMA** (E, P).

### S13 · Shelf `/app/library`
Masonry grid of tiles (type label, title, first lines of copy in serif for copy items, thumbnail for media links). Search, type filter. Tile → sheet (edit, copy, delete). **Repurpose with EMMA** (E, P).

### S14 · Stall `/app/catalog`
Offerings as price-tag cards (a tag shape with a punched hole, price in serif, customers/rating/revenue in mono). Actions per card: Campaign (E) · Put on trial (Max/staff; others see the upgrade sheet). Add offering (P).

### S15 · Ledger `/app/dashboard`
1. Serif sentence from data (see 06).
2. Six ledger numbers in a 3×2 grid: Leads this month (with pace) · Pipeline (weighted) · Ad spend · ROAS · Email open rate · Posts scheduled. Each links to its screen.
3. Sparklines over full months only (chart-1), with a legend if two series.
4. Activity (latest 8, mono times) · Tasks (tick inline).
No primary button: the Ledger is for reading. (Ask EMMA "How did last month go" is in the top bar.)

### S16 · ROI & Compliance `/app/roi`
- ROI: spend vs revenue, six months, one axis, two series (chart-1 spend, chart-2 revenue), legend, tooltips; ROAS by channel bars; cost per lead; marketing ROI as one big number.
- Compliance: compact heading "Kenya Data Protection Act · ODPC"; checklist rows with status select (OK / Attention / At risk, icon + word), score as "7 of 10 OK". **Audit with EMMA** (E, P).

### S17 · Business Profile `/app/settings`
Sections as cards: Identity · What you sell (offerings table) · Sectors · Partners · Key dates · Brand voice (voice, pillars, always, never, palette picker limited to the brand-safe range) · Compliance regime · Usage this month · Where your data goes · Data (Export, Import with confirm) · Workspaces (New workspace) · Danger zone (Delete account: type DELETE). Auto-save with "Saved" / "Saving…" / "Not saved" in the top bar.

### S18 · Plan & Billing `/app/billing` (`src/app/app/billing/page.tsx`)
1. Current plan card: plan name in serif, renewal or expiry date in mono, provider ("Paid with M-Pesa · ends 14 Nov" or "Card · renews 14 Nov"), Manage card subscription (if Stripe).
2. Usage meters: briefs, web searches, tickets, jury trials (Max).
3. Three plan cards with Upgrade buttons.
4. **Checkout sheet:** tabs M-Pesa | Card.
   - M-Pesa: phone input (accepts 07…, 01…, +254…; shows normalised 2547… in mono), **Pay KES 500** (P). Waiting state: a phone illustration and "Check your phone and enter your M-Pesa PIN." with a mono timer; "I've paid, check now" after 20s. Success: Sawa stamp lands on a receipt: "You're on Pro until 14 Nov." Done.
   - Card: summary and **Continue to secure checkout** (P) → Stripe. On return: "Confirming your payment…" then toast.
- Errors: cancelled ("You cancelled on your phone. Nothing was charged."), insufficient funds, timeout, wrong amount (never grants the plan).

### S19 · Pitch Jury `/app/jury` (staff + Max)
1. Case list (left) and case view (right).
2. New case form: title, kind, context, pitch, audience, price; or "Start from an offering".
3. **Put it on trial** (E, P). Nine juror seats in a 3×3 grid; each seat flips from a blank card to a verdict card as its result arrives: role, verdict stamp (NOT GUILTY in ok / GUILTY in risk, both with words), headline, reasoning, the fix, confidence in mono.
4. Foreperson panel: tally in serif 40px "7–2", objections that matter, revised pitch with [unknowns in brackets], **Use this for the next round**. 9/9 acquittal: kanga band draws, "Hand it to EMMA" (E).
- Rounds kept as tabs "Round 1 · 1/9", "Round 2 · 5/9".

---

## Mobile app (Expo, `mobile/src/app`)

### M1 · Sign in (`signin.tsx`)
Stamp mark, *Karibu.*, email → code (six boxes, OS one-time-code autofill), Sign in. No Google in v1.

### M2 · Desk (`(tabs)/index.tsx`)
Greeting line, pending cards as a vertical stack (swipe right Sawa, left Bado, tap for detail sheet), margin notes in the thread, pad at the bottom with quick-brief chips in a horizontal scroller. Keyboard-avoiding; Send in Clay.

### M3 · Planner (`(tabs)/calendar.tsx`)
Upcoming list grouped by masking-tape day headers; entry → sheet with copy, Copy, Share to WhatsApp.

### M4 · Tickets (`(tabs)/leads.tsx`)
List sorted by "who to call today" first, then score; each row a compact ticket with Call / WhatsApp / Email buttons.

### M5 · Me (`(tabs)/account.tsx`)
Plan and usage meters, theme (System/Mchana/Usiku), privacy and terms links, "Manage plan on the web" (opens the browser; no purchase UI), Sign out.

---

## Screen checklist (each screen ships with)
Skeleton · empty state · error state · 360px layout · keyboard path · Usiku check · one primary action · no explanatory subheader · page `<title>` "Desk · EMMA" format.
