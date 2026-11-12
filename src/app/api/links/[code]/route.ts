// PATCH /api/links/<code> { name?, archived? } → { ok }. Editors only (enforced by RLS).
import { z } from "zod";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, json, readJson } from "@/lib/server/http";
import { CODE_RE } from "@/lib/server/links";
import { resolvePlan } from "@/lib/server/quota";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Patch = z.object({ name: z.string().trim().min(1).max(120).optional(), archived: z.boolean().optional() }).refine((b) => b.name !== undefined || b.archived !== undefined);

export async function PATCH(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const { code } = await ctx.params;
  if (!CODE_RE.test(code)) return fail(400, "Bad link.");
  const raw = await readJson(req, 1_000);
  if (isResponse(raw)) return raw;
  const body = Patch.safeParse(raw);
  if (!body.success) return fail(400, "Nothing to change.");
  if (body.data.archived === false) {
    // Switching a link back on counts against the plan's active-link allowance.
    const { data: link } = await user.db.from("smart_links").select("workspace_id").eq("code", code).maybeSingle();
    if (!link) return fail(404, "Link not found.");
    const state = await resolvePlan(supabaseAdmin(), user.id);
    const { count } = await user.db.from("smart_links").select("code", { count: "exact", head: true }).eq("workspace_id", link.workspace_id).eq("archived", false);
    if ((count ?? 0) >= state.plan.smartLinks) return fail(402, `Your ${state.plan.name} plan includes ${state.plan.smartLinks} active links.`, { upgrade: state.plan.id !== "max" });
  }
  const { data, error } = await user.db.from("smart_links").update(body.data).eq("code", code).select("code").maybeSingle();
  if (error || !data) return fail(404, "Link not found, or you can't edit it.");
  return json(200, { ok: true });
}
