// M-Pesa sandbox end-to-end: a temporary staff user asks the live site for an STK push to
// Safaricom's sandbox test number, then polls the status route. No real phone, no real money.
//   node scripts/mpesatest.mjs [--app=https://emma.lionslane.co.ke]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "");
const SANDBOX_MSISDN = "254708374149"; // Safaricom's published sandbox test number
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failed = 0;
const check = (n, ok, d = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const email = `e2empesa${Date.now()}@example.com`;
let id = null;
try {
  const { data: u } = await admin.auth.admin.createUser({ email, email_confirm: true }); id = u.user.id;
  await admin.from("profiles").update({ is_staff: true }).eq("id", id);
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data: s } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  const auth = { Authorization: `Bearer ${s.session.access_token}`, "Content-Type": "application/json" };

  const acct = await (await fetch(APP + "/api/account", { headers: auth })).json();
  check("Account lists M-Pesa as open for staff", acct.payments?.mpesa === true, JSON.stringify(acct.payments));

  const r = await fetch(APP + "/api/billing/mpesa/stk", { method: "POST", headers: auth, body: JSON.stringify({ plan: "pro", phone: SANDBOX_MSISDN }) });
  const b = await r.json();
  check("Safaricom sandbox accepts the STK push", r.status === 200 && Boolean(b.checkoutRequestId), b.error ?? b.message);

  if (b.checkoutRequestId) {
    const { data: row } = await admin.from("mpesa_payments").select("amount,plan,status").eq("checkout_request_id", b.checkoutRequestId).maybeSingle();
    check("Payment row saved with the plan price", row?.amount === 500 && row?.plan === "pro" && row?.status === "pending", JSON.stringify(row));
    let status = "pending";
    for (let i = 0; i < 8 && status === "pending"; i++) {
      await new Promise((res) => setTimeout(res, 5000));
      status = (await (await fetch(`${APP}/api/billing/mpesa/status?id=${encodeURIComponent(b.checkoutRequestId)}`, { headers: auth })).json()).status ?? "error";
    }
    // The sandbox has no real handset, so it ends "cancelled"/"failed" or stays pending; what
    // matters is that the status route answers and never grants a plan without a paid result.
    check("Status route answers", ["pending", "paid", "failed", "cancelled"].includes(status), status);
    const { data: sub } = await admin.from("subscriptions").select("plan").eq("user_id", id).maybeSingle();
    check("Plan only changes on a paid result", status === "paid" ? sub?.plan === "pro" : (sub?.plan ?? "free") === "free", `status ${status}, plan ${sub?.plan ?? "free"}`);
  }
} catch (e) { check("Test crashed", false, String(e)); }
finally {
  if (id) { await admin.from("mpesa_payments").delete().eq("user_id", id); await admin.auth.admin.deleteUser(id); }
  console.log(failed ? `${failed} failed` : "all passed"); process.exit(failed ? 1 : 0);
}
