// POST /api/billing/stripe/portal → { url } to manage or cancel a card subscription.
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { appUrl, stripe } from "@/lib/server/billing";
import { fail, json, publicError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const s = stripe();
  if (!s) return fail(503, "Card payments aren't set up.");
  const { data: sub } = await supabaseAdmin().from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.stripe_customer_id) return fail(404, "No card subscription on this account.");
  try {
    const portal = await s.billingPortal.sessions.create({ customer: sub.stripe_customer_id, return_url: `${appUrl()}/app/billing` });
    return json(200, { url: portal.url });
  } catch (err) {
    return fail(502, publicError(err, "Couldn't open the billing portal."));
  }
}
