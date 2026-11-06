// GET /api/billing/mpesa/status?id=<checkoutRequestId> — "Check payment".
// Settles via Safaricom's query API if the callback never arrived.
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { settleMpesa } from "@/lib/server/billing";
import { fail, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id || id.length > 80) return fail(400, "Missing payment id.");
  const admin = supabaseAdmin();
  const { data: pay } = await admin.from("mpesa_payments").select("user_id,status").eq("checkout_request_id", id).maybeSingle();
  if (!pay || pay.user_id !== user.id) return fail(404, "Payment not found.");
  const status = pay.status === "pending" ? await settleMpesa(admin, id).catch(() => "pending") : pay.status;
  return json(200, { status });
}
