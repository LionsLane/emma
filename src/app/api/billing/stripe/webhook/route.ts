// POST /api/billing/stripe/webhook — Stripe → us. The signature is verified
// against the raw body before anything is trusted.
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe, syncStripeSubscription } from "@/lib/server/billing";
import { fail, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return fail(503, "Not configured.");
  const sig = req.headers.get("stripe-signature");
  if (!sig) return fail(400, "Missing signature.");
  const raw = await req.text();
  if (raw.length > 512_000) return fail(413, "Too large.");

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return fail(400, "Bad signature.");
  }

  const admin = supabaseAdmin();
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await s.subscriptions.retrieve(subId);
          await syncStripeSubscription(admin, sub, session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(admin, event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[emma] stripe webhook", err instanceof Error ? err.message : err);
    return fail(500, "Webhook handling failed."); // Stripe retries
  }
  return json(200, { received: true });
}
