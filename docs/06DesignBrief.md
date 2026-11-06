# 06 · Design Brief: the Sokoni design system

**EMMA Build Pack v2.0 · 2026-10-15**

How the brand in 05 becomes interface. Every value here maps to a CSS token in `src/app/globals.css` (web) and `mobile/src/lib/theme.ts` (mobile). Components never hardcode a colour, a font or a duration.

## 1. Design principles
1. **The desk, not the dashboard.** EMMA is a colleague who leaves work on your desk. The home screen is a place to brief and decide, not a wall of charts.
2. **Decisions are physical.** Approving is a stamp, rescheduling is moving a sticky note, a lead is a ticket you move along. Every key action has a tactile metaphor and a plain-button equivalent.
3. **Clay means EMMA.** Users should always be able to tell at a glance what EMMA made versus what they made.
4. **One bold moment per screen.** Paper and ink everywhere; colour where it carries meaning.
5. **Calm by default, alive on action.** Nothing moves unless something happened.
6. **No clutter.** Headings say what the page is. No explanatory subheaders. One line of help maximum, only where people get stuck.

## 2. Tokens

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

## 3. Layout

### Web app shell
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

### Breakpoints
360 (min supported) · 768 (tablet: tab bar off, sidebar icons) · 1024 (sidebar full) · 1440 (wide: Desk shows "On your desk" as a right column).

## 4. Components

Each component lists its states. All interactive elements have hover, focus-visible, active, disabled and (where it applies) loading states.

### Buttons
| Variant | Look | Use |
|---|---|---|
| Primary | Ink fill, paper text, r-md, 44px tall | The main action on a screen (one per view) |
| EMMA | Clay fill, white text, small stamp glyph at left | Send a brief, Sawa, any "ask EMMA" action |
| Secondary | Card fill, 1px line-strong border, ink text | Other actions |
| Quiet | Text only, indigo, underline on hover | Tertiary links in context |
| Danger | Card fill, risk border and text; fills risk on confirm step | Delete |

Press: translateY(1px) and shadow drops. Loading: label stays, a 3-dot ink "typing" mark replaces the icon. Never a spinner over the label.

### The Stamp button (Sawa / Bado)
- Rest: round 56px button with the stamp outline in Clay (Sawa) or Ink 2 (Bado), label beneath: **Sawa** / **Bado**. Accessible names: "Sawa, approve" / "Bado, send back".
- On press (Sawa): the stamp scales from 1.6 → 1.0 with `--ease-stamp` over 260ms, lands on the brief card at a random −8° to −12°, a 2px "ink spread" blur fades over 300ms, the card then lifts and files away to its destination (planner, tickets) over `--t-slow`. Haptic `success` on mobile.
- On press (Bado): the Bado stamp lands lighter (70% opacity), the card slides 24px down and fades to a "Sent back" stub that can be restored for 10 seconds.
- Keyboard: `S` = Sawa, `B` = Bado, `E` = Edit when a card has focus. Announced via a polite live region: "Approved. 9 posts added to your planner."
- Reduced motion: no scale or fly; the stamp simply appears and the card fades.

### Brief card (proposal)
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

### Brief pad (composer)
- Ruled lines every 28px (`repeating-linear-gradient` of `--line`), a 1px Clay margin line 44px from the left, placeholder in serif italic: *Dear EMMA, plan my week around the new menu…*
- Quick briefs sit above it as file tabs: Plan my week · Follow up leads · Write a post · Plan a campaign · Draft a sequence · How did last month go · Find prospects (Pro/Max shows a small indigo dot).
- Send button: EMMA variant, "Send to EMMA". Enter sends, Shift+Enter new line. Character count appears after 3,500 of 4,000.
- While EMMA works, the pad dims to 60% and shows the live status line.

### EMMA's margin note (assistant message)
- Serif italic 19px, ink, on paper (no bubble), with a 2px Clay rule on the left and the small stamp avatar at the top of the rule.
- Status lines (mono 12.5px, muted) with a slow pulse dot in Clay: "Reading your calendar", "Searching the web (2 of 5)".
- Sources as small cards: favicon, site name, title; open in a new tab; always passed through `safeHref`.
- User briefs appear as typed text on the pad's log: UI font 15px, ink, right-aligned, no bubble, with time in mono.

### Sticky note (planner entry)
- 4px radius square-ish card tinted by platform with low-saturation washes (Instagram clay-wash, WhatsApp ok at 10%, Facebook indigo-wash, TikTok ink at 6%, LinkedIn indigo at 12%), label always written (platform name), never colour alone.
- Status shown as a tiny stamp-like chip: Idea · Drafting · In review · Scheduled · Published (Published gets the ok colour and a check).
- Drag: lifts with `--shadow-lift`, tilts 2°, drop target day highlights with a saffron-wash fill.

### Masking-tape week header
- A 28px translucent saffron-wash strip, rotated −1°, ends cut with a zigzag mask; text in UI 600 13px: "Week of 20 Oct".

### Kanga banner (key date)
- A full-width strip across the day cell(s): 4px kanga triangle border top and bottom (ink/saffron/clay), label in UI 600 12px: "Mashujaa Day". Multi-day dates span cells.

### Ticket (lead)
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

### Ledger numbers
- Big numbers in Instrument Serif 40px, tabular; label above in micro label; change vs last month as a word and arrow-free sign: "+12 on September" in ok or risk.
- Totals sit on a double rule (`border-bottom: 3px double var(--line-strong)`).
- One sentence at the top in serif 24px, written from data: "*14 new enquiries this month, 5 of them from WhatsApp. Three are waiting for a reply.*"

### Other components
Chip · Input / Select / Textarea (card fill, line-strong border, 44px, label above) · Tabs (underline style, saffron 3px active) · Sheet (right side, 480px, card fill, slides 24px with fade) · Modal (centred, 520px) · Toast (bottom centre, ink fill, paper text, one action link in saffron) · Command palette (⌘K, card fill, serif placeholder *What do you need?*) · Meter (ink track at 12%, ink fill; at 80% warn; at 100% risk, with words) · Upgrade sheet · Account menu · Empty state · Table (ruled rows, no zebra, mono numbers right-aligned).

## 5. Loading
- Skeletons shaped like the final layout, in `--card-2` with a slow left-to-right shimmer of `--line` (1.4s). For the Desk: three blank brief cards with folded corners.
- EMMA working: the status line plus the pad dimmed; never a blank wait. First text within 3 seconds or the status line says what she's doing.
- Spinners only inside small controls (and as the 3-dot ink mark in buttons).

## 6. Empty states
One serif line, one action, and (only here) the kanga band at 40% opacity above the line.
| Screen | Line | Action |
|---|---|---|
| Desk, no cards | *Nothing on your desk. What should we work on?* | Focus the pad |
| Wall Planner | *Nothing planned yet.* | Plan with EMMA |
| Tickets | *No tickets yet. Every enquiry belongs here.* | Add a ticket · Find prospects |
| Shelf | *Nothing on the shelf yet.* | Write a post with EMMA |
| Campaigns | *No campaigns yet.* | Plan a campaign with EMMA |

## 7. Motion
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

## 8. Accessibility (WCAG 2.2 AA, non-negotiable)
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

## 9. Mobile (Expo)
- Same tokens via `theme.ts`; system fonts fall back if the custom fonts aren't loaded yet (load with `expo-font` before hiding the splash).
- Tab bar: Desk · Planner · Tickets · Me. Active icon filled, saffron 3px bar above it.
- Desk cards are full-width; **swipe right = Sawa** (stamp lands at 40% of the swipe, haptic success), **swipe left = Bado** (light haptic); buttons are always present for people who don't swipe.
- Pull to refresh on lists, skeletons on first load, offline banner in warn when the network drops.

## 10. Quality bar (check before shipping a screen)
1. Does the screen have exactly one primary action?
2. Can you tell what EMMA made (Clay) from what the user made?
3. Is there any explanatory subheader? Remove it.
4. Does every drag have a button path, every icon a label, every status a word?
5. Does it work at 360px, at 200% zoom, with a keyboard only, and in Usiku?
6. Is there a skeleton for every async view and a one-line empty state?
