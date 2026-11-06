import "server-only";
import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, type PlanId } from "@/lib/plans";

// ---------------------------------------------------------------- shared

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5180").replace(/\/$/, "");
const DAY = 86_400_000;

async function setPlan(admin: SupabaseClient, userId: string, row: Record<string, unknown>) {
  const { error } = await admin.from("subscriptions").upsert({ user_id: userId, ...row, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(`subscription upsert failed: ${error.message}`);
}

// ---------------------------------------------------------------- Stripe (cards)

let stripeClient: Stripe | null = null;
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripeClient ??= new Stripe(key);
  return stripeClient;
}

export function stripePrice(plan: PlanId): string | undefined {
  return plan === "pro" ? process.env.STRIPE_PRICE_PRO : plan === "max" ? process.env.STRIPE_PRICE_MAX : undefined;
}

// Plan comes from the price we configured, never from client-supplied data.
function planFromPrice(priceId: string | undefined): PlanId | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_MAX) return "max";
  return null;
}

const STATUS: Record<string, "active" | "trialing" | "past_due" | "canceled" | "expired"> = {
  active: "active", trialing: "trialing", past_due: "past_due", unpaid: "past_due", incomplete: "past_due",
  canceled: "canceled", incomplete_expired: "expired", paused: "expired",
};

export async function syncStripeSubscription(admin: SupabaseClient, sub: Stripe.Subscription, userIdHint?: string | null) {
  const item = sub.items.data[0];
  const plan = planFromPrice(item?.price?.id);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let userId = userIdHint ?? (sub.metadata?.userId || null);
  if (!userId) {
    const { data } = await admin.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId || !plan) {
    console.error("[emma] stripe: can't map subscription", sub.id);
    return;
  }
  const status = STATUS[sub.status] ?? "expired";
  await setPlan(admin, userId, {
    plan: status === "canceled" || status === "expired" ? "free" : plan,
    status, provider: "stripe",
    current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    stripe_customer_id: customerId, stripe_subscription_id: sub.id,
  });
}

// ---------------------------------------------------------------- M-Pesa (Daraja STK push)

const darajaBase = () => (process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke");
export const mpesaConfigured = () =>
  Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY && process.env.MPESA_CALLBACK_SECRET);

function eatTimestamp(): string {
  const d = new Date(Date.now() + 3 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

async function darajaToken(): Promise<string> {
  const basic = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${darajaBase()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${basic}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`daraja token ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

function password(ts: string) {
  return Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${ts}`).toString("base64");
}

export async function stkPush(phone: string, amount: number, plan: PlanId): Promise<{ checkoutRequestId: string; merchantRequestId: string; message: string }> {
  const ts = eatTimestamp();
  const token = await darajaToken();
  const res = await fetch(`${darajaBase()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password(ts),
      Timestamp: ts,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE ?? "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_PARTYB ?? process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${appUrl()}/api/billing/mpesa/callback/${process.env.MPESA_CALLBACK_SECRET}`,
      AccountReference: `EMMA ${PLANS[plan].name}`.slice(0, 12),
      TransactionDesc: `EMMA ${PLANS[plan].name}`.slice(0, 13),
    }),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, string>;
  if (!res.ok || body.ResponseCode !== "0") throw new Error(`stk push failed: ${body.errorMessage ?? body.ResponseDescription ?? res.status}`);
  return { checkoutRequestId: body.CheckoutRequestID, merchantRequestId: body.MerchantRequestID, message: body.CustomerMessage ?? "Check your phone to enter your M-Pesa PIN." };
}

// Ask Safaricom what actually happened. Callbacks aren't signed, so this is the
// only thing we trust.
async function stkQuery(checkoutRequestId: string): Promise<{ state: "paid" | "failed" | "cancelled" | "pending"; desc: string }> {
  const ts = eatTimestamp();
  const token = await darajaToken();
  const res = await fetch(`${darajaBase()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: process.env.MPESA_SHORTCODE, Password: password(ts), Timestamp: ts, CheckoutRequestID: checkoutRequestId }),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, string | number>;
  if (body.ResultCode === undefined) return { state: "pending", desc: String(body.errorMessage ?? "Still processing") };
  const code = String(body.ResultCode);
  const desc = String(body.ResultDesc ?? "");
  if (code === "0") return { state: "paid", desc };
  if (code === "1032") return { state: "cancelled", desc };
  return { state: "failed", desc };
}

// Idempotent: settles a pending payment once, extends the plan 30 days.
export async function settleMpesa(admin: SupabaseClient, checkoutRequestId: string, meta?: { amount?: number; receipt?: string }): Promise<string> {
  const { data: pay } = await admin.from("mpesa_payments").select("*").eq("checkout_request_id", checkoutRequestId).maybeSingle();
  if (!pay) return "unknown";
  if (pay.status !== "pending") return pay.status;

  const result = await stkQuery(checkoutRequestId);
  if (result.state === "pending") return "pending";
  if (result.state !== "paid") {
    await admin.from("mpesa_payments").update({ status: result.state, result_desc: result.desc, updated_at: new Date().toISOString() }).eq("checkout_request_id", checkoutRequestId).eq("status", "pending");
    return result.state;
  }
  if (meta?.amount !== undefined && Number(meta.amount) !== pay.amount) {
    console.error("[emma] mpesa amount mismatch", checkoutRequestId);
    await admin.from("mpesa_payments").update({ status: "failed", result_desc: "Amount mismatch", updated_at: new Date().toISOString() }).eq("checkout_request_id", checkoutRequestId).eq("status", "pending");
    return "failed";
  }

  // Claim the payment first (only one settle can win), then extend the plan.
  const { data: claimed } = await admin
    .from("mpesa_payments")
    .update({ status: "paid", receipt: meta?.receipt ?? null, result_desc: result.desc, updated_at: new Date().toISOString() })
    .eq("checkout_request_id", checkoutRequestId).eq("status", "pending")
    .select("checkout_request_id").maybeSingle();
  if (!claimed) return "paid";

  const { data: sub } = await admin.from("subscriptions").select("plan,current_period_end").eq("user_id", pay.user_id).maybeSingle();
  const now = Date.now();
  const end = sub?.current_period_end ? new Date(sub.current_period_end).getTime() : 0;
  const base = sub?.plan === pay.plan && end > now ? end : now;
  await setPlan(admin, pay.user_id, { plan: pay.plan, status: "active", provider: "mpesa", current_period_end: new Date(base + 30 * DAY).toISOString() });
  return "paid";
}
