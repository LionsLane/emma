// POST /api/billing/mpesa/callback/:secret — Safaricom's STK result callback.
// Daraja callbacks aren't signed, so the body is never trusted on its own:
// the secret path filters noise, and settleMpesa() confirms with Safaricom's
// STK query API before granting anything.
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { settleMpesa } from "@/lib/server/billing";

export const runtime = "nodejs";

const ok = () => Response.json({ ResultCode: 0, ResultDesc: "Accepted" });

function secretMatches(given: string): boolean {
  const expected = process.env.MPESA_CALLBACK_SECRET ?? "";
  if (!expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(req: Request, ctx: { params: Promise<{ secret: string }> }) {
  const { secret } = await ctx.params;
  if (!secretMatches(secret)) return new Response("Not found", { status: 404 });
  const text = await req.text();
  if (text.length > 20_000) return ok();
  try {
    const body = JSON.parse(text) as { Body?: { stkCallback?: { CheckoutRequestID?: string; CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] } } } };
    const cb = body.Body?.stkCallback;
    if (!cb?.CheckoutRequestID || typeof cb.CheckoutRequestID !== "string") return ok();
    const items = cb.CallbackMetadata?.Item ?? [];
    const pick = (n: string) => items.find((i) => i.Name === n)?.Value;
    const amount = pick("Amount");
    const receipt = pick("MpesaReceiptNumber");
    await settleMpesa(supabaseAdmin(), cb.CheckoutRequestID, {
      amount: amount === undefined ? undefined : Number(amount),
      receipt: typeof receipt === "string" ? receipt.slice(0, 40) : undefined,
    });
  } catch (err) {
    console.error("[emma] mpesa callback", err instanceof Error ? err.message : err);
  }
  return ok(); // always acknowledge so Safaricom doesn't retry forever
}
