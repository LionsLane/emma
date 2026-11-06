# 17 · Agent Rules

**EMMA Build Pack v2.0 · 2026-10-15**

For any AI coding agent (Claude Code, Cursor, Codex) or developer working on EMMA. `AGENTS.md` and `CLAUDE.md` at the repo root point here.

## 1. Read first
1. 08 TRD → "Essentials": the eight rules that must never break.
2. 02 PRD: what the feature is for, by requirement id.
3. The doc for the area you touch: 06/07 (UI), 09 (data), 10 (API), 11 (AI), 12 (billing), 13 (security), 14 (mobile).

## 2. Plan before you code
- State the change in one sentence and the requirement id(s) it serves.
- Name which Essentials rule(s) it touches. If it touches auth, RLS, billing, AI routes or anything that costs money, list the security checks you'll keep (13 §6).
- Prefer the smallest change that works. No new dependency without a written reason; pin exact versions at least two weeks old.

## 3. Code rules
- TypeScript strict. Validate every request body and every model tool input with zod.
- Server code that needs a user: `requireUser(req)` from `src/lib/server/auth.ts`. Never read `user_metadata` for permissions.
- Load workspaces with the user's Supabase client (RLS). The secret-key admin client only for `usage_events`, `subscriptions`, `messages`, `proposals`, `mpesa_payments`, `ai_runs`.
- Plan limits only from `src/lib/plans.ts`.
- AI calls only from route handlers. Tools propose; they never write.
- Conversation history (`messages`) is append-only. Never rewrite earlier turns.
- Links from model or web data go through `safeHref()`.

## 4. Design rules (Sokoni)
- Colours, fonts, radii, shadows and durations only as tokens (06 §2). No hex values in components.
- **Clay is EMMA's colour only.** Saffron never as text on Paper. Status always icon + word.
- One primary action per screen. No explanatory subheaders. Empty state = one serif line + one action.
- Every drag has a button path; every icon-only control has an accessible name; every async view has a skeleton.
- Respect `prefers-reduced-motion` and `forced-colors`. Test in Mchana and Usiku at 360px.
- Copy: plain Kenyan English, specific, no hype words, no emoji. Swahili only for the fixed UI words (Sawa, Bado, Karibu, Asante, Habari) with English accessible names.

## 5. Data and migrations
- New migration file per change (`supabase migration new <name>`); the CLI's timestamped, underscored filename is a tool requirement and the only exception to the no-hyphens/underscores naming rule.
- RLS on, explicit grants, `with check` on update policies, nothing for `anon`. Never edit an applied migration.
- Add RLS tests for every new table (two users, cross-tenant read must fail).

## 6. Secrets and outward actions
- Never commit `.env*` or keys. Never log secrets, tokens, full prompts or personal data.
- Never borrow keys from other projects. Keys go in `.env.local` by the owner.
- Confirm with the owner before any outward action: deploy, GitHub push, store submission, sending email or messages, payments in production.

## 7. Testing
- `npm run typecheck` and `npm run build` pass.
- Run the app (`npm run dev`, port 5180, bound to 127.0.0.1) and check the affected screen in the browser; console clean.
- AI routes without credits: mock via `ANTHROPIC_BASE_URL` (11 §10).
- RLS changes: PGlite suite plus a two-user check.
- Mobile: `cd mobile && npx expo start --web`, then Expo Go on a phone.

## 8. Naming
- Deliverable files (docs, exports, images for people): no hyphens or underscores, e.g. `EmmaComplete.md`, `LeadsBoard.png`.
- Code follows framework conventions (Next.js route folders, Expo Router groups); where a tool forces a name, keep it and note it.
- User-facing surface names: Desk, Wall Planner, Tickets, Campaigns, Email Hub, Shelf, Stall, Ledger, ROI & Compliance, Business Profile, Plan & Billing, Pitch Jury. Routes keep their v1 paths (`/app/calendar`, `/app/leads`…) so links don't break.

## 9. When you change a rule
Update the doc that owns it in the same change: limits → 12 and `plans.ts`; tables → 09; endpoints → 10; tokens → 06; flows → 04; requirements → 02. Then regenerate `docs/EmmaComplete.md` with `python scripts/buildcomplete.py docs`.
