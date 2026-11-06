# CLAUDE.md

@AGENTS.md

## Remember
- EMMA is LionsLane's product: AI marketing agent for small businesses in Kenya first. Pricing: Free / Pro KES 500 / Max KES 1,500 (Haiku 5.5 / Sonnet 5.5 / Opus 5.5).
- Own visual identity: **Sokoni** (docs/05BrandGuidelines.md), which replaces B-18. Light-first paper and ink with a Usiku night theme, Clay #A63D24 reserved for EMMA, Saffron highlights, Indigo links. Fonts: Instrument Serif, Bricolage Grotesque, IBM Plex Mono. Sawa/Bado approval stamps. "by LionsLane" endorsement only. The code still runs B-18 until phase 6 in docs/16ImplementationPlan.md.
- The build pack is `docs/00Readme.md` to `docs/17AgentRules.md`, combined in `docs/EmmaComplete.md`. The v1 docs are in `docs/archive/v1/`.
- The demo workspace (Jua Coffee Co.) is fictional; contacts use example.com and +254 700 000 xxx.
- Deliverable filenames: no hyphens or underscores (code paths that a tool requires are the exception).
- The Pitch Jury is for LionsLane's own checks (staff) and Max users.

## Commands
| Task | Command |
|---|---|
| Dev server (web) | `npm run dev` → http://localhost:5180 |
| Typecheck | `npm run typecheck` |
| Production build | `npm run build` |
| Mobile (web preview) | `cd mobile && npx expo start --web` |
| Mobile (phone) | `cd mobile && npx expo start` then scan the QR in Expo Go |

## Conventions
- Paths alias `@/` → `src/`.
- Route handlers stream NDJSON (one JSON event per line).
- Server helpers in `src/lib/server/`, Supabase clients in `src/lib/supabase/`.
- Keep components small; surfaces live in `src/app/app/<surface>/page.tsx`.
