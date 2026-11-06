# 11 · The AI Agent

**EMMA Build Pack v2.0 · 2026-10-15**

How EMMA thinks, what she can touch, what she costs, and how she stays safe. Code: `src/lib/agent/prompt.ts`, `src/lib/agent/tools.ts`, `src/lib/server/agent.ts`, `src/app/api/emma/route.ts`, `src/app/api/jury/route.ts`.

## 1. Models by plan
| Plan | Model | Web search | Server-side fallback |
|---|---|---|---|
| Free | `claude-haiku-5-5` | No | No (not supported on Haiku) |
| Pro | `claude-sonnet-5-5` | Yes, up to 15/month | Yes (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) |
| Max / staff | `claude-opus-5-5` | Yes, up to 40/month | Yes |

Call settings (`modelSettings`): `client.beta.messages.stream`, adaptive thinking, `output_config.effort = "medium"`, `max_tokens 32000`, up to **14 tool steps** per brief, `maxDuration = 300` on the route.

## 2. The system prompt
Two blocks, in this order, both cached (`cache_control: ephemeral`):
1. **PERSONA** (byte-identical across all requests so it caches): who EMMA is, how she works, her 10-rule contract, rules for leads and personal data, formatting.
2. **Client context** (`clientContext(profile, today)`): today's date and the six inputs (sectors, offerings with ids and prices, partners, key dates, brand voice with do/don't, compliance regime).

### The contract (summary)
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

### Sokoni voice additions (v2.0, add to PERSONA)
- Write replies as short **margin notes** in the first person: "I've planned two weeks around Mashujaa Day. Check the prices on the new menu before you stamp it."
- After proposing, end with one line on what to check, nothing else. The card holds the work.
- Plain Kenyan English, shillings, specific numbers. No hype words (revolutionary, game-changer, magic, supercharge, unleash). No emoji unless the client's voice asks for it.
- Never use the UI words Sawa/Bado in generated client copy; they belong to the interface.

## 3. Tools

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

## 4. The loop (`runAgent`)
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

## 5. Cost control
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

## 6. Safety
| Risk | Control |
|---|---|
| Prompt injection from web pages or imported data | Tools only propose; nothing changes until a person stamps Sawa. Web content can't trigger writes. |
| Fake history / system messages from the client | History lives only on the server (`messages`, no client access). Clients send just the new text. |
| Malicious links | `safeHref()`: http/https only, everything else dropped. |
| Invented contact details | PERSONA rule: only details found in a source, with `sourceUrl`; leads arrive unverified and without consent. |
| Spam / non-consensual messaging | EMMA never adds non-consenting contacts to broadcasts; Draft next touch is one-to-one for them. |
| Claims about prices, dates, health, legal | `review_note` on the card; shown in warn with "Check:". |
| Refusals | Shown as a plain note; not counted as a brief. |

## 7. Structured outputs (Pitch Jury)
Juror and foreperson outputs use a raw JSON schema generated from zod (`jsonFormat()` via `z.toJSONSchema`) and are parsed again with zod (`readStructured()`). The SDK's zod helper was avoided because it moved enums into descriptions.

- **Jurors (9, in parallel, isolated):** customer, skeptic, engineer, lawyer, competitor, investor, marketer, partner, CFO. Each returns `{ verdict: not_guilty | guilty, headline, reasoning, fix, confidence }`.
- **Foreperson:** `{ summary, objections[], revisedPitch, changes[] }`; never invents facts, puts unknowns in [brackets].

## 8. Quick briefs (exact text sent)
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

## 9. Learning from Sawa and Bado (v1.1)
- Record every decision with the proposal kind and, for Bado, an optional one-tap reason (Wrong tone · Wrong timing · Not my offer · Too much · Other).
- Feed the last 10 Bado reasons for the workspace into the client context as "Recently sent back because…". No fine-tuning; it's context, so it stays per business and private.
- Approval rate per kind becomes a success metric (target ≥ 50%).

## 10. Testing the agent without credits
1. Start the mock (`scratchpad/mockanthropic.mjs` or a copy in `scripts/`) on a local port.
2. Set `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>` and any non-empty `ANTHROPIC_API_KEY` in `.env.local`.
3. `npm run dev`, brief EMMA, and confirm: status → text → proposal → usage → done; then stamp Sawa and confirm the planner updated.
4. Negative tests: a `system` role in demo history → 400; `text/plain` body → 415; second brief while one runs → 429.
