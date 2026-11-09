// GET /api/account     → plan, limits, usage this month, workspaces
// DELETE /api/account  → delete the account (sessions revoked first)

import { PLANS, limitLabel } from "@/lib/plans";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, json } from "@/lib/server/http";
import { resolvePlan, usageThisMonth } from "@/lib/server/quota";
import { mpesaConfigured, mpesaSandbox, practicePaymentsBlocked, stripe, stripePrice, stripeTestMode } from "@/lib/server/billing";
import { paystackConfigured, paystackTestMode } from "@/lib/server/paystack";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const admin = supabaseAdmin();
  const [state, usage, { data: workspaces }, { data: profile }] = await Promise.all([
    resolvePlan(admin, user.id),
    usageThisMonth(admin, user.id),
    user.db.from("workspaces").select("id,name,owner_id,updated_at").order("created_at", { ascending: true }),
    user.db.from("profiles").select("full_name,onboarded,is_staff").eq("id", user.id).maybeSingle(),
  ]);
  const p = state.plan;
  // Which ways to pay are open to this person (test keys: staff only).
  const blocked = practicePaymentsBlocked(state.staff);
  const payments = {
    mpesa: mpesaConfigured() && !(mpesaSandbox() && blocked),
    paystack: paystackConfigured() && !(paystackTestMode() && blocked),
    card: Boolean(stripe() && stripePrice("pro") && stripePrice("max")) && !(stripeTestMode() && blocked),
  };
  return json(200, {
    payments,
    user: { id: user.id, email: user.email, name: profile?.full_name ?? "", onboarded: Boolean(profile?.onboarded), staff: state.staff },
    plan: { id: p.id, name: p.name, priceKES: p.priceKES, model: p.modelLabel, periodEnd: state.periodEnd, provider: state.provider },
    limits: { briefs: p.briefsPerMonth, searches: p.searchesPerMonth, jury: p.juryPerMonth, audits: p.auditsPerMonth, visibility: p.visibilityPerMonth, workspaces: p.workspaces, seats: p.seats, leads: limitLabel(p.leads) },
    usage: { briefs: usage.briefs, searches: usage.searches, jury: usage.juries, audits: usage.audits, visibility: usage.visibility, costUSD: Number(usage.costUSD.toFixed(4)) },
    workspaces: workspaces ?? [],
    plans: Object.values(PLANS).map((x) => ({ id: x.id, name: x.name, priceKES: x.priceKES, model: x.modelLabel, features: x.features, blurb: x.blurb })),
  });
}

export async function DELETE(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const admin = supabaseAdmin();
  // Revoke every session first: deleting a user doesn't invalidate issued tokens.
  if (user.token) await admin.auth.admin.signOut(user.token, "global").catch(() => undefined);
  else await user.db.auth.signOut({ scope: "global" }).catch(() => undefined);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return fail(500, "Couldn't delete the account. Contact support.");
  return json(200, { deleted: true });
}
