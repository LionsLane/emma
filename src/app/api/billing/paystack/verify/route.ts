// GET /api/billing/paystack/verify?reference=… → { status } after Paystack sends the customer back.
// Settles through Paystack's verify API, in case the webhook hasn't landed yet.
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { settlePaystack } from "@/lib/server/paystack";
import { fail, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const reference = new URL(req.url).searchParams.get("reference") ?? "";
  if (!/^emma-[0-9a-f-]{36}$/.test(reference)) return fail(400, "Missing payment reference.");
  const admin = supabaseAdmin();
  const { data: pay } = await admin.from("paystack_payments").select("user_id,status").eq("reference", reference).maybeSingle();
  if (!pay || pay.user_id !== user.id) return fail(404, "Payment not found.");
  const status = pay.status === "pending" ? await settlePaystack(admin, reference).catch(() => "pending") : pay.status;
  return json(200, { status });
}
