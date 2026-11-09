// Search & AI audit test: real sites score sensibly, and the fetcher refuses private targets (SSRF).
//   node scripts/searchtest.mjs [--app=http://localhost:5180]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? "http://localhost:5180").replace(/\/$/, "");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failed = 0;
const check = (n, ok, d = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const email = `e2esearch${Date.now()}@example.com`;
let id = null;
try {
  const { data: u } = await admin.auth.admin.createUser({ email, email_confirm: true }); id = u.user.id;
  await admin.from("profiles").update({ is_staff: true }).eq("id", id); // staff = Max limits, so the run isn't capped
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data: s } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  const audit = (url, business) => fetch(APP + "/api/search/audit", { method: "POST", headers: { Authorization: `Bearer ${s.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ url, business }) });

  for (const [url, business] of [["lionslane.co.ke", { name: "Lions Lane", location: "Nairobi, Kenya" }], ["https://emma.lionslane.co.ke", { name: "EMMA", location: "Nairobi, Kenya" }], ["example.com", { name: "Example", location: "Nairobi" }]]) {
    const r = await audit(url, business); const b = await r.json();
    const ok = r.status === 200 && typeof b.scores?.overall === "number" && b.checks?.length >= 25;
    check(`Audits ${url}`, ok, ok ? `overall ${b.scores.overall} · SEO ${b.scores.seo} AIO ${b.scores.aio} GEO ${b.scores.geo} AXO ${b.scores.axo} · ${b.checks.length} checks · ${b.facts.words} words` : `HTTP ${r.status} ${b.error ?? ""}`);
    if (ok) console.log("      to fix:", b.checks.filter((x) => x.status !== "pass").map((x) => `${x.pillar}:${x.id}(${x.status})`).join(" "));
  }

  const blocked = ["http://127.0.0.1/", "http://localhost:5180/", "http://169.254.169.254/latest/meta-data/", "http://[::1]/", "http://10.0.0.1/", "http://192.168.1.1/", "https://example.com:8443/", "file:///etc/passwd", "http://localtest.me/", "http://user:pass@example.com/", "ftp://example.com/"];
  for (const url of blocked) {
    const r = await audit(url); const b = await r.json();
    check(`Refuses ${url}`, r.status === 400, `HTTP ${r.status} ${b.error ?? ""}`);
  }
  const bad = await fetch(APP + "/api/search/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "example.com" }) });
  check("Signed-out audit is refused", bad.status === 401, `HTTP ${bad.status}`);
} catch (e) { check("Test crashed", false, String(e)); }
finally {
  if (id) { await admin.from("usage_events").delete().eq("user_id", id); await admin.auth.admin.deleteUser(id); }
  console.log(failed ? `${failed} failed` : "all passed"); process.exit(failed ? 1 : 0);
}
