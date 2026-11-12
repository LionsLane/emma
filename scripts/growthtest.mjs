// Smart links end-to-end: create, redirect with UTM tags, people vs bots, isolation between
// workspaces, plan limit, switch off and on.
//   node scripts/growthtest.mjs [--app=http://localhost:5180]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const APP = (process.argv.find((a) => a.startsWith("--app="))?.slice(6) ?? "http://localhost:5180").replace(/\/$/, "");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failed = 0;
const check = (n, ok, d = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const PHONE_UA = "Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";
const users = [];

async function makeUser(tag) {
  const email = `e2egrowth${tag}${Date.now()}@example.com`;
  const { data: u } = await admin.auth.admin.createUser({ email, email_confirm: true });
  users.push(u.user.id);
  await admin.from("profiles").update({ onboarded: true }).eq("id", u.user.id);
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data: s } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  const h = { Authorization: `Bearer ${s.session.access_token}`, "Content-Type": "application/json" };
  const ws = await (await fetch(APP + "/api/workspaces", { method: "POST", headers: h, body: JSON.stringify({ name: `Test ${tag}` }) })).json();
  return { id: u.user.id, h, wsId: ws.id };
}

try {
  const a = await makeUser("a");
  const b = await makeUser("b");
  const create = (u, body) => fetch(APP + "/api/links", { method: "POST", headers: u.h, body: JSON.stringify({ workspaceId: u.wsId, ...body }) });
  const list = async (u, wsId = u.wsId) => (await fetch(`${APP}/api/links?workspaceId=${wsId}`, { headers: u.h })).json();

  const r1 = await create(a, { name: "Weekend offer", destination: "example.com/offer?ref=poster", channel: "whatsapp", utm: { campaign: "weekend" } });
  const l1 = (await r1.json()).link;
  check("Creates a link", r1.status === 201 && /^[a-z0-9]{7}$/.test(l1?.code ?? ""), l1?.code);

  const go = await fetch(`${APP}/l/${l1.code}`, { redirect: "manual", headers: { "User-Agent": PHONE_UA } });
  const loc = go.headers.get("location") ?? "";
  const u = loc ? new URL(loc) : null;
  check("Redirects to the destination", go.status === 302 && u?.hostname === "example.com" && u.pathname === "/offer", loc);
  check("Adds UTM tags, keeps existing ones", u?.searchParams.get("utm_source") === "whatsapp" && u?.searchParams.get("utm_medium") === "social" && u?.searchParams.get("utm_campaign") === "weekend" && u?.searchParams.get("ref") === "poster");
  await fetch(`${APP}/l/${l1.code}`, { redirect: "manual", headers: { "User-Agent": PHONE_UA } }); // same person again
  await fetch(`${APP}/l/${l1.code}`, { redirect: "manual", headers: { "User-Agent": "WhatsApp/2.24.1 A" } }); // link preview

  const s1 = (await list(a)).links?.find((x) => x.code === l1.code)?.stats;
  check("Counts people, not previews", s1?.clicks === 2 && s1?.unique === 1 && s1?.bots === 1, JSON.stringify({ clicks: s1?.clicks, unique: s1?.unique, bots: s1?.bots }));
  check("Device recorded", (s1?.devices?.mobile ?? 0) === 2);

  const bad = await create(a, { name: "Bad", destination: "javascript:alert(1)" });
  check("Refuses a javascript: destination", bad.status === 400);
  const loop = await create(a, { name: "Loop", destination: `${env.NEXT_PUBLIC_APP_URL}/l/${l1.code}` });
  check("Refuses a link to another smart link", loop.status === 400);

  const spy = await list(b, a.wsId);
  check("Other users can't see your links", (spy.links ?? []).length === 0, `saw ${(spy.links ?? []).length}`);
  const hijack = await fetch(`${APP}/api/links/${l1.code}`, { method: "PATCH", headers: b.h, body: JSON.stringify({ archived: true }) });
  check("Other users can't switch off your links", hijack.status === 404, `HTTP ${hijack.status}`);
  const intrude = await create(b, { name: "x", destination: "example.com" }); // b's own workspace: fine
  const intrude2 = await fetch(APP + "/api/links", { method: "POST", headers: b.h, body: JSON.stringify({ workspaceId: a.wsId, name: "x", destination: "example.com" }) });
  check("Can't create links in someone else's workspace", intrude.status === 201 && intrude2.status === 403, `own ${intrude.status}, theirs ${intrude2.status}`);

  for (let i = 0; i < 9; i++) await create(a, { name: `Link ${i}`, destination: "example.com" });
  const over = await create(a, { name: "Eleventh", destination: "example.com" });
  check("Free plan stops at 10 active links", over.status === 402, `HTTP ${over.status}`);

  const off = await fetch(`${APP}/api/links/${l1.code}`, { method: "PATCH", headers: a.h, body: JSON.stringify({ archived: true }) });
  const after = await fetch(`${APP}/l/${l1.code}`, { redirect: "manual", headers: { "User-Agent": PHONE_UA } });
  check("Switched-off link shows a not-active page", off.status === 200 && after.status === 404);
  await create(a, { name: "Replacement", destination: "example.com" });
  const on = await fetch(`${APP}/api/links/${l1.code}`, { method: "PATCH", headers: a.h, body: JSON.stringify({ archived: false }) });
  check("Switching on respects the plan limit", on.status === 402, `HTTP ${on.status}`);

  const nf = await fetch(`${APP}/l/zzzzzzz`, { redirect: "manual" });
  check("Unknown code is a 404", nf.status === 404);
} catch (e) { check("Test crashed", false, String(e)); }
finally {
  for (const id of users) {
    const { data: ws } = await admin.from("workspaces").select("id").eq("owner_id", id);
    for (const w of ws ?? []) await admin.from("workspaces").delete().eq("id", w.id);
    await admin.auth.admin.deleteUser(id);
  }
  console.log(failed ? `${failed} failed` : "all passed"); process.exit(failed ? 1 : 0);
}
