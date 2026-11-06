// POST /api/jury — put a pitch on trial.
// Nine jurors deliberate in parallel and in isolation (no juror sees another's
// vote), each returning a structured verdict. A foreperson then reads all nine,
// names the objections that matter and rewrites the pitch. Verdicts stream
// back as NDJSON the moment each juror finishes.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { JURORS, emptyUsage, type Juror } from "@/lib/jury";
import { PLANS, type Plan } from "@/lib/plans";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, readJson } from "@/lib/server/http";
import { acquireRun, quotaRefusal, recordUsage, releaseRun, resolvePlan, usageThisMonth } from "@/lib/server/quota";
import type { JurorVerdict, JuryEvent, UsageTotals } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
type Effort = (typeof EFFORTS)[number];
const effort = (): Effort => {
  const e = (process.env.EMMA_JURY_EFFORT ?? process.env.EMMA_EFFORT) as Effort | undefined;
  return e && EFFORTS.includes(e) ? e : "medium";
};

const Verdict = z.object({
  verdict: z.enum(["not_guilty", "guilty"]),
  headline: z.string().describe("Your verdict in one sentence, first person, in your own voice. Under 15 words."),
  reasoning: z.string().describe("Two to four sentences: why, from your seat only."),
  fix: z.string().describe("The single most important change that would win (or keep) your vote. Concrete."),
  confidence: z.enum(["low", "medium", "high"]),
});

const Foreperson = z.object({
  summary: z.string().describe("The verdict and the reason in two sentences, e.g. 'Guilty, 7–2. ...'"),
  objections: z.array(z.string()).describe("The three objections that matter most, most important first. If acquitted, the conditions the verdict depends on."),
  revised_pitch: z.string().describe("The pitch rewritten to answer the objections. Same rough length. If acquitted 9-0, return the pitch unchanged."),
  changes: z.array(z.string()).describe("What you changed and why, one line each. Empty if unchanged."),
});

// Pass the JSON schema straight through so the API enforces it (enums
// included), then validate again with zod on our side.
function jsonFormat(schema: z.ZodType) {
  const s = z.toJSONSchema(schema) as Record<string, unknown>;
  delete s.$schema;
  return { type: "json_schema" as const, schema: s };
}

function readStructured<T>(msg: Anthropic.Beta.BetaMessage, schema: z.ZodType<T>): T | null {
  if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") return null;
  const text = msg.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
  if (!text) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

const JURY_RULES = `You are a juror on a pitch jury. Someone will pitch once; you judge it from one seat only and vote.

- "not_guilty" means the pitch survives your seat: from where you sit, it works. "guilty" means it doesn't yet.
- Be honest and tough, not polite. Vote guilty unless the pitch earns your vote. Don't hedge into a neutral answer.
- Judge only what is in the pitch and the context given. Don't invent facts about the market, competitors' prices or the law; if you'd need evidence, say what evidence.
- Keep the fix concrete: something the pitcher could change in the pitch or the offer this week.
- Plain language. No jargon, no emoji.`;

const FOREPERSON_RULES = `You are the foreperson of a nine-member pitch jury. You've received each juror's independent verdict.

Your job: state the verdict, name the objections that matter most, and rewrite the pitch so it would win over the holdouts.

Rewrite rules:
- Never invent facts: no made-up customers, traction, statistics, features, prices or certifications. If the pitch needs a fact you don't have, write a placeholder in [square brackets] for the pitcher to fill.
- Don't overclaim to win a vote. If a juror says a promise can't be delivered, remove or soften the promise.
- Keep what jurors already liked. Keep roughly the same length; shorter is fine.
- If all nine voted not guilty, keep the pitch unchanged, return no changes, and list as objections the conditions jurors attached to their votes.`;

function caseText(c: { title: string; kind: string; context: string }, r: { pitch: string; audience: string; price: string }) {
  return `Case: ${c.title} (${c.kind})
Who is pitching, where, and under which rules: ${c.context || "Not stated"}
Target audience: ${r.audience || "Not stated"}
Price: ${r.price || "Not stated"}

The pitch:
"""
${r.pitch}
"""`;
}

function addUsage(total: UsageTotals, u: Anthropic.Beta.BetaUsage | undefined) {
  if (!u) return;
  total.input += u.input_tokens ?? 0;
  total.output += u.output_tokens ?? 0;
  total.cacheRead += u.cache_read_input_tokens ?? 0;
  total.cacheWrite += u.cache_creation_input_tokens ?? 0;
  total.searches += u.server_tool_use?.web_search_requests ?? 0;
  total.requests += 1;
}

const Body = z.object({
  case: z.object({ title: z.string().max(200), kind: z.string().max(60), context: z.string().max(1500) }),
  round: z.object({ pitch: z.string().trim().min(1).max(4000), audience: z.string().max(500), price: z.string().max(200) }),
});

function settings(model: Plan["model"]) {
  const base = { model, thinking: { type: "adaptive" as const } };
  return model === "claude-haiku-5-5" ? base : { ...base, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return fail(503, "The jury can't sit yet: the server needs an Anthropic API key.");

  // Who's asking, and are they allowed? (Staff and Max only, within quota.)
  let model: Plan["model"] = PLANS.max.model;
  let meter: null | { userId: string; runId: string } = null;
  if (CLOUD) {
    const user = await requireUser(req);
    if (isResponse(user)) return user;
    const admin = supabaseAdmin();
    const state = await resolvePlan(admin, user.id);
    const refusal = quotaRefusal(state, await usageThisMonth(admin, user.id), "jury");
    if (refusal) return fail(402, refusal, { upgrade: state.plan.id !== "max" });
    const runId = await acquireRun(admin, user.id, "jury");
    if (!runId) return fail(429, "Something is already running for you. Give it a moment.");
    model = state.plan.model;
    meter = { userId: user.id, runId };
  } else if (process.env.NODE_ENV === "production") {
    return fail(503, "Accounts aren't set up on this server yet.");
  }

  const raw = await readJson(req, 16_000);
  if (isResponse(raw)) { if (meter) await releaseRun(supabaseAdmin(), meter.runId); return raw; }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) { if (meter) await releaseRun(supabaseAdmin(), meter.runId); return fail(400, "Write a pitch (up to 4,000 characters)."); }
  const body = parsed.data;

  const client = new Anthropic();
  const text = caseText(body.case, body.round);
  const usage = emptyUsage();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (ev: JuryEvent) => { try { controller.enqueue(enc.encode(JSON.stringify(ev) + "\n")); } catch { /* client gone */ } };
      let completed = false;

      const judge = async (j: Juror): Promise<JurorVerdict> => {
        try {
          const msg = await client.beta.messages.create(
            {
              ...settings(model),
              max_tokens: 8000,
              output_config: { effort: effort(), format: jsonFormat(Verdict) },
              system: `${JURY_RULES}

Your seat: ${j.name}. A not-guilty vote from you means: ${j.pass}.
${j.lens}`,
              messages: [{ role: "user", content: text }],
            },
            { signal: req.signal },
          );
          addUsage(usage, msg.usage);
          const v = readStructured(msg, Verdict);
          if (!v) throw new Error("no verdict");
          return { role: j.role, ...v };
        } catch (err) {
          return { role: j.role, verdict: "guilty", headline: "", reasoning: "", fix: "", confidence: "low", error: describe(err) };
        }
      };

      try {
        // Each verdict streams out as soon as that juror is done.
        const verdicts = await Promise.all(JURORS.map((j) => judge(j).then((v) => { emit({ type: "juror", verdict: v }); return v; })));
        const counted = verdicts.filter((v) => !v.error);
        if (counted.length >= 5) {
          const transcript = counted
            .map((v) => {
              const j = JURORS.find((x) => x.role === v.role)!;
              return `${j.name} (not guilty = ${j.pass}): ${v.verdict === "not_guilty" ? "NOT GUILTY" : "GUILTY"}, ${v.confidence} confidence.
"${v.headline}" ${v.reasoning}
Would flip if: ${v.fix}`;
            })
            .join("\n\n");
          const fp = await client.beta.messages.create(
            {
              ...settings(model),
              max_tokens: 12000,
              output_config: { effort: effort(), format: jsonFormat(Foreperson) },
              system: FOREPERSON_RULES,
              messages: [{ role: "user", content: `${text}

The verdicts (${counted.filter((v) => v.verdict === "not_guilty").length} of ${counted.length} not guilty):

${transcript}` }],
            },
            { signal: req.signal },
          );
          addUsage(usage, fp.usage);
          const f = readStructured(fp, Foreperson);
          if (f) emit({ type: "foreperson", summary: f.summary, objections: f.objections, revisedPitch: f.revised_pitch, changes: f.changes });
          completed = true;
        } else {
          emit({ type: "error", message: "Too few jurors returned a verdict to sum up. This trial wasn't counted. Try again." });
        }
        emit({ type: "usage", usage });
        emit({ type: "done" });
      } catch (err) {
        emit({ type: "usage", usage });
        emit({ type: "error", message: describe(err) });
      } finally {
        if (meter) {
          const admin = supabaseAdmin();
          await recordUsage(admin, { userId: meter.userId, workspaceId: null, kind: "jury", model, completed, tokens: usage });
          await releaseRun(admin, meter.runId);
        }
        try { controller.close(); } catch { /* closed */ }
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}

function describe(err: unknown): string {
  if (err instanceof Anthropic.RateLimitError) return "Busy right now. Give it a minute.";
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the AI service.";
  if (err instanceof Error && err.name === "AbortError") return "Stopped.";
  console.error("[emma] jury error", err instanceof Error ? `${err.name}: ${err.message}` : err);
  return "This juror couldn't return a verdict.";
}
