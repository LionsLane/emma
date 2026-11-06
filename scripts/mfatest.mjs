// Two-step verification test against a running EMMA (default http://localhost:5180).
// A throwaway user signs in (step one), turns on an authenticator app (TOTP, codes computed here),
// and the app must refuse step-one-only sessions and accept step-two sessions. The user is deleted after.
//   node scripts/mfatest.mjs [--app=https://emma.lionslane.co.ke]
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? "http://localhost:5180").replace(/\/$/, "");
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, PUB = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(URL_, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

function totp(secretB32, offset = 0) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secretB32.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + offset));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1e6)).padStart(6, "0");
}

let failed = 0;
const check = (name, ok, detail = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const account = (token) => fetch(APP + "/api/account", { headers: { Authorization: `Bearer ${token}` } });
const email = `e2emfa${Date.now()}@example.com`;
let userId = null;
try {
  const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw new Error(error.message);
  userId = created.user.id;
  const signIn = async () => {
    const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const c = createClient(URL_, PUB, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error: e } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
    if (e) throw new Error("verifyOtp: " + e.message);
    return { c, session: data.session };
  };

  const one = await signIn();
  check("Without two-step, step one is enough", (await account(one.session.access_token)).status === 200);

  const { data: enrolled, error: e1 } = await one.c.auth.mfa.enroll({ factorType: "totp", friendlyName: "Test authenticator" });
  if (e1) throw new Error("enroll: " + e1.message);
  const secret = enrolled.totp.secret;
  const { data: v1, error: e2 } = await one.c.auth.mfa.challengeAndVerify({ factorId: enrolled.id, code: totp(secret) });
  check("Authenticator app turns on with a correct code", !e2 && !!v1, e2?.message);

  const two = await signIn(); // a new sign-in: step one only
  const blocked = await account(two.session.access_token);
  const body = await blocked.json();
  check("Step-one-only session is refused once two-step is on", blocked.status === 401 && body.mfa === true, `HTTP ${blocked.status}`);
  const page = await fetch(APP + "/app", { redirect: "manual", headers: { Cookie: "" } });
  check("Signed-out visit to /app still goes to sign in", page.status === 307);

  const wrong = await two.c.auth.mfa.challengeAndVerify({ factorId: enrolled.id, code: "000000" });
  check("A wrong code is rejected", !!wrong.error);
  // wait for the next 30-second window so the code is not a replay of the one used to enrol
  await new Promise((r) => setTimeout(r, 31000 - (Date.now() % 30000)));
  const { data: v2, error: e3 } = await two.c.auth.mfa.challengeAndVerify({ factorId: enrolled.id, code: totp(secret) });
  check("Correct code completes step two", !e3 && !!v2, e3?.message);
  const ok = await account(v2?.access_token ?? "");
  check("Step-two session is let in", ok.status === 200, `HTTP ${ok.status}`);
} catch (err) {
  check("Test crashed", false, err instanceof Error ? err.message : String(err));
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
  console.log(failed ? `${failed} failed` : "all passed");
  process.exit(failed ? 1 : 0);
}
