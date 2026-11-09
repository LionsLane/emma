"use client";

// Search & AI: one place to see and fix how a business shows up in Google (SEO), Google's AI
// Overviews (AIO), AI assistants like ChatGPT, Claude and Perplexity (GEO) and answer/voice
// assistants (AXO). Audits are measured facts; fixes are generated from the Business Profile.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { useEmma } from "@/lib/store";
import { safeHref } from "@/lib/safe";
import { relTime } from "@/lib/metrics";
import { Panel, Sk } from "@/components/ui";
import { Sparkline } from "@/components/Charts";
import { IconAlert, IconCheck, IconClose, IconGlobe, IconPlus, IconTrash } from "@/components/icons";
import { faqJsonLd, llmsTxt, localBusinessJsonLd, metaSuggestions, robotsFor } from "@/lib/search/generate";
import type { AuditCheck, AuditStatus, ClientProfile, Pillar, SearchAudit, VisibilityReport } from "@/lib/types";

const PILLARS: { id: Pillar; name: string; where: string }[] = [
  { id: "seo", name: "SEO", where: "Google and Bing results" },
  { id: "aio", name: "AIO", where: "Google AI Overviews" },
  { id: "geo", name: "GEO", where: "ChatGPT, Claude, Perplexity" },
  { id: "axo", name: "AXO", where: "Assistants and voice" },
];

const tone = (n: number) => (n >= 80 ? "ok" : n >= 50 ? "warn" : "risk");
const band = (n: number) => (n >= 80 ? "Strong" : n >= 50 ? "Needs work" : "Weak");

function StatusTag({ s }: { s: AuditStatus }) {
  if (s === "pass") return <span className="chip ok"><IconCheck />Pass</span>;
  if (s === "warn") return <span className="chip warn"><IconAlert />Improve</span>;
  return <span className="chip risk"><IconClose />Fix</span>;
}

function Ring({ value, size = 112 }: { value: number; size?: number }) {
  const r = (size - 12) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score ${value} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`var(--${tone(value)})`} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 0.6s var(--ease)" }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="var(--text)" fontSize={size / 3.6} fontWeight={600}>{value}</text>
    </svg>
  );
}

function useCopy() {
  const toast = useEmma((s) => s.toast);
  return async (text: string, what = "Copied") => {
    try { await navigator.clipboard.writeText(text); toast(`${what}.`, "ok"); }
    catch { toast("Couldn't copy. Select the text and copy it yourself.", "warn"); }
  };
}

export default function SearchPage() {
  const ws = useEmma((s) => s.ws);
  const mode = useEmma((s) => s.mode);
  const account = useEmma((s) => s.account);
  const saveAudit = useEmma((s) => s.saveAudit);
  const refreshAccount = useEmma((s) => s.refreshAccount);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  const p = ws.profile;
  const audits = ws.audits ?? [];
  const latest = audits[0];
  const prev = audits[1];
  const [url, setUrl] = useState(p.website || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!url.trim()) { setError("Enter your website address, like mybusiness.co.ke."); return; }
    setBusy(true);
    const res = await fetch("/api/search/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim(), business: { name: p.name, location: p.location } }) });
    const body = (await res.json().catch(() => ({}))) as SearchAudit & { error?: string; upgrade?: boolean };
    setBusy(false);
    if (!res.ok) { if (body.upgrade) openUpgrade(body.error ?? null); else setError(body.error ?? "The audit didn't finish. Try again."); return; }
    saveAudit(body);
    if (!p.website) useEmma.getState().updateProfile({ website: url.trim() });
    void refreshAccount();
  };

  const left = account?.limits.audits !== undefined ? Math.max(0, (account.limits.audits ?? 0) - (account.usage.audits ?? 0)) : null;

  return (
    <div className="stack">
      <Panel>
        <form onSubmit={run} className="row search-run" style={{ gap: 10, flexWrap: "wrap" }}>
          <label htmlFor="audit-url" className="sr-only">Website address</label>
          <input id="audit-url" className="input" style={{ flex: "1 1 260px" }} inputMode="url" autoComplete="url" placeholder="mybusiness.co.ke" value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} />
          <button className="btn ai" type="submit" disabled={busy}><IconGlobe />{busy ? "Auditing…" : latest ? "Run a new audit" : "Run audit"}</button>
          {mode === "cloud" && left !== null && <span className="small muted">{left} audit{left === 1 ? "" : "s"} left this month</span>}
        </form>
        {error && <div className="err" role="alert" style={{ marginTop: 10 }}>{error}</div>}
      </Panel>

      {busy && !latest && <AuditSkeleton />}
      {!busy && !latest && <EmptyState />}
      {latest && <Scoreboard a={latest} prev={prev} history={audits} busy={busy} />}
      {latest && <Fixes a={latest} profile={p} />}
      <Visibility profile={p} />
      <Generators profile={p} />
    </div>
  );
}

function EmptyState() {
  return (
    <Panel>
      <div className="stack" style={{ gap: 10, alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>See how Google and AI assistants see your business</h2>
        <p className="muted" style={{ margin: 0, maxWidth: 640 }}>EMMA checks your website for 30 signals across Google search, AI Overviews, ChatGPT-style assistants and voice search, then tells you exactly what to fix. Free plans get 5 audits a month.</p>
      </div>
    </Panel>
  );
}

function AuditSkeleton() {
  return (
    <div className="grid cols-5" aria-busy="true" aria-label="Running the audit">
      {[0, 1, 2, 3, 4].map((i) => <div key={i} className="glass panel stack" style={{ gap: 10 }}><Sk w={70} h={10} /><Sk w={90} h={28} /><Sk w="80%" h={9} /></div>)}
    </div>
  );
}

function Scoreboard({ a, prev, history, busy }: { a: SearchAudit; prev?: SearchAudit; history: SearchAudit[]; busy: boolean }) {
  const delta = (k: Pillar | "overall") => (prev ? a.scores[k] - prev.scores[k] : null);
  const fmt = (d: number | null) => (d === null || d === 0 ? null : <span className={d > 0 ? "up" : "down"}>{d > 0 ? `+${d}` : d}</span>);
  const fails = a.checks.filter((c) => c.status === "fail").length;
  return (
    <div className="grid search-scores" aria-busy={busy}>
      <section className="glass panel row" style={{ gap: 16, alignItems: "center" }}>
        <Ring value={a.scores.overall} />
        <div className="stack" style={{ gap: 4, minWidth: 0 }}>
          <div className="small muted">Search & AI score</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{band(a.scores.overall)} {fmt(delta("overall"))}</div>
          <div className="small muted" style={{ overflowWrap: "anywhere" }}>{a.finalUrl.replace(/^https?:\/\//, "")}</div>
          <div className="small faint">{relTime(a.at)} · {fails} to fix{history.length > 1 ? "" : ""}</div>
          {history.length > 1 && <Sparkline values={[...history].reverse().map((h) => h.scores.overall)} width={140} height={28} />}
        </div>
      </section>
      {PILLARS.map((pl) => (
        <section key={pl.id} className="glass panel stat" title={pl.where}>
          <div className="label">{pl.name}</div>
          <div className="value" style={{ color: `var(--${tone(a.scores[pl.id])})` }}>{a.scores[pl.id]} {fmt(delta(pl.id))}</div>
          <div className="foot">{pl.where}</div>
        </section>
      ))}
    </div>
  );
}

function Fixes({ a, profile }: { a: SearchAudit; profile: ClientProfile }) {
  const router = useRouter();
  const send = useEmma((s) => s.send);
  const copy = useCopy();
  const [pillar, setPillar] = useState<Pillar | "all">("all");
  const [showPassed, setShowPassed] = useState(false);
  const order = (c: AuditCheck) => (c.status === "fail" ? 0 : c.status === "warn" ? 1 : 2) * 10 - c.weight;
  const list = useMemo(() => a.checks.filter((c) => pillar === "all" || c.pillar === pillar).sort((x, y) => order(x) - order(y)), [a, pillar]);
  const open = list.filter((c) => c.status !== "pass");
  const passed = list.filter((c) => c.status === "pass");

  const askEmma = () => {
    const top = a.checks.filter((c) => c.status !== "pass").sort((x, y) => order(x) - order(y)).slice(0, 8);
    const brief = `My website ${a.finalUrl} scored ${a.scores.overall}/100 in EMMA's Search & AI audit (SEO ${a.scores.seo}, AIO ${a.scores.aio}, GEO ${a.scores.geo}, AXO ${a.scores.axo}). The top issues:\n${top.map((c) => `- ${c.label}: ${c.detail}`).join("\n")}\n\nWrite the fixes I can paste in: a better page title and meta description, an opening paragraph that answers what ${profile.name} is and who it serves, 5 FAQs customers in ${profile.location || "Kenya"} ask (with short answers), and any missing section copy. Save each as a library card for me to approve.`;
    void send(brief);
    router.push("/app");
  };

  return (
    <Panel title="What to fix" right={
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <div className="tabs" role="tablist" aria-label="Pillar">
          {(["all", "seo", "aio", "geo", "axo"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={pillar === k} className={pillar === k ? "on" : ""} onClick={() => setPillar(k)}>{k === "all" ? "All" : k.toUpperCase()}</button>
          ))}
        </div>
        {open.length > 0 && <button className="btn sm" onClick={askEmma}>Ask EMMA to write my fixes</button>}
      </div>
    }>
      {open.length === 0 ? (
        <div className="banner" role="status"><IconCheck />Nothing to fix here. Run a new audit after you change the site.</div>
      ) : (
        <div className="list">
          {open.map((c) => (
            <div key={c.id} className="list-item search-fix">
              <StatusTag s={c.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{c.label} <span className="small faint">{c.pillar.toUpperCase()}</span></div>
                <div className="small muted" style={{ overflowWrap: "anywhere" }}>{c.detail}</div>
                {c.fix && <div className="small" style={{ marginTop: 4 }}>{c.fix}</div>}
              </div>
              {c.fix && <button className="btn ghost sm" onClick={() => void copy(c.fix!, "Fix copied")} aria-label={`Copy the fix for ${c.label}`}>Copy</button>}
            </div>
          ))}
        </div>
      )}
      {passed.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button className="btn ghost sm" onClick={() => setShowPassed(!showPassed)} aria-expanded={showPassed}>{showPassed ? "Hide" : "Show"} {passed.length} passed check{passed.length === 1 ? "" : "s"}</button>
          {showPassed && (
            <div className="list" style={{ marginTop: 8 }}>
              {passed.map((c) => (
                <div key={c.id} className="list-item"><StatusTag s="pass" /><div className="small" style={{ flex: 1 }}><b>{c.label}</b> <span className="muted">{c.detail}</span></div></div>
              ))}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

function Visibility({ profile }: { profile: ClientProfile }) {
  const ws = useEmma((s) => s.ws);
  const mode = useEmma((s) => s.mode);
  const account = useEmma((s) => s.account);
  const saveVisibility = useEmma((s) => s.saveVisibility);
  const refreshAccount = useEmma((s) => s.refreshAccount);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  const reports = ws.visibility ?? [];
  const latest = reports[0];
  const city = profile.location.split(",")[0].trim() || "Kenya";
  const what = (profile.industry || profile.offerings[0]?.name || "business").toLowerCase();
  const [queries, setQueries] = useState<string[]>(() => latest?.queries.map((q) => q.query) ?? [`best ${what} in ${city}`, profile.offerings[0]?.name ? `${profile.offerings[0].name} ${city}` : `${what} near me ${city}`, `${profile.name} ${city} reviews`]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allowed = mode === "cloud" ? (account?.limits.visibility ?? 0) > 0 : false;
  const left = account ? Math.max(0, (account.limits.visibility ?? 0) - (account.usage.visibility ?? 0)) : 0;

  const run = async () => {
    setError(null);
    if (!allowed) { openUpgrade("AI-visibility checks are part of Pro and Max."); return; }
    const qs = queries.map((q) => q.trim()).filter((q) => q.length >= 3).slice(0, 3);
    if (!qs.length) { setError("Add at least one search to check."); return; }
    setBusy(true);
    const res = await fetch("/api/search/visibility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profile.name, website: profile.website, location: profile.location, queries: qs }) });
    const body = (await res.json().catch(() => ({}))) as VisibilityReport & { error?: string; upgrade?: boolean };
    setBusy(false);
    if (!res.ok) { if (body.upgrade) openUpgrade(body.error ?? null); else setError(body.error ?? "The check didn't finish. Try again."); return; }
    saveVisibility(body);
    void refreshAccount();
  };

  return (
    <Panel title="AI visibility" hint={latest ? relTime(latest.at) : undefined} right={
      <button className="btn sm" onClick={() => void run()} disabled={busy}>{busy ? "Asking AI search…" : allowed ? `Check now${mode === "cloud" ? ` (${left} left)` : ""}` : "Pro and Max"}</button>
    }>
      <div className="stack" style={{ gap: 12 }}>
        <div className="grid cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="field">
              <label htmlFor={`vq${i}`}>Search {i + 1}</label>
              <input id={`vq${i}`} className="input" maxLength={120} value={queries[i] ?? ""} onChange={(e) => setQueries((q) => { const n = [...q]; n[i] = e.target.value; return n; })} disabled={busy} />
            </div>
          ))}
        </div>
        {error && <div className="err" role="alert">{error}</div>}
        {busy && <div className="stack" style={{ gap: 8 }} aria-busy="true"><Sk w="40%" h={12} /><Sk w="90%" h={10} /><Sk w="70%" h={10} /></div>}
        {!busy && latest && (
          <>
            <div className="row" style={{ gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <Ring value={latest.share} size={84} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 600 }}>{latest.business} appears in {latest.share}% of these AI searches</div>
                {latest.summary && <div className="small muted">{latest.summary}</div>}
              </div>
            </div>
            <div className="list">
              {latest.queries.map((q) => (
                <div key={q.query} className="list-item" style={{ alignItems: "flex-start" }}>
                  <div className="stack" style={{ gap: 4, minWidth: 0, flex: 1 }}>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <b>&ldquo;{q.query}&rdquo;</b>
                      {q.mentioned ? <span className="chip ok"><IconCheck />Named</span> : <span className="chip risk"><IconClose />Not named</span>}
                      {q.cited ? <span className="chip ok"><IconCheck />Your site cited</span> : <span className="chip warn"><IconAlert />Site not cited</span>}
                    </div>
                    {q.competitors.length > 0 && <div className="small muted">Named instead: {q.competitors.join(", ")}</div>}
                    {q.note && <div className="small">{q.note}</div>}
                    {q.sources.length > 0 && (
                      <div className="small faint" style={{ overflowWrap: "anywhere" }}>
                        Sources: {q.sources.slice(0, 4).map((s, i) => { const h = safeHref(s.url); return <span key={s.url}>{i ? " · " : ""}{h ? <a className="link" href={h} target="_blank" rel="noopener noreferrer">{s.title || s.url}</a> : s.title}</span>; })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!busy && !latest && <p className="small muted" style={{ margin: 0 }}>EMMA searches like your customers do and shows whether AI answers name {profile.name || "your business"}, cite your website, or send people to someone else.</p>}
      </div>
    </Panel>
  );
}

type GenTab = "business" | "faq" | "llms" | "robots" | "meta";

function Generators({ profile }: { profile: ClientProfile }) {
  const update = useEmma((s) => s.updateProfile);
  const copy = useCopy();
  const [tab, setTab] = useState<GenTab>("business");
  const meta = metaSuggestions(profile);
  const out: Record<GenTab, { label: string; code: string; where: ReactNode }> = {
    business: { label: "Business schema", code: localBusinessJsonLd(profile), where: <>Paste inside the <code>&lt;head&gt;</code> of your home page.</> },
    faq: { label: "FAQ schema", code: faqJsonLd(profile) || "Add questions and answers below to generate FAQ schema.", where: <>Paste on the page that shows these questions.</> },
    llms: { label: "llms.txt", code: llmsTxt(profile), where: <>Save as <code>llms.txt</code> at the root of your site (yoursite.co.ke/llms.txt).</> },
    robots: { label: "AI crawler rules", code: robotsFor(profile), where: <>Add to <code>robots.txt</code> at the root of your site.</> },
    meta: { label: "Title & description", code: `<title>${meta.title}</title>\n<meta name="description" content="${meta.description.replace(/"/g, "&quot;")}">`, where: <>Replace the title and description in your home page&apos;s <code>&lt;head&gt;</code>.</> },
  };
  const cur = out[tab];
  const faqs = profile.faqs ?? [];
  const setFaq = (i: number, k: "q" | "a", v: string) => update({ faqs: faqs.map((f, n) => (n === i ? { ...f, [k]: v } : f)) });

  return (
    <Panel title="Fixes you can paste">
      <div className="stack" style={{ gap: 14 }}>
        <div className="tabs search-tabs" role="tablist" aria-label="Generated fix">
          {(Object.keys(out) as GenTab[]).map((k) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{out[k].label}</button>)}
        </div>
        <div className="small muted">{cur.where}</div>
        <pre className="search-code" tabIndex={0} aria-label={`${cur.label} code`}>{cur.code}</pre>
        <div className="row"><button className="btn primary sm" onClick={() => void copy(cur.code, `${cur.label} copied`)}>Copy {cur.label}</button></div>

        <details className="search-details">
          <summary>Business details these fixes use</summary>
          <div className="grid cols-3" style={{ marginTop: 12 }}>
            {([["phone", "Phone", "tel", "+254 7…"], ["whatsapp", "WhatsApp", "tel", "+254 7…"], ["email", "Email", "email", "hello@mybusiness.co.ke"], ["address", "Street address", "text", "Building, street, area"], ["hours", "Opening hours", "text", "Mo-Fr 08:00-18:00, Sa 09:00-14:00"]] as const).map(([k, label, type, ph]) => (
              <div key={k} className="field">
                <label htmlFor={`bd-${k}`}>{label}</label>
                <input id={`bd-${k}`} className="input" type={type} placeholder={ph} value={(profile[k] as string | undefined) ?? ""} onChange={(e) => update({ [k]: e.target.value } as Partial<ClientProfile>)} />
              </div>
            ))}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="bd-socials">Profiles (one link per line)</label>
              <textarea id="bd-socials" className="input" rows={3} placeholder={"https://g.page/…\nhttps://instagram.com/…"} value={(profile.socials ?? []).join("\n")} onChange={(e) => update({ socials: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 10) })} />
            </div>
          </div>
          <div className="stack" style={{ gap: 8, marginTop: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b className="small">Questions customers ask</b>
              <button className="btn ghost sm" onClick={() => update({ faqs: [...faqs, { q: "", a: "" }].slice(0, 12) })} disabled={faqs.length >= 12}><IconPlus />Add question</button>
            </div>
            {faqs.map((f, i) => (
              <div key={i} className="row search-faq" style={{ gap: 8, alignItems: "flex-start" }}>
                <input className="input" aria-label={`Question ${i + 1}`} placeholder="Do you deliver in Nairobi?" value={f.q} maxLength={160} onChange={(e) => setFaq(i, "q", e.target.value)} />
                <input className="input" aria-label={`Answer ${i + 1}`} placeholder="Yes, same day across Nairobi for orders before 2 pm." value={f.a} maxLength={400} onChange={(e) => setFaq(i, "a", e.target.value)} />
                <button className="btn ghost sm" aria-label={`Remove question ${i + 1}`} onClick={() => update({ faqs: faqs.filter((_, n) => n !== i) })}><IconTrash /></button>
              </div>
            ))}
            {faqs.length === 0 && <div className="small muted">No questions yet. Add the 5 you hear most often.</div>}
          </div>
          <p className="small faint" style={{ margin: "10px 0 0" }}>Name, industry, location, offerings and website come from your <Link className="link" href="/app/settings#business">Business Profile</Link>.</p>
        </details>
      </div>
    </Panel>
  );
}
