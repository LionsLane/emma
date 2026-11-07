// POST /api/billing/paystack/webhook: Paystack's server calls this when a charge succeeds.
// The signature proves it came from Paystack; settlePaystack re-checks the payment with
// Paystack's API before any plan changes.
import { supabaseAdmin } from "@/lib/supabase/server";
import { paystackSignatureOk, settlePaystack } from "@/lib/server/paystack";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 200_000 || !paystackSignatureOk(raw, req.headers.get("x-paystack-signature"))) return json(401, { error: "bad signature" });
  let event: { event?: string; data?: { reference?: string } };
  try { event = JSON.parse(raw); } catch { return json(400, { error: "bad json" }); }
  const reference = event.data?.reference ?? "";
  if (event.event === "charge.success" && /^emma-[0-9a-f-]{36}$/.test(reference)) {
    try { await settlePaystack(supabaseAdmin(), reference); }
    catch (err) { console.error("[emma] paystack webhook settle failed", reference, err instanceof Error ? err.message : ""); return json(500, { error: "retry" }); }
  }
  return json(200, { received: true });
}
