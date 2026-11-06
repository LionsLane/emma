// While Stripe has test keys, card checkout on the live site must be staff only.
//   node scripts/paygatetest.mjs [--app=https://emma.lionslane.co.ke]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failed = 0;
const check = (n, ok, d = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const email = `e2epay${Date.now()}@example.com`;
let id = null;
try {
  const { data: u } = await admin.auth.admin.createUser({ email, email_confirm: true }); id = u.user.id;
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data: s } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  const pay = () => fetch(APP + "/api/billing/stripe/checkout", { method: "POST", headers: { Authorization: `Bearer ${s.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ plan: "pro" }) });
  const r1 = await pay(); const b1 = await r1.json();
  check("Customer can't start a practice card payment", r1.status === 503 && !b1.url, b1.error);
  await admin.from("profiles").update({ is_staff: true }).eq("id", id);
  const r2 = await pay(); const b2 = await r2.json();
  check("Staff can test card checkout", r2.status === 200 && /^https:\/\/checkout\.stripe\.com\//.test(b2.url ?? ""), b2.error ?? "checkout.stripe.com");
} catch (e) { check("Test crashed", false, String(e)); }
finally { if (id) await admin.auth.admin.deleteUser(id); console.log(failed ? `${failed} failed` : "all passed"); process.exit(failed ? 1 : 0); }
