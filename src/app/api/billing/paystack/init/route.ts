// POST /api/billing/paystack/init { plan } → { url } of Paystack's checkout page (M-Pesa or card).
// Price comes from our plans table, never from the client.
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { practicePaymentsBlocked } from "@/lib/server/billing";
import { paystackConfigured, paystackTestMode, startPaystackCheckout } from "@/lib/server/paystack";
import { resolvePlan } from "@/lib/server/quota";
import { fail, json, publicError, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
const Body = z.object({ plan: z.enum(["pro", "max"]) });

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  if (!paystackConfigured()) return fail(503, "Paystack isn't set up yet.");
  const admin = supabaseAdmin();
  if (paystackTestMode() && practicePaymentsBlocked((await resolvePlan(admin, user.id)).staff))
    return fail(503, "Payments open once our Paystack account is verified. Your Free plan keeps working in the meantime.");
  if (!user.email) return fail(400, "Your account needs an email address to pay.");
  const raw = await readJson(req, 1_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Pick a plan.");

  // Throttle: at most 5 checkouts in 10 minutes per user.
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin.from("paystack_payments").select("reference", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 5) return fail(429, "Too many checkouts. Wait a few minutes and try again.");

  try {
    const url = await startPaystackCheckout(admin, { id: user.id, email: user.email }, body.data.plan);
    return json(200, { url });
  } catch (err) {
    return fail(502, publicError(err, "Couldn't open Paystack checkout. Try again."));
  }
}
