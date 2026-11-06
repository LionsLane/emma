// Checks the email sign-in link end to end against a running EMMA (default http://localhost:5180):
// a throwaway user gets a real one-time token from the admin API (no email is sent), the
// /auth/confirm link is opened with no prior cookies (like a different browser or the Gmail app),
// and the result must be a redirect into /app with a session cookie. The user is deleted after.
//   node scripts/linktest.mjs [--app=https://emma.lionslane.co.ke]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? "http://localhost:5180").replace(/\/$/, "");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

let failed = 0;
const check = (name, ok, detail = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const email = `e2elink${Date.now()}@example.com`;
let userId = null;
try {
  // A new user (sign-up email) and a returning user (sign-in email) both carry a token hash.
  const { data: signup, error: e0 } = await admin.auth.admin.generateLink({ type: "signup", email, password: crypto.randomUUID() + "Aa1!" });
  if (e0) throw new Error("generateLink signup: " + e0.message);
  userId = signup.user.id;
  const open = (hash, type) => fetch(`${APP}/auth/confirm?token_hash=${encodeURIComponent(hash)}&type=${type}&next=/app`, { redirect: "manual" });

  const r1 = await open(signup.properties.hashed_token, "email");
  const loc1 = r1.headers.get("location") ?? "";
  const cookies1 = r1.headers.getSetCookie?.() ?? [];
  check("Sign-up link signs in (fresh browser)", r1.status === 307 && new URL(loc1, APP).pathname === "/app", `HTTP ${r1.status} -> ${loc1}`);
  check("Session cookie is set", cookies1.some((c) => /^sb-.*-auth-token/.test(c)), `${cookies1.length} cookies`);

  const r2 = await open(signup.properties.hashed_token, "email");
  check("Same link used twice is refused", new URL(r2.headers.get("location") ?? "", APP).pathname === "/signin", r2.headers.get("location") ?? "");

  const { data: magic, error: e1 } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (e1) throw new Error("generateLink magiclink: " + e1.message);
  const r3 = await open(magic.properties.hashed_token, "email");
  check("Sign-in link signs in (returning user)", new URL(r3.headers.get("location") ?? "", APP).pathname === "/app", r3.headers.get("location") ?? "");

  const r4 = await fetch(`${APP}/auth/confirm?token_hash=nonsense&type=email&next=//evil.example`, { redirect: "manual" });
  check("Bad token goes back to sign in, never off-site", new URL(r4.headers.get("location") ?? "", APP).pathname === "/signin", r4.headers.get("location") ?? "");
} catch (err) {
  check("Test crashed", false, err instanceof Error ? err.message : String(err));
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
  console.log(failed ? `${failed} failed` : "all passed");
  process.exit(failed ? 1 : 0);
}
