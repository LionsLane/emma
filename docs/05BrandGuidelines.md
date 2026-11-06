# 05 · Brand Guidelines: Sokoni

**EMMA Build Pack v2.0 · 2026-10-15 · Replaces the B-18 brand (v1)**

## Why a new brand
B-18 (dark navy, glass panels, a glowing orb, a purple-to-pink gradient) looked like every AI product of 2025–26. Nothing about it said *Kenya*, *small business* or *marketing*. Small-business owners don't want a spaceship; they want a sharp, warm colleague who gets their market.

**Sokoni** means "at the market". The brand borrows from the places Kenyan business actually happens: the market stall, the kanga cloth with its message, the notebook, the rubber stamp, the M-Pesa receipt. It's warm paper and ink by day, deep night by night, with colour used like a market uses it: bold, deliberate, purposeful.

## The idea in one sentence
**Every brief is a message, and every approval is a stamp.**

The kanga cloth always carries a *jina*, a saying printed into the cloth. Marketing is the same: a message worth wearing. EMMA writes your messages; you stamp them **Sawa** ("okay, good") when they're right, or **Bado** ("not yet") when they're not.

## Personality
| EMMA is | EMMA is not |
|---|---|
| A sharp, warm strategist who's been to your shop | A robot, a wizard, a genie |
| Confident and specific | Hype-y, vague, "revolutionary" |
| Local and proud of it | Folkloric or touristy |
| Calm, organised, on top of things | Busy, flashy, noisy |
| Honest about what she doesn't know | Over-promising |

## Logo

### Wordmark
`emma` set in **Instrument Serif Italic**, lowercase, in Ink, followed by a small **Saffron sun** (a filled circle at 30% of the x-height, sitting on the baseline). Below it, optional endorsement in Bricolage Grotesque 600, tracking +8%: `BY LIONSLANE`.

- Minimum size: wordmark 18 px tall on screen.
- Clear space: the height of the "e" on every side.
- Never: outline, gradient, shadow, rotate, recolour the sun, set in another font, or put on busy photos.

### The Stamp (app icon, favicon, approval mark)
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

## Colour

Sokoni is **light-first** ("Mchana", day) with a full dark theme ("Usiku", night). All text colours pass WCAG AA; ratios are measured, not estimated.

### Day (Mchana)
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

### Night (Usiku)
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

### Colour rules
1. **Clay belongs to EMMA.** Anything coloured Clay was made or is being done by EMMA. No other element uses Clay.
2. **Saffron is a highlighter, not a paint.** Under 5% of any screen: the sun, active-tab underline, the kanga band, one key number.
3. **Ink buttons for the main action**, Clay buttons only for "send to EMMA" and Sawa.
4. **Status colours are reserved** and always come with an icon and a word.
5. Agency client palettes may replace **Indigo** (links/selection) and add a client accent for their own content badges. Clay, Saffron and the status colours never change, so EMMA always looks like EMMA.

## Typography
| Role | Font (Google Fonts, OFL) | Use |
|---|---|---|
| Display + EMMA's voice | **Instrument Serif** (regular + italic) | Page hero lines, big numbers in the Ledger, EMMA's margin notes (italic) |
| Interface | **Bricolage Grotesque** (variable, 400–800) | Everything else: navigation, labels, buttons, body |
| Data & receipts | **IBM Plex Mono** (400, 500) | Money, dates in tickets, counters, codes |

Scale (px): Display 56 / 40 / 32 · Serif note 19 (min 17 for italic) · Heading 20 / 17 / 15 · Body 15 (min) · Small 13 · Micro label 11.5 (uppercase only for ≤ 3 words, +6% tracking). Numbers use tabular figures.

## Motifs (use sparingly, each has one job)
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

## Iconography
- 24 px grid, 1.75 px stroke, round caps and joins, slight hand-made softness (no perfect geometry).
- Filled only for the active state of tab-bar icons.
- Icons always paired with a label in navigation; icon-only buttons need an accessible name.

## Imagery
- Real Kenyan businesses: salons, cafés, dukas, workshops, market stalls, hands at work. Licensed or own photography only.
- Warm natural light; never stock "AI robot", circuit brains or neon gradients.
- No fake testimonials, no fake customer logos.

## Voice and tone
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

## Do and don't
| Do | Don't |
|---|---|
| Paper, ink, and one bold colour moment per screen | Gradients, glass, glow, neon |
| Let EMMA's Clay mark tell users what she made | Use Clay for decoration |
| Use the stamp for decisions | Use checkmark confetti |
| Kanga band at moments that matter | Kanga patterns behind text or everywhere |
| Real photos of real businesses | Stock AI imagery |
| Big serif numbers for money | Tiny grey numbers |

## Migrating from B-18
| B-18 | Sokoni |
|---|---|
| Dark-only navy | Light-first Paper + Night theme |
| Glowing orb avatar | The Stamp (`e`) and Clay margin rule |
| Purple→pink AI gradient | Clay, flat |
| Unbounded + Manrope + JetBrains Mono | Instrument Serif + Bricolage Grotesque + IBM Plex Mono |
| Glass cards | Paper cards with a 1 px line and a soft 2-layer shadow |
| Approve / Discard buttons | Sawa / Bado stamps |
