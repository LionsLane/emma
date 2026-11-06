// POST /api/billing/mpesa/stk { plan, phone } → sends an M-Pesa PIN prompt.
// Price comes from our plans table, never from the client.
import { z } from "zod";
import { PLANS } from "@/lib/plans";
import { normaliseKenyanPhone } from "@/lib/safe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { mpesaConfigured, mpesaSandbox, practicePaymentsBlocked, stkPush } from "@/lib/server/billing";
import { resolvePlan } from "@/lib/server/quota";
import { fail, json, publicError, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
const Body = z.object({ plan: z.enum(["pro", "max"]), phone: z.string().max(20) });

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  if (!mpesaConfigured()) return fail(503, "M-Pesa isn't set up yet.");
  if (mpesaSandbox() && practicePaymentsBlocked((await resolvePlan(supabaseAdmin(), user.id)).staff))
    return fail(503, "M-Pesa payments open once our PayBill is live. Your Free plan keeps working in the meantime.");
  const raw = await readJson(req, 1_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Pick a plan and enter your M-Pesa number.");
  const phone = normaliseKenyanPhone(body.data.phone);
  if (!phone) return fail(400, "Enter a Safaricom number like 0712 345 678.");

  const admin = supabaseAdmin();
  // Throttle: at most 3 prompts in 10 minutes per user.
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin.from("mpesa_payments").select("checkout_request_id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 3) return fail(429, "Too many payment prompts. Wait a few minutes and try again.");

  const amount = PLANS[body.data.plan].priceKES;
  try {
    const r = await stkPush(phone, amount, body.data.plan);
    await admin.from("mpesa_payments").insert({
      checkout_request_id: r.checkoutRequestId, merchant_request_id: r.merchantRequestId, user_id: user.id,
      plan: body.data.plan, amount, phone,
    });
    return json(200, { checkoutRequestId: r.checkoutRequestId, message: r.message });
  } catch (err) {
    return fail(502, publicError(err, "M-Pesa didn't accept the request. Check the number and try again."));
  }
}
