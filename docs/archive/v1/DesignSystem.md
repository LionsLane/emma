# EMMA: Design System (spec sheet)

Every visual decision in one place. Tokens live in `src/app/globals.css`; nothing in a component hardcodes a colour. Contrast ratios are measured (WCAG 2.2), not eyeballed.

## Personality
B-18: a calm cockpit, not a brochure. Dense but legible, dark by design, glass surfaces with one hairline of light, and a purple→pink gradient that appears **only** when AI is doing the work.

## Colour

### Surfaces and text
| Token | Value | Use | Contrast (on bg / on surface) |
|---|---|---|---|
| `--bg` | `#050914` + radial glows | Page background | — |
| `--surface` | glass `rgba(16,26,52,.58)` ≈ `#111b33` | Cards, panels | — |
| `--surface-solid` | `#0e1630` | Sheets, menus, chart tooltips | — |
| `--text` | `#e8eeff` | Primary text | 17.2 / 14.7 |
| `--text-2` | `#b4c0de` | Secondary text | 10.9 / 9.4 |
| `--muted` | `#8191b8` | Labels, meta | 6.3 / 5.4 |
| `--faint` | `#7a88ad` | Least important text (was `#56648a`, failed at 2.9) | 5.6 / 4.9 |
| `--line` | `rgba(148,170,220,.12)` | Dividers | — |

### Brand (re-skinnable per client)
| Token | Default | Rule |
|---|---|---|
| `--primary` | `#3d7bff` | Fills, focus, active nav. As text use `--primary-text` (`#5b8fff`, 5.6:1). Buttons use `--primary-strong` (darkened, white text ≥ 4.6:1). |
| `--accent` | `#22e6d3` | "Alive / actionable": live dots, focus ring, links in dark sheets. 10.9:1. |
| `--ai-from` → `--ai-to` | `#7c3aed` → `#db2777` | AI actions only (send to EMMA, proposals, AI badges). White text 5.7 / 4.6:1. As text use `--ai-text` `#f472b6`. |

### Semantic colours (never reused for decoration or chart series)
| Meaning | Token | Value | Always paired with |
|---|---|---|---|
| Success / done / approved | `--ok` | `#34d399` | check icon + word |
| Warning / needs attention | `--warn` | `#fbbf24` | triangle icon + word |
| Danger / error / at risk | `--risk` | `#f87171` | triangle or ✕ icon + word |
| Info / neutral highlight | `--info` | `#60a5fa` | info icon + word |

### Data
Two-series charts use `--chart-1` `#3d7bff` and `--chart-2` `#0fa89c` (validated for colour-blind separation on the dark surface). Single-series charts use `--chart-1`. A legend is shown for 2+ series; tooltips on every mark.

## Typography
| Role | Font | Size / weight |
|---|---|---|
| Display (page titles, big numbers) | Unbounded | 24–40px / 500 |
| Headings | Manrope | 15–18px / 700 |
| Body | Manrope | 14.5px / 400–500, line-height 1.55 |
| Small / meta | Manrope | 12–12.5px / 500 |
| Data, numbers, codes | JetBrains Mono | 12–13px / 400–500, tabular figures |

Rules: sentence case everywhere; no all-caps sentences (all-caps only for tiny labels ≤ 3 words); numbers right-aligned in tables.

## Space, shape, depth
- Spacing scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48.
- Radius: 8 (chips, small buttons) · 10 (inputs, buttons) · 12 (tiles) · 16 (cards) · 999 (pills).
- Depth: glass + hairline top highlight + soft shadow. No drop shadows on text.
- Touch targets ≥ 44×44px on touch devices.

## Motion
- Durations: 150ms (hover/press) · 250ms (menus, toasts) · 400ms (page and sheet entrances). Easing `cubic-bezier(.22,1,.36,1)`.
- Things fade and rise; nothing bounces or spins for attention. The orb breathes; it speeds up while EMMA works.
- `prefers-reduced-motion`: all animation off.

## Components
Button (primary · AI · ghost · danger · sizes sm/md) · Chip (neutral · semantic · AI) · Card/Panel · Stat tile (+ sparkline) · Meter · Input · Select · Textarea · Tabs · Sheet (side drawer) · Modal · Toast · **Skeleton** · Command palette (⌘K / Ctrl K) · Proposal card · Kanban column + card · Calendar day cell · Empty state (one line + one action) · Upgrade sheet · Usage meter · Avatar menu.

## Loading
Every data view has a **skeleton** shaped like its final layout (stat tiles, table rows, cards). Spinners only inside buttons. Streaming text shows a live status line, never a blank wait.

## Copy rules
- A heading says what the page is. **No explanatory sub-heading** unless it carries information the user needs right now (a count, a status, a deadline).
- Labels over explanations. One line of help text maximum, only where people get stuck.
- Empty states: one sentence + one action.
- Plain, warm, specific. No hype, no emoji, no "simply".

## Accessibility (WCAG 2.2 AA)
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI boundaries); measured values above.
- Everything reachable and operable by keyboard; visible focus ring (`--accent`, 2px).
- Status never by colour alone (icon + word).
- Every input has a label; every icon-only button has an `aria-label`; images have alt text.
- Live regions for streaming replies and toasts; dialogs trap focus and close on Escape.
- Respect reduced motion; text resizes to 200% without loss.
