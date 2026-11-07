// Paystack end-to-end on the live site (test keys): customers are blocked, staff get a checkout page,
// webhooks need a valid signature, and even a signed webhook can't grant a plan Paystack hasn't confirmed.
//   node scripts/paystacktest.mjs [--app=https://emma.lionslane.co.ke]
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failed = 0;
const check = (n, ok, d = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const email = `e2epaystack${Date.now()}@example.com`;
let id = null;
try {
  const { data: u } = await admin.auth.admin.createUser({ email, email_confirm: true }); id = u.user.id;
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data: s } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  const auth = { Authorization: `Bearer ${s.session.access_token}`, "Content-Type": "application/json" };
  const init = () => fetch(APP + "/api/billing/paystack/init", { method: "POST", headers: auth, body: JSON.stringify({ plan: "pro" }) });

  const a1 = await (await fetch(APP + "/api/account", { headers: auth })).json();
  const r1 = await init(); const b1 = await r1.json();
  check("Customer doesn't see Paystack while keys are test keys", a1.payments?.paystack === false, JSON.stringify(a1.payments));
  check("Customer can't start a practice Paystack payment", r1.status === 503 && !b1.url, b1.error);

  await admin.from("profiles").update({ is_staff: true }).eq("id", id);
  const a2 = await (await fetch(APP + "/api/account", { headers: auth })).json();
  const r2 = await init(); const b2 = await r2.json();
  check("Staff see Paystack", a2.payments?.paystack === true);
  check("Staff get a Paystack checkout page", r2.status === 200 && /^https:\/\/checkout\.paystack\.com\//.test(b2.url ?? ""), b2.error ?? "checkout.paystack.com");

  const { data: rows } = await admin.from("paystack_payments").select("reference,amount,plan,status").eq("user_id", id);
  const row = rows?.[0];
  check("Payment row saved with the plan price", row?.amount === 500 && row?.plan === "pro" && row?.status === "pending", JSON.stringify(row));

  if (row) {
    const v = await (await fetch(`${APP}/api/billing/paystack/verify?reference=${row.reference}`, { headers: auth })).json();
    check("Unpaid checkout stays pending", v.status === "pending", v.status);

    const body = JSON.stringify({ event: "charge.success", data: { reference: row.reference } });
    const bad = await fetch(APP + "/api/billing/paystack/webhook", { method: "POST", headers: { "Content-Type": "application/json", "x-paystack-signature": "00".repeat(64) }, body });
    check("Webhook with a forged signature is refused", bad.status === 401, `HTTP ${bad.status}`);

    const sig = createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(body).digest("hex");
    const good = await fetch(APP + "/api/billing/paystack/webhook", { method: "POST", headers: { "Content-Type": "application/json", "x-paystack-signature": sig }, body });
    const { data: after } = await admin.from("paystack_payments").select("status").eq("reference", row.reference).maybeSingle();
    const { data: sub } = await admin.from("subscriptions").select("plan").eq("user_id", id).maybeSingle();
    check("Signed webhook is accepted", good.status === 200, `HTTP ${good.status}`);
    check("No plan without Paystack confirming the payment", after?.status === "pending" && (sub?.plan ?? "free") === "free", `payment ${after?.status}, plan ${sub?.plan ?? "free"}`);
  }
} catch (e) { check("Test crashed", false, String(e)); }
finally {
  if (id) { await admin.from("paystack_payments").delete().eq("user_id", id); await admin.auth.admin.deleteUser(id); }
  console.log(failed ? `${failed} failed` : "all passed"); process.exit(failed ? 1 : 0);
}
