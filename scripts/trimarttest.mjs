// Practical test: EMMA working for TriMart Kenya on the live site.
// Builds a TriMart workspace from verified facts (LionsLane's TriMart records; list prices pulled from
// trimart.co.ke on 4 Nov 2026), runs real briefs on the Pro plan, approves the cards, checks the output
// against TriMart's standing rules, writes a report, then deletes the throwaway account.
//   node scripts/trimarttest.mjs [--app=https://emma.lionslane.co.ke] [--out=path.md]
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const APP = arg("app", env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "");
const OUT = arg("out", "../TriMartEmmaTest.md");
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, PUB = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(URL_, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

// ---- TriMart facts (no invented numbers: sales figures are unknown, so they are 0 and said so)
const PRICES = [ // trimart.co.ke list prices, 4 Nov 2026 (TriMart November calendar data); re-check before posting
  ["PS5", "Sony PlayStation PS5 Slim", "Gaming console", 101007],
  ["BUDS4", "Samsung Galaxy Buds 4", "Wireless earbuds", 21506],
  ["OMNIBOOK", "HP OmniBook X Flip 14 512GB/16GB", "Laptop", 123691],
  ["PARTYBOX", "JBL PartyBox 130", "Party speaker", 68265],
  ["SOUNDBAR", "JBL Soundbar 1000 MK2", "Soundbar", 147124],
  ["ECOFLOW", "EcoFlow River 3", "Portable power station", 36058],
  ["LEXAR", "Lexar Fingerprint F35 32GB", "Fingerprint USB drive", 4065],
];
const KEY_DATES = [
  ["2026-11-08", "Diwali", "holiday", "Greeting only. Store closed Sunday."],
  ["2026-11-11", "Singles Day (11.11)", "event", "Big online shopping day. Offers only if Victor approves; otherwise list price."],
  ["2026-11-13", "Mid-month payday window (13 to 16 Nov)", "season", "Typical pay cycle, not confirmed."],
  ["2026-11-20", "KCSE ends", "event", "Gift angle for parents opens. Do not aim gaming content at candidates."],
  ["2026-11-27", "Black Friday", "event", "Reveal day. Only approved offers."],
  ["2026-11-30", "Cyber Monday and Computer Security Day", "event", "Shop secure angle."],
];
const PROFILE = {
  name: "TriMart Kenya", tagline: "Kenya's trusted online tech marketplace", industry: "Online tech retail (Tricom Ecommerce Hub, under Tricom Technologies Ltd)",
  location: "NHC House, 2nd Floor, Kenyatta Avenue, Nairobi", currency: "KES", website: "https://trimart.co.ke", demo: false,
  sectors: ["B2C: James, the upgrade hunter (phones, audio, gaming)", "B2B: Wanjiku, the procurement lead (laptops and bulk orders)"],
  offerings: PRICES.map(([id, name, kind, price]) => ({ id, name, kind, price, description: `List price on trimart.co.ke, 4 Nov 2026. Re-check before posting. Sales figures not loaded.`, customers: 0, rating: 0, repeatRate: 0, revenue: 0 })),
  partners: [],
  keyDates: KEY_DATES.map(([date, name, kind, note], i) => ({ id: `kd${i + 1}`, date, name, kind, note })),
  brand: {
    voice: "Confident, helpful tech expert in plain Kenyan English. Short sentences. One clear next step: WhatsApp 0723 930 000 or trimart.co.ke.",
    pillars: ["100% genuine products", "Fast countrywide delivery", "Secure payment", "Warranty", "24/7 support"],
    doSay: ["Prices only from the offerings list (trimart.co.ke list prices)", "Label any projection as a projection", "Ask for missing facts instead of guessing"],
    dontSay: ["No em dashes, ever", "Never name competitors in public content", "No discounts, offers, bundles or price promises unless Victor has approved them", "No invented specs, stock levels or prices"],
    palette: { primary: "#3d7bff", accent: "#22e6d3", aiFrom: "#7c3aed", aiTo: "#db2777" },
  },
  compliance: { regime: "Kenya Data Protection Act 2019", regulator: "ODPC", notes: "Opt-in only, consent logged, no bought or cold lists." },
};
const BRIEFS = [
  "Plan TriMart's posts for Monday 9 to Sunday 15 November 2026 across Instagram, Facebook, TikTok and WhatsApp Status, around 11.11 on Wednesday and the mid-month payday window. Use only our list prices. No discounts or offers: none are approved yet.",
  "Write a WhatsApp Status post for the JBL PartyBox 130 at its list price.",
  "A customer asked our price for the PS5 Slim on WhatsApp three days ago and went quiet. Draft one friendly follow-up message we can send them.",
];
const COMPETITORS = /\b(jumia|kilimall|phoneplace|phone place|avechi|masoko|copia|safaricom shop|carrefour|naivas)\b/i;
const DISCOUNT = /(\d+\s?% ?off|discount|slashed|save kes|was kes|now only|bundle deal|buy one get|free gift)/i;
const LIST = new Set(PRICES.map((p) => p[3]));

const report = [];
const line = (s = "") => report.push(s);
let failures = 0;
const check = (name, ok, detail = "") => { if (!ok) failures++; const r = `${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`; console.log(r); line(`- ${ok ? "✅" : "❌"} ${name}${detail ? ` (${detail})` : ""}`); };
const pricesIn = (s) => [...s.matchAll(/KES\s?([\d,]{3,})/gi)].map((m) => Number(m[1].replace(/,/g, "")));

const email = `e2etrimart${Date.now()}@example.com`;
let userId = null;
try {
  const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw new Error(error.message);
  userId = created.user.id;
  await admin.from("subscriptions").update({ plan: "pro", status: "active", provider: "manual", current_period_end: new Date(Date.now() + 86400000).toISOString() }).eq("user_id", userId);
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const c = createClient(URL_, PUB, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: s, error: e1 } = await c.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  if (e1) throw new Error(e1.message);
  const token = s.session.access_token;
  const db = createClient(URL_, PUB, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const api = (p, body) => fetch(APP + p, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });

  const mk = await api("/api/workspaces", { name: "TriMart Kenya", profile: { industry: PROFILE.industry, location: PROFILE.location, website: PROFILE.website } });
  const ws = await mk.json();
  const { data: row } = await db.from("workspaces").select("data,version").eq("id", ws.id).single();
  const data = { ...row.data, profile: { ...row.data.profile, ...PROFILE } };
  const { data: saved } = await db.from("workspaces").update({ data, version: row.version + 1, updated_at: new Date().toISOString() }).eq("id", ws.id).eq("version", row.version).select("version");
  const acct = await (await api("/api/account")).json();

  line(`# EMMA practical test: TriMart Kenya`);
  line();
  line(`Run on ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} (Nairobi) against ${APP}, plan **${acct.plan?.name}** (${acct.plan?.model}).`);
  line();
  line(`TriMart's workspace was built only from LionsLane's TriMart records: 7 products at their trimart.co.ke list prices from 4 Nov 2026, 6 November key dates, the brand pillars and TriMart's standing rules (no em dashes, no competitor names, no unapproved offers, prices only from the list). Sales figures are not loaded, so EMMA has none to quote.`);
  line();
  check("TriMart workspace saved", saved?.length === 1);
  check("Test account is on Pro", acct.plan?.id === "pro", acct.plan?.model);

  let conversationId;
  for (const [i, brief] of BRIEFS.entries()) {
    line(); line(`## Brief ${i + 1}`); line(); line(`> ${brief}`); line();
    const t0 = Date.now();
    const res = await api("/api/emma", { workspaceId: ws.id, conversationId, text: brief });
    const events = (await res.text()).split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    conversationId = events.find((e) => e.type === "conversation")?.id ?? conversationId;
    const text = events.filter((e) => e.type === "text").map((e) => e.text).join("");
    const props = events.filter((e) => e.type === "proposal").map((e) => e.proposal);
    const err = events.find((e) => e.type === "error");
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    check(`Brief ${i + 1} answered`, res.ok && !err, err ? err.message : `${secs}s, ${props.length} card(s)`);
    line(); line(`**EMMA's note:**`); line(); line(text.trim().split("\n").map((l) => `> ${l}`).join("\n")); line();
    for (const p of props) {
      line(`**Card: ${p.kind}, "${p.title}"** (${p.items.length} item${p.items.length === 1 ? "" : "s"})`); line();
      if (p.summary) line(`${p.summary}`), line();
      if (p.reviewNote) line(`*Review note:* ${p.reviewNote}`), line();
      for (const it of p.items.slice(0, 12)) {
        const head = [it.publishDate || it.date, it.platform, it.contentType || it.type, it.title || it.angle || it.name || it.subject].filter(Boolean).join(" · ");
        line(`- **${head}**`);
        const body = it.copy || it.body || it.notes || "";
        if (body) line(`  ${String(body).replace(/\n+/g, " ")}`);
      }
      line();
    }
    const all = text + "\n" + JSON.stringify(props);
    check(`Brief ${i + 1}: no em dashes`, !all.includes("—"));
    check(`Brief ${i + 1}: no competitor names`, !COMPETITORS.test(all), (all.match(COMPETITORS) || [])[0]);
    // Customer-facing copy only: EMMA's notes to the team may say "no discounts are approved".
    const pub = props.flatMap((p) => p.items).map((it) => [it.copy, it.body, it.headline, it.subject, ...(it.steps ?? []).map((s) => `${s.subject} ${s.body}`)].filter(Boolean).join(" ")).join("\n");
    check(`Brief ${i + 1}: customer copy has no unapproved discount language`, !DISCOUNT.test(pub), (pub.match(DISCOUNT) || [])[0]);
    const off = pricesIn(all).filter((n) => !LIST.has(n) && n >= 1000);
    check(`Brief ${i + 1}: every price is a TriMart list price`, off.length === 0, off.length ? `not on the list: ${[...new Set(off)].join(", ")}` : "");
    for (const p of props) {
      const ap = await api(`/api/proposals/${p.id}`, { action: "approve" });
      const body = await ap.json();
      check(`Approve card "${p.title}"`, ap.status === 200 && body.status === "approved", `added ${body.added ?? 0}`);
    }
  }

  const { data: after } = await db.from("workspaces").select("data").eq("id", ws.id).single();
  const { data: usage } = await db.from("usage_events").select("model,cost_usd,completed").eq("user_id", userId);
  const cost = (usage ?? []).reduce((a, u) => a + Number(u.cost_usd), 0);
  line(); line(`## After approving`); line();
  line(`- Planner entries: ${after.data.calendar?.length ?? 0}`);
  line(`- Library items: ${after.data.library?.length ?? 0}`);
  line(`- Leads: ${after.data.leads?.length ?? 0}`);
  line(`- Emails and sequences: ${after.data.emails?.length ?? 0}`);
  line(`- AI cost for the three briefs: USD ${cost.toFixed(4)} (${usage?.length ?? 0} metered requests)`);
  line();
} catch (err) {
  check("Test crashed", false, err instanceof Error ? err.message : String(err));
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
  line(`## Result`); line(); line(failures ? `${failures} check(s) failed. See the ❌ lines above.` : "Every check passed.");
  line(); line(`The throwaway test account and its workspace were deleted after the run.`);
  writeFileSync(OUT, report.join("\n") + "\n", "utf8");
  console.log(`\nreport: ${OUT}\n${failures ? failures + " failed" : "all passed"}`);
  process.exit(failures ? 1 : 0);
}
