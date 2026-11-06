// POST /api/workspaces { name, data? } — create a workspace within the plan's
// allowance. Clients can't insert workspaces directly (no INSERT grant), so the
// plan limit can't be bypassed.

import { z } from "zod";
import { blankWorkspace } from "@/lib/seed";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, json, readJson } from "@/lib/server/http";
import { resolvePlan } from "@/lib/server/quota";
import type { Workspace } from "@/lib/types";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(1).max(120),
  profile: z.object({
    tagline: z.string().max(200).optional(),
    industry: z.string().max(200).optional(),
    location: z.string().max(120).optional(),
    website: z.string().max(200).optional(),
    sectors: z.array(z.string().max(80)).max(12).optional(),
    voice: z.string().max(1000).optional(),
  }).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const raw = await readJson(req, 8_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Give the workspace a name (up to 120 characters).");

  const admin = supabaseAdmin();
  const state = await resolvePlan(admin, user.id);
  const { count } = await admin.from("workspaces").select("id", { count: "exact", head: true }).eq("owner_id", user.id);
  if ((count ?? 0) >= state.plan.workspaces) {
    return fail(402, `${state.plan.name} includes ${state.plan.workspaces} workspace${state.plan.workspaces === 1 ? "" : "s"}. Upgrade to add more brands.`, { upgrade: true });
  }

  const ws: Workspace = blankWorkspace(body.data.name);
  const pr = body.data.profile;
  if (pr) {
    ws.profile = {
      ...ws.profile,
      tagline: pr.tagline ?? "", industry: pr.industry ?? "", location: pr.location ?? ws.profile.location, website: pr.website ?? "",
      sectors: pr.sectors ?? [], brand: { ...ws.profile.brand, voice: pr.voice ?? "" },
    };
  }

  const { data: created, error } = await admin.from("workspaces").insert({ owner_id: user.id, name: body.data.name, data: ws }).select("id,name,version").single();
  if (error || !created) return fail(500, "Couldn't create the workspace.");
  const { error: mErr } = await admin.from("workspace_members").insert({ workspace_id: created.id, user_id: user.id, role: "owner" });
  if (mErr) {
    await admin.from("workspaces").delete().eq("id", created.id);
    return fail(500, "Couldn't create the workspace.");
  }
  return json(201, { id: created.id, name: created.name, version: created.version, data: ws });
}
