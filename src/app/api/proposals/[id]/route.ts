// POST /api/proposals/:id { action: "approve" | "discard" }
// Approving applies the proposal to the workspace server-side, with a version
// check, so web and mobile behave the same and plan limits are enforced.

import { z } from "zod";
import { KIND_LABEL, applyProposal } from "@/lib/proposals";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, json, readJson } from "@/lib/server/http";
import { resolvePlan } from "@/lib/server/quota";
import { loadWorkspace } from "@/lib/server/workspace";
import type { ProposalKind, Workspace } from "@/lib/types";

export const runtime = "nodejs";

const Body = z.object({ action: z.enum(["approve", "discard"]) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return fail(404, "Proposal not found.");
  const raw = await readJson(req, 1_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Bad request.");

  const admin = supabaseAdmin();
  const { data: p } = await admin.from("proposals").select("id,workspace_id,kind,title,items,status").eq("id", id).maybeSingle();
  if (!p) return fail(404, "Proposal not found.");
  const ws0 = await loadWorkspace(user.db, user.id, p.workspace_id);
  if (!ws0) return fail(404, "Proposal not found.");
  if (ws0.role === "viewer") return fail(403, "Viewers can't approve proposals.");
  if (p.status !== "pending") return fail(409, `This proposal was already ${p.status}.`);

  if (body.data.action === "discard") {
    await admin.from("proposals").update({ status: "discarded", decided_by: user.id, decided_at: new Date().toISOString() }).eq("id", id).eq("status", "pending");
    return json(200, { status: "discarded" });
  }

  // Lead cap follows the workspace owner's plan.
  const ownerPlan = await resolvePlan(admin, ws0.ownerId);
  for (let attempt = 0; attempt < 3; attempt++) {
    const ws = attempt === 0 ? ws0 : await loadWorkspace(user.db, user.id, p.workspace_id);
    if (!ws) return fail(404, "Workspace not found.");
    const result = applyProposal(ws.data as Workspace, p.kind as ProposalKind, p.items as unknown[], ownerPlan.plan.leads);
    const activity = {
      id: crypto.randomUUID(), at: new Date().toISOString(), by: "team" as const,
      text: `Approved: ${p.title} (${result.added} ${KIND_LABEL[p.kind as ProposalKind]})${result.skipped ? `; ${result.skipped} skipped at the plan's lead limit` : ""}.`,
    };
    const next = { ...result.ws, activity: [activity, ...(result.ws.activity ?? [])].slice(0, 60) };
    const { data: saved } = await user.db
      .from("workspaces")
      .update({ data: next, version: ws.version + 1, updated_at: new Date().toISOString() })
      .eq("id", ws.id).eq("version", ws.version)
      .select("version").maybeSingle();
    if (!saved) continue; // someone saved in between: reload and retry
    await admin.from("proposals").update({ status: "approved", decided_by: user.id, decided_at: new Date().toISOString() }).eq("id", id).eq("status", "pending");
    return json(200, { status: "approved", added: result.added, skipped: result.skipped, version: saved.version, data: next });
  }
  return fail(409, "The workspace kept changing. Try approving again.");
}
