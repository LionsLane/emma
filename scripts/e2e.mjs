// End-to-end test against a deployed EMMA (default: NEXT_PUBLIC_APP_URL).
// Creates two throwaway users with the Supabase admin API (no email is sent),
// exercises accounts, RLS, workspaces, saves and security rules through the
// live API, optionally runs a real EMMA brief (--ai), then deletes both users
// through DELETE /api/account. Run from the emma folder:
//   node scripts/e2e.mjs            core checks
//   node scripts/e2e.mjs --ai       also brief EMMA and approve a proposal
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "");
const AI = process.argv.includes("--ai");
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, PUB = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SECRET = env.SUPABASE_SECRET_KEY;
if (!APP || !URL_ || !PUB || !SECRET) { console.error("Missing app URL or Supabase settings in .env.local"); process.exit(2); }

const admin = createClient(URL_, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
let pass = 0, failed = 0;
const results = [];
function check(name, ok, detail = "") {
  ok ? pass++ : failed++;
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  console.log(results.at(-1));
}

// Users are recorded in `users` as soon as they exist, so cleanup runs even if
// sign-in fails halfway.
async function makeUser(tag) {
  const email = `e2e${tag}${Date.now()}@example.com`;
  const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw new Error(`createUser: ${error.message}`);
  const u = { email, id: created.user.id, token: null, db: null };
  users.push(u);
  const { data: link, error: e1 } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (e1) throw new Error(`generateLink: ${e1.message}`);
  const client = createClient(URL_, PUB, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error: e2 } = await client.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: link.properties.verification_type ?? "magiclink" });
  if (e2 || !data.session) throw new Error(`verifyOtp: ${e2?.message}`);
  u.token = data.session.access_token;
  u.db = createClient(URL_, PUB, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${u.token}` } } });
  return u;
}

const api = (path, { token, method = "GET", body, headers = {} } = {}) =>
  fetch(APP + path, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });

const users = [];
try {
  console.log(`EMMA end-to-end test against ${APP}\n`);

  // ---- public surface
  const home = await api("/");
  check("Landing page loads", home.status === 200, `HTTP ${home.status}`);
  const csp = home.headers.get("content-security-policy") ?? "";
  check("Security headers present", csp.includes("frame-ancestors 'none'") && !!home.headers.get("strict-transport-security") && home.headers.get("x-frame-options") === "DENY");
  const health = await (await api("/api/health")).json();
  check("Health says accounts are on", health.cloud === true, JSON.stringify(health));
  const guard = await fetch(APP + "/app", { redirect: "manual" });
  check("Signed-out /app redirects to sign in", guard.status === 307 && (guard.headers.get("location") ?? "").includes("/signin"), `HTTP ${guard.status}`);

  // ---- accounts
  const a = await makeUser("a");
  const b = await makeUser("b");
  check("Two test users signed in", !!a.token && !!b.token);

  const { data: prof } = await a.db.from("profiles").select("id,is_staff").eq("id", a.id).maybeSingle();
  check("New user got a profile (trigger)", prof?.id === a.id && prof.is_staff === false);
  const { data: sub } = await a.db.from("subscriptions").select("plan,status").eq("user_id", a.id).maybeSingle();
  check("New user is on Free", sub?.plan === "free", JSON.stringify(sub));

  const acct = await api("/api/account", { token: a.token });
  const acctBody = await acct.json();
  check("GET /api/account works with a bearer token", acct.status === 200 && acctBody.plan?.id === "free" && acctBody.limits?.briefs === 15, `HTTP ${acct.status}`);
  const anon = await api("/api/account");
  check("GET /api/account without sign-in is refused", anon.status === 401, `HTTP ${anon.status}`);

  // ---- workspaces
  const mk = await api("/api/workspaces", { token: a.token, method: "POST", body: { name: "E2E Test Salon", profile: { industry: "Beauty", location: "Nairobi" } } });
  const ws = await mk.json();
  check("Create a workspace", mk.status === 201 && !!ws.id, `HTTP ${mk.status}`);
  const second = await api("/api/workspaces", { token: a.token, method: "POST", body: { name: "Second brand" } });
  check("Free plan refuses a second workspace", second.status === 402, `HTTP ${second.status}`);

  const { data: wsRead } = await a.db.from("workspaces").select("id,version").eq("id", ws.id).maybeSingle();
  check("Owner can read the workspace", wsRead?.id === ws.id);
  const v = wsRead?.version ?? 1;
  const { data: saved } = await a.db.from("workspaces").update({ name: "E2E Test Salon (saved)", version: v + 1, updated_at: new Date().toISOString() }).eq("id", ws.id).eq("version", v).select("version");
  check("Version-checked save succeeds", saved?.length === 1 && saved[0].version === v + 1);
  const { data: stale } = await a.db.from("workspaces").update({ name: "stale write", version: v + 1 }).eq("id", ws.id).eq("version", v).select("id");
  check("Stale save is rejected (no rows)", (stale?.length ?? 0) === 0);

  // ---- isolation (RLS)
  const { data: bRead } = await b.db.from("workspaces").select("id").eq("id", ws.id);
  check("Another user can't read the workspace", (bRead?.length ?? 0) === 0);
  const { data: bWrite } = await b.db.from("workspaces").update({ name: "hijack" }).eq("id", ws.id).select("id");
  check("Another user can't change the workspace", (bWrite?.length ?? 0) === 0);
  const { error: upErr, data: up } = await a.db.from("subscriptions").update({ plan: "max" }).eq("user_id", a.id).select("plan");
  check("User can't upgrade their own plan", !!upErr || (up?.length ?? 0) === 0);
  const { error: staffErr, data: staff } = await a.db.from("profiles").update({ is_staff: true }).eq("id", a.id).select("is_staff");
  check("User can't make themselves staff", !!staffErr || (staff?.length ?? 0) === 0);
  const { error: usageErr } = await a.db.from("usage_events").insert({ user_id: a.id, kind: "brief", model: "x" });
  check("User can't write usage records", !!usageErr);
  const { data: msgs, error: msgErr } = await a.db.from("messages").select("id").limit(1);
  check("User can't read raw AI history", !!msgErr || (msgs?.length ?? 0) === 0);

  // ---- request hygiene
  const plain = await api("/api/workspaces", { token: a.token, method: "POST", body: "name=x", headers: { "Content-Type": "text/plain" } });
  check("Non-JSON body is refused", plain.status === 415, `HTTP ${plain.status}`);
  const foreign = await api("/api/account", { headers: { Origin: "https://evil.example" } });
  check("Cookie request from another site is refused", foreign.status === 403 || foreign.status === 401, `HTTP ${foreign.status}`);
  const pre = await fetch(APP + "/api/account", { method: "OPTIONS", headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "GET" } });
  check("CORS preflight from an unknown origin is refused", pre.status === 403, `HTTP ${pre.status}`);
  const bogus = await api("/api/proposals/00000000-0000-4000-8000-000000000000", { token: a.token, method: "POST", body: { action: "approve" } });
  check("Unknown proposal returns 404", bogus.status === 404, `HTTP ${bogus.status}`);
  const injected = await api("/api/emma", { token: a.token, method: "POST", body: { workspaceId: ws.id, text: "x".repeat(4001) } });
  check("Over-long brief is refused", injected.status === 400 || injected.status === 503, `HTTP ${injected.status}`);

  // ---- EMMA (needs ANTHROPIC_API_KEY on the server)
  if (AI) {
    const res = await api("/api/emma", { token: a.token, method: "POST", body: { workspaceId: ws.id, text: "Write one Instagram post for this week about our Saturday hair braiding offer. Keep it short." } });
    check("Brief accepted", res.status === 200, `HTTP ${res.status}`);
    const events = [];
    if (res.ok && res.body) {
      const text = await res.text();
      for (const line of text.split("\n")) if (line.trim()) { try { events.push(JSON.parse(line)); } catch { /* partial line */ } }
    }
    const types = [...new Set(events.map((e) => e.type))];
    check("Stream has text and finishes", types.includes("text") && types.includes("done") && !types.includes("error"), types.join(","));
    const prop = events.find((e) => e.type === "proposal")?.proposal;
    check("EMMA proposed a card", !!prop, prop ? `${prop.kind}: ${prop.title}` : "no proposal");
    if (prop) {
      const ap = await api(`/api/proposals/${prop.id}`, { token: a.token, method: "POST", body: { action: "approve" } });
      const apBody = await ap.json();
      check("Approve (Sawa) applies it", ap.status === 200 && apBody.status === "approved", `added ${apBody.added}`);
      const again = await api(`/api/proposals/${prop.id}`, { token: a.token, method: "POST", body: { action: "approve" } });
      check("Approving twice is refused", again.status === 409, `HTTP ${again.status}`);
    }
    const { data: usage } = await a.db.from("usage_events").select("model,completed,cost_usd").eq("user_id", a.id);
    check("Usage was metered", (usage?.length ?? 0) >= 1, usage?.map((u) => `${u.model} $${u.cost_usd}`).join("; "));
    const quota = events.find((e) => e.type === "quota");
    check("Quota reported", !!quota, quota ? `${quota.briefsUsed}/${quota.briefsLimit}` : "");
  }
} catch (err) {
  check("Test run crashed", false, err instanceof Error ? err.message : String(err));
} finally {
  // ---- account deletion (cleans up the test users)
  for (const u of users) {
    if (u.token) {
      const del = await api("/api/account", { token: u.token, method: "DELETE" });
      const { data } = await admin.auth.admin.getUserById(u.id);
      check(`Delete account (${u.email.slice(0, 5)}…)`, del.status === 200 && !data?.user, `HTTP ${del.status}`);
    }
    await admin.auth.admin.deleteUser(u.id).catch(() => {}); // never leave test users behind
  }
  // Sweep any test users left by an earlier crashed run.
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const x of list?.users ?? []) if (/^e2e[ab]\d+@example\.com$/.test(x.email ?? "")) await admin.auth.admin.deleteUser(x.id);
  console.log(`\n${pass} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
