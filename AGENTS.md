# AGENTS.md: how to work on EMMA

For any AI coding agent (Claude Code, Cursor, Codex) working in this repo. The full rules are in [docs/17AgentRules.md](docs/17AgentRules.md); this is the short version.

## Read first
1. `docs/08TRD.md` → Essentials: the eight rules that must never break.
2. `docs/02PRD.md`: what the feature is for (requirement ids).
3. The doc for the area you touch: 06/07 UI · 09 data · 10 API · 11 AI · 12 billing · 13 security · 14 mobile.

## Plan
- One sentence: the change and the requirement id it serves.
- Name the Essentials rule(s) it touches. Auth, RLS, billing, AI or anything that costs money: list the checks you'll keep (13 §6).
- Smallest change that works. No new dependency without a reason; pin exact versions at least two weeks old.

## Code
- TypeScript strict; zod on every request body and tool input.
- `requireUser(req)` for server code that needs a user; never `user_metadata` for permissions.
- Workspaces through the user's RLS client; secret-key client only for usage, subscriptions, messages, proposals, payments, ai_runs.
- Limits only from `src/lib/plans.ts`. AI only from route handlers; tools propose, never write. History is append-only.
- Untrusted links through `safeHref()`.

## Design (Sokoni, docs/05–07)
- Tokens only, no hex in components. Clay = EMMA only. Saffron never text on Paper. Status = icon + word.
- One primary action per screen, no explanatory subheaders, skeleton for every async view, button path for every drag.
- Check Mchana and Usiku at 360px, keyboard only, reduced motion.

## Test
- `npm run typecheck` and `npm run build` pass; affected screen checked in the browser (`npm run dev`, port 5180); console clean.
- AI without credits: `ANTHROPIC_BASE_URL` → local mock (docs/11 §10). RLS: two-user check. Mobile: `cd mobile && npx expo start --web`.

## Safety
- New migration per DB change; RLS on, explicit grants, `with check`; never edit an applied migration.
- Never commit `.env*` or keys; never log secrets, tokens or full prompts.
- Ask the owner before deploys, pushes, store submissions or sending anything.
- Update the doc that owns a rule when you change it, then regenerate `docs/EmmaComplete.md`.
