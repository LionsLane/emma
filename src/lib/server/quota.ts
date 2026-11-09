import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, costUSD, type Plan, type PlanId, type Tokens } from "@/lib/plans";

// Quota months are calendar months in Africa/Nairobi (UTC+3, no DST).
export function monthStartISO(now = new Date()): string {
  const eat = new Date(now.getTime() + 3 * 3600_000);
  return new Date(Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), 1) - 3 * 3600_000).toISOString();
}

export interface PlanState { plan: Plan; staff: boolean; periodEnd: string | null; provider: string }

export async function resolvePlan(admin: SupabaseClient, userId: string): Promise<PlanState> {
  const [{ data: sub }, { data: prof }] = await Promise.all([
    admin.from("subscriptions").select("plan,status,current_period_end,provider").eq("user_id", userId).maybeSingle(),
    admin.from("profiles").select("is_staff").eq("id", userId).maybeSingle(),
  ]);
  const staff = Boolean(prof?.is_staff);
  const live = sub && ["active", "trialing"].includes(sub.status) && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  const id: PlanId = staff ? "max" : live ? (sub.plan as PlanId) : "free";
  return { plan: PLANS[id], staff, periodEnd: sub?.current_period_end ?? null, provider: sub?.provider ?? "none" };
}

export interface Usage { briefs: number; juries: number; audits: number; visibility: number; searches: number; costUSD: number }
export type MeteredKind = "brief" | "jury" | "audit" | "visibility";

export async function usageThisMonth(admin: SupabaseClient, userId: string): Promise<Usage> {
  const { data } = await admin
    .from("usage_events")
    .select("kind,completed,searches,cost_usd")
    .eq("user_id", userId)
    .gte("created_at", monthStartISO());
  const u: Usage = { briefs: 0, juries: 0, audits: 0, visibility: 0, searches: 0, costUSD: 0 };
  for (const r of data ?? []) {
    if (r.completed && r.kind === "brief") u.briefs += 1;
    if (r.completed && r.kind === "jury") u.juries += 1;
    if (r.completed && r.kind === "audit") u.audits += 1;
    if (r.completed && r.kind === "visibility") u.visibility += 1;
    u.searches += r.searches ?? 0;
    u.costUSD += Number(r.cost_usd ?? 0);
  }
  return u;
}

// Returns a friendly refusal, or null if the request may run.
export function quotaRefusal(state: PlanState, u: Usage, kind: MeteredKind): string | null {
  const p = state.plan;
  const next = p.id === "free" ? "Pro" : p.id === "pro" ? "Max" : null;
  const upsell = next ? ` Upgrade to ${next} for more.` : " It resets on the 1st.";
  if (kind === "audit") return u.audits >= p.auditsPerMonth ? `You've used all ${p.auditsPerMonth} website audits on ${p.name} this month.${upsell}` : null;
  if (u.costUSD >= p.costCapUSD) return `You've reached this month's AI allowance on ${p.name}.${upsell}`;
  if (kind === "visibility") {
    if (p.visibilityPerMonth === 0) return "AI-visibility checks are part of Pro and Max.";
    if (u.visibility >= p.visibilityPerMonth) return `You've used all ${p.visibilityPerMonth} AI-visibility checks on ${p.name} this month.${upsell}`;
    if (u.searches >= p.searchesPerMonth) return `You've used this month's web searches on ${p.name}.${upsell}`;
  }
  if (kind === "brief" && u.briefs >= p.briefsPerMonth) return `You've used all ${p.briefsPerMonth} briefs on ${p.name} this month.${upsell}`;
  if (kind === "jury") {
    if (p.juryPerMonth === 0) return "The Pitch Jury is part of Max.";
    if (u.juries >= p.juryPerMonth) return `You've used all ${p.juryPerMonth} Pitch Jury trials this month.${upsell}`;
  }
  return null;
}

// One AI run in flight per user, enforced by a unique index in the database.
export async function acquireRun(admin: SupabaseClient, userId: string, kind: "brief" | "jury" | "visibility"): Promise<string | null> {
  const stale = new Date(Date.now() - 5 * 60_000).toISOString();
  await admin.from("ai_runs").update({ finished_at: new Date().toISOString() }).eq("user_id", userId).is("finished_at", null).lt("started_at", stale);
  const { data, error } = await admin.from("ai_runs").insert({ user_id: userId, kind }).select("id").single();
  if (error) return null; // unique violation: something is already running
  return data.id as string;
}

export async function releaseRun(admin: SupabaseClient, runId: string) {
  await admin.from("ai_runs").update({ finished_at: new Date().toISOString() }).eq("id", runId);
}

export async function recordUsage(
  admin: SupabaseClient,
  e: { userId: string; workspaceId: string | null; kind: MeteredKind; model: string; completed: boolean; tokens: Tokens },
) {
  const { error } = await admin.from("usage_events").insert({
    user_id: e.userId, workspace_id: e.workspaceId, kind: e.kind, model: e.model, completed: e.completed,
    input_tokens: e.tokens.input, output_tokens: e.tokens.output, cache_read_tokens: e.tokens.cacheRead,
    cache_write_tokens: e.tokens.cacheWrite, searches: e.tokens.searches, cost_usd: costUSD(e.model, e.tokens).toFixed(6),
  });
  if (error) console.error("[emma] usage insert failed", error.message);
}
