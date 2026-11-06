# 09 · Data Schema

**EMMA Build Pack v2.0 · 2026-10-15**

Two layers: **Postgres tables** (trusted data, server-written, RLS everywhere) and the **workspace document** (`workspaces.data`, one JSON document per business, edited by members). Source files: `supabase/migrations/20261009120000_init.sql` (the timestamped name is required by the Supabase CLI) and `src/lib/types.ts`.

## 1. Entity map
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

## 2. Tables

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid PK → auth.users | cascade delete |
| full_name | text ≤ 120 | user-editable |
| is_staff | boolean | **server-only**; unlocks Max limits + Pitch Jury |
| onboarded | boolean | user-editable |
| created_at | timestamptz | |

### workspaces
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid → auth.users | never client-writable |
| name | text 1–120 | |
| data | jsonb | the Workspace document; `pg_column_size < 4 MB` |
| version | int > 0 | optimistic concurrency |
| created_at, updated_at | timestamptz | |

### workspace_members
`(workspace_id, user_id)` PK, `role ∈ owner | editor | viewer`. Written by the server only (creation route; invites in v1.1).

### subscriptions
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

### usage_events
One row per AI request: user, workspace, `kind ∈ brief | jury`, model, `completed`, input/output/cache read/cache write tokens, searches, `cost_usd numeric(12,6)`, created_at. Index `(user_id, created_at desc)`. Users can read their own; only the server writes.

### ai_runs
The one-at-a-time lock: `user_id`, `kind`, `started_at`, `finished_at`. Unique partial index `(user_id) where finished_at is null`. No client access.

### conversations
`workspace_id`, `user_id`, `title ≤ 200`, `display jsonb` (rendered transcript: text, statuses, sources, proposal ids), timestamps. Members read; server writes.

### messages
Raw model history: `conversation_id`, `seq` (unique per conversation), `role ∈ user | assistant`, `content jsonb`. **Append-only, no client access at all** (no RLS policy on purpose).

### proposals
`workspace_id`, `conversation_id`, `kind ∈ calendar | campaign | leads | email | tasks | asset`, `title`, `summary`, `review_note`, `items jsonb`, `status ∈ pending | approved | discarded`, `decided_by`, `decided_at`. Members read; server writes.

### mpesa_payments
`checkout_request_id` PK, `merchant_request_id`, `user_id`, `plan ∈ pro | max`, `amount > 0`, `phone`, `status ∈ pending | paid | failed | cancelled`, `receipt unique`, `result_desc`, timestamps. User reads own; server writes.

## 3. Security definer helpers (schema `private`, not exposed to the API)
- `private.member_role(ws)` → role or null for `auth.uid()`.
- `private.is_member(ws)` → boolean.
- `private.can_edit(ws)` → owner or editor.
- `private.handle_new_user()` trigger on `auth.users` insert: creates the profile and a Free subscription.

All use `set search_path = ''` and check `auth.uid()` themselves.

## 4. RLS and grants summary

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

## 5. The workspace document (`workspaces.data`)

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

### ClientProfile
`name, tagline, industry, location, currency ("KES"), website, demo, sectors[], offerings[] (Stall), partners[], keyDates[], brand { voice, pillars[], doSay[], dontSay[], palette }, compliance { regime, regulator, notes }`.

- **Offering:** id, name, kind, price, description, customers, rating 0–5, repeatRate 0–1, revenue.
- **Partner:** id, name, sector, contact, email, phone, social, website, relationship.
- **KeyDate:** id, name, date (ISO), kind ∈ launch | event | season | holiday | deadline, note.
- **Palette (Sokoni change):** v1 stored `{ primary, accent, aiFrom, aiTo }` for B-18. v2 stores `{ link, accent }`. `link` replaces Indigo for links and selection, `accent` tints client content badges. Both are validated against the brand-safe range (contrast ≥ 4.5:1 on Paper and Night). Clay, Saffron and status colours can't be changed. **Migration:** on load, map `primary → link`, drop `aiFrom/aiTo`, keep `accent` if it passes contrast, otherwise fall back to the default.

### CalendarEntry (the dossier)
id, date, sector, contentType, platform (LinkedIn, Instagram, Facebook, TikTok, X, WhatsApp, Email, Blog, YouTube, Google Business), angle, featuredBusiness, website, keyContact, email, phone, socialHandle, linkedOffering, objective, kpi, audienceSegment, contentMix, bestPractice, themePillar, owner, draftDue, reviewDate, publishDate, assetLink, repurposingPlan, campaign, status (idea → drafting → in review → scheduled → published), copy?.

### Campaign
id, name, platform (LinkedIn, Meta, Google, Display, TikTok), status (draft, active, paused, ended), objective, audience, offering, budget, spent, impressions, clicks, conversions, revenue, startDate, endDate, headline?, body?. Derived (never stored): CTR = clicks/impressions, CPC = spent/clicks, ROAS = revenue/spent.

### Lead (Ticket)
id, name, company, role, email, phone, social, source, sourceUrl?, stage (new, contacted, qualified, proposal, won, lost; shown as New, Talking, Serious, Quote sent, Won, Lost), score 0–100 (hot ≥ 75, warm ≥ 50, else cold), value, lastTouch, notes, verified, consent.
Derived: weighted forecast = Σ open value × weight (new .05, contacted .15, qualified .35, proposal .6). Who to call today = open, lastTouch ≥ 3 days ago, sorted by score × value.

### EmailItem
id, name, kind (broadcast, automation), status (draft, scheduled, sent, running, paused), audience, subject, body, steps[{ delayDays, subject, body }], scheduledFor, sent, opens, clicks.

### Asset (Shelf)
id, title, type (image, video, document, presentation, design, copy, template), tags[], updated, downloads, owner, body?, platform?.

### Task · Activity · ComplianceCheck · MonthPoint
- Task: id, title, due, owner, done, area.
- Activity: id, at, text, by (emma, team).
- ComplianceCheck: id, area, item, status (ok, attention, risk), note.
- MonthPoint: month (YYYY-MM), spend, revenue, leads.

### JuryCase
id, title, kind, context, createdAt, example?, rounds[{ id, at, pitch, audience, price, verdicts[{ role, verdict (not_guilty, guilty), headline, reasoning, fix, confidence, error? }], summary?, objections?, revisedPitch?, changes? }]. Roles: customer, skeptic, engineer, lawyer, competitor, investor, marketer, partner, cfo.

## 6. Proposal items by kind
| kind | items are | Applied to |
|---|---|---|
| calendar | CalendarEntry (without id/status; status starts "idea") | `calendar` |
| campaign | Campaign (status "draft", figures 0) | `campaigns` |
| leads | Lead (stage "new", verified false, consent false) | `leads`, capped by plan |
| email | EmailItem (status "draft") | `emails` |
| tasks | Task (done false) | `tasks` |
| asset | Asset (type "copy") | `library` |

Every approval also appends an Activity (`by: "emma"`, "Approved: <title>").

## 7. Validation and limits
- Every field from a model tool or a request body is parsed with zod before use (`src/lib/agent/tools.ts`, `src/lib/importWorkspace.ts`).
- Import: JSON only, ≤ 3 MB, validated against the Workspace schema.
- Lead caps: Free 50, Pro 1,000, Max unlimited.
- Text caps: brief ≤ 4,000 chars; names ≤ 120; titles ≤ 200.

## 8. Future migrations (not in v1)
1. `leads` table (when a workspace passes ~5,000 leads or team editing grows), with RLS like proposals.
2. `invites` table for Max seats (v1.1).
3. `push_tokens` table for mobile notifications (v1.1).
4. `iap_receipts` for App Store / Play purchases via RevenueCat (v1.1).

Each is a new file in `supabase/migrations/` (never edit an applied migration), with RLS on, explicit grants and `with check` on updates.
