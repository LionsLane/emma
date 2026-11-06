// POST /api/billing/stripe/checkout { plan } → { url } for Stripe Checkout.
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { appUrl, stripe, stripePrice } from "@/lib/server/billing";
import { fail, json, publicError, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
const Body = z.object({ plan: z.enum(["pro", "max"]) });

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const s = stripe();
  if (!s) return fail(503, "Card payments aren't set up yet. Pay with M-Pesa.");
  const raw = await readJson(req, 1_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Pick Pro or Max.");
  const price = stripePrice(body.data.plan);
  if (!price) return fail(503, "That plan isn't available for cards yet.");

  try {
    const admin = supabaseAdmin();
    const { data: sub } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
    let customer = sub?.stripe_customer_id as string | undefined;
    if (!customer) {
      const c = await s.customers.create({ email: user.email ?? undefined, metadata: { userId: user.id } });
      customer = c.id;
      await admin.from("subscriptions").update({ stripe_customer_id: customer }).eq("user_id", user.id);
    }
    const session = await s.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${appUrl()}/app/billing?status=success`,
      cancel_url: `${appUrl()}/app/billing?status=cancelled`,
      allow_promotion_codes: true,
    });
    return json(200, { url: session.url });
  } catch (err) {
    return fail(502, publicError(err, "Couldn't start card checkout. Try again or use M-Pesa."));
  }
}
