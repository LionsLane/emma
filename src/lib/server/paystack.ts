import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, type PlanId } from "@/lib/plans";
import { appUrl, extendPlan } from "./billing";

// Paystack (Kenya): one checkout page for M-Pesa and cards, paid in KES.
// Amounts go to Paystack in the subunit (KES x 100). A paid checkout extends
// the plan by 30 days, the same as a direct M-Pesa payment.
// Docs: https://paystack.com/docs/api/transaction/

const API = "https://api.paystack.co";
const secret = () => process.env.PAYSTACK_SECRET_KEY ?? "";
export const paystackConfigured = () => /^sk_(test|live)_/.test(secret());
export const paystackTestMode = () => secret().startsWith("sk_test_");

type PaystackResponse<T> = { status: boolean; message: string; data?: T };

async function call<T>(path: string, init?: RequestInit): Promise<PaystackResponse<T>> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({ status: false, message: `HTTP ${res.status}` }))) as PaystackResponse<T>;
  if (!res.ok || !body.status) throw new Error(`paystack ${path.split("?")[0]}: ${body.message ?? res.status}`);
  return body;
}

export async function startPaystackCheckout(admin: SupabaseClient, user: { id: string; email: string }, plan: PlanId): Promise<string> {
  const amount = PLANS[plan].priceKES;
  const reference = `emma-${randomUUID()}`;
  // Row first, so a payment can never arrive for a reference we don't know.
  const { error } = await admin.from("paystack_payments").insert({ reference, user_id: user.id, plan, amount });
  if (error) throw new Error(`paystack row insert failed: ${error.message}`);
  const r = await call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      amount: amount * 100,
      currency: "KES",
      reference,
      channels: ["mobile_money", "card"],
      callback_url: `${appUrl()}/app/billing?paystack=1`,
      metadata: { userId: user.id, plan, product: "EMMA" },
    }),
  });
  if (!r.data?.authorization_url) throw new Error("paystack: no checkout url");
  return r.data.authorization_url;
}

type Verified = { status: string; amount: number; currency: string; channel?: string; paid_at?: string; gateway_response?: string; reference: string };

// Idempotent: asks Paystack what happened, settles a pending payment once.
export async function settlePaystack(admin: SupabaseClient, reference: string): Promise<string> {
  const { data: pay } = await admin.from("paystack_payments").select("*").eq("reference", reference).maybeSingle();
  if (!pay) return "unknown";
  if (pay.status !== "pending") return pay.status;

  const r = await call<Verified>(`/transaction/verify/${encodeURIComponent(reference)}`);
  const t = r.data;
  if (!t) return "pending";
  const now = new Date().toISOString();
  if (t.status === "failed") {
    await admin.from("paystack_payments").update({ status: "failed", result_desc: t.gateway_response ?? "Failed", channel: t.channel ?? null, updated_at: now }).eq("reference", reference).eq("status", "pending");
    return "failed";
  }
  // "abandoned" and "ongoing" can still complete, so they stay pending.
  if (t.status !== "success") return "pending";
  if (t.currency !== "KES" || t.amount !== pay.amount * 100) {
    console.error("[emma] paystack amount mismatch", reference);
    await admin.from("paystack_payments").update({ status: "failed", result_desc: "Amount mismatch", updated_at: now }).eq("reference", reference).eq("status", "pending");
    return "failed";
  }

  // Claim first (only one settle can win), then extend the plan.
  const { data: claimed } = await admin
    .from("paystack_payments")
    .update({ status: "paid", channel: t.channel ?? null, paid_at: t.paid_at ?? now, result_desc: t.gateway_response ?? "Successful", updated_at: now })
    .eq("reference", reference).eq("status", "pending")
    .select("reference").maybeSingle();
  if (!claimed) return "paid";
  await extendPlan(admin, pay.user_id, pay.plan, "paystack");
  return "paid";
}

// Paystack signs each webhook with HMAC SHA512 of the raw body, keyed by the secret key.
export function paystackSignatureOk(raw: string, signature: string | null): boolean {
  if (!signature || !paystackConfigured()) return false;
  const expected = createHmac("sha512", secret()).update(raw).digest("hex");
  const a = Buffer.from(expected, "hex"), b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
