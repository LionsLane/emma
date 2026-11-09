// POST /api/search/visibility { name, website, location, queries[] } → VisibilityReport
// Pro and Max: EMMA searches like a customer and reports whether the business is named or cited.
// Metered as kind "visibility" (AI + web search); one AI run at a time per user.
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { describeAgentError } from "@/lib/server/agent";
import { fail, json, readJson } from "@/lib/server/http";
import { acquireRun, quotaRefusal, recordUsage, releaseRun, resolvePlan, usageThisMonth } from "@/lib/server/quota";
import { runVisibility } from "@/lib/server/visibility";

export const runtime = "nodejs";
export const maxDuration = 120;

const Body = z.object({
  name: z.string().trim().min(2).max(120),
  website: z.string().trim().max(300).default(""),
  location: z.string().trim().max(120).default(""),
  queries: z.array(z.string().trim().min(3).max(120)).min(1).max(3),
});

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  if (!process.env.ANTHROPIC_API_KEY) return fail(503, "EMMA's AI isn't connected on this server yet.");
  const raw = await readJson(req, 4_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Add your business name and one to three searches to check.");

  const admin = supabaseAdmin();
  const state = await resolvePlan(admin, user.id);
  const usage = await usageThisMonth(admin, user.id);
  const refusal = quotaRefusal(state, usage, "visibility");
  if (refusal) return fail(402, refusal, { upgrade: state.plan.id !== "max" });
  const searchesLeft = Math.max(0, state.plan.searchesPerMonth - usage.searches);

  const runId = await acquireRun(admin, user.id, "visibility");
  if (!runId) return fail(429, "EMMA is busy with another request, or couldn't start this check. Try again in a minute.");
  const ac = new AbortController();
  req.signal.addEventListener("abort", () => ac.abort());
  try {
    const { report, tokens, completed } = await runVisibility(body.data, state.plan.model, searchesLeft, ac.signal);
    await recordUsage(admin, { userId: user.id, workspaceId: null, kind: "visibility", model: state.plan.model, completed, tokens });
    if (!completed) return fail(502, "The check didn't finish. Nothing was counted against your checks; try again.");
    return json(200, report);
  } catch (err) {
    return fail(502, describeAgentError(err));
  } finally {
    await releaseRun(admin, runId);
  }
}
