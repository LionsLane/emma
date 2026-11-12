"use client";

import { useEmma } from "@/lib/store";
import { money, num, pct, relTime, shortDate, summary } from "@/lib/metrics";
import { Meter, Panel, Stat } from "@/components/ui";
import { Sparkline } from "@/components/Charts";
import { IconCheck, IconGlobe } from "@/components/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { evaluate } from "@/lib/automations";

export default function Dashboard() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const m = summary(ws);
  const cur = ws.profile.currency;
  const hist = ws.history;
  const prev = hist[hist.length - 2];
  const curMonth = hist[hist.length - 1];
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const pace = curMonth ? Math.round((curMonth.leads / now.getDate()) * daysInMonth) : 0;
  const tasks = [...ws.tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));

  return (
    <div className="stack">

      <div className="grid cols-6">
        <Stat label="Leads this month" value={num(curMonth?.leads ?? m.newLeadsMonth)}
          foot={<>On pace for <span className={prev && pace >= prev.leads ? "up" : "down"}>{pace}</span>{prev ? ` · ${prev.leads} last month` : ""}</>} />
        <Stat label="Pipeline value" value={money(m.pipeline, cur, true)} foot={`${money(m.weighted, cur, true)} weighted · ${m.openLeads} open`} />
        <Stat label="Ad spend" value={money(m.spend, cur, true)} foot="Live and recent campaigns" />
        <Stat label="Return on ad spend" value={`${m.roas.toFixed(1)}×`} foot={`${money(m.revenue, cur, true)} attributed revenue`} />
        <Stat label="Email open rate" value={pct(m.openRate)} foot="Across everything sent" />
        <Stat label="Content scheduled" value={num(m.published)} foot={`of ${ws.calendar.length} calendar entries`} />
      </div>

      <div className="grid cols-2">
        <Funnel />
        <ReadyForYou />
      </div>

      <SearchHealth />

      <div className="grid cols-3">
        <Panel title="EMMA performance">
          <div className="stack" style={{ gap: 18 }}>
            <Meter label="Content quality" value={m.contentQuality} why="Share of calendar dossier fields complete" />
            <Meter label="Automation efficiency" value={m.automationEfficiency} why="Share of email automations running" />
            <Meter label="Lead engagement" value={m.leadEngagement} why="Open leads touched in the last 7 days" />
          </div>
        </Panel>

        <Panel title="Recent activity">
          <div className="list">
            {ws.activity.slice(0, 7).map((a) => (
              <div key={a.id} className="list-item">
                <span className={`bullet ${a.by === "emma" ? "emma" : ""}`} />
                <div className="small" style={{ flex: 1 }}>{a.text}</div>
                <span className="when">{relTime(a.at)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming tasks" hint={`${ws.tasks.filter((t) => !t.done).length} open`}>
          <div className="list">
            {tasks.slice(0, 8).map((t) => (
              <label key={t.id} className="list-item" style={{ cursor: "pointer", opacity: t.done ? 0.5 : 1 }}>
                <input type="checkbox" checked={t.done} onChange={() => patch("tasks", t.id, { done: !t.done })} style={{ marginTop: 4, accentColor: "var(--accent)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="small" style={{ fontWeight: 600, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                  <div className="small muted">{t.owner} · {t.area}</div>
                </div>
                <span className="when">{t.done ? <IconCheck width={14} /> : shortDate(t.due)}</span>
              </label>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid cols-3">
        <Panel title="Leads per month" hint="Last five full months">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="stat" style={{ padding: 0 }}><div className="value">{num(hist.reduce((s, h) => s + h.leads, 0))}</div><div className="foot">leads over six months</div></div>
            <Sparkline values={hist.slice(0, -1).map((h) => h.leads)} width={160} height={44} />
          </div>
        </Panel>
        <Panel title="Revenue per month" hint="Marketing-attributed · full months">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="stat" style={{ padding: 0 }}><div className="value">{money(curMonth?.revenue ?? 0, cur, true)}</div><div className="foot">this month so far</div></div>
            <Sparkline values={hist.slice(0, -1).map((h) => h.revenue)} width={160} height={44} />
          </div>
        </Panel>
        <Panel title="Spend per month" hint="All paid channels · full months">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="stat" style={{ padding: 0 }}><div className="value">{money(curMonth?.spend ?? 0, cur, true)}</div><div className="foot">this month so far</div></div>
            <Sparkline values={hist.slice(0, -1).map((h) => h.spend)} width={160} height={44} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SearchHealth() {
  // Select the stored arrays as-is; a fresh [] inside the selector would re-render forever.
  const storedAudits = useEmma((s) => s.ws.audits);
  const storedVis = useEmma((s) => s.ws.visibility);
  const audits = storedAudits ?? [];
  const a = audits[0], v = storedVis?.[0];
  if (!a) {
    return (
      <Panel title="Search & AI">
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <span className="small muted">See how Google, AI Overviews, ChatGPT-style assistants and voice search see your website.</span>
          <Link className="btn sm" href="/app/search"><IconGlobe />Run your first audit</Link>
        </div>
      </Panel>
    );
  }
  const top = [...a.checks].filter((c) => c.status !== "pass").sort((x, y) => (x.status === "fail" ? 0 : 1) - (y.status === "fail" ? 0 : 1) || y.weight - x.weight)[0];
  const pillars: [string, number, string][] = [["SEO", a.scores.seo, "Google and Bing results"], ["AIO", a.scores.aio, "Google AI Overviews"], ["GEO", a.scores.geo, "ChatGPT, Claude, Perplexity"], ["AXO", a.scores.axo, "Assistants and voice"]];
  return (
    <Panel title="Search & AI" hint={`${a.finalUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")} · ${relTime(a.at)}`} right={<Link className="btn ghost sm" href="/app/search">Open</Link>}>
      <div className="grid cols-3 dash-search">
        <div className="stat" style={{ padding: 0 }}>
          <div className="label">Search & AI score</div>
          <div className="value">{a.scores.overall}<span className="small muted"> / 100</span></div>
          <div className="foot">{audits.length > 1 ? <Sparkline values={[...audits].reverse().map((x) => x.scores.overall)} width={120} height={26} /> : "First audit"}</div>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          {pillars.map(([n, val, why]) => <Meter key={n} label={n} value={val / 100} why={why} />)}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <div className="small muted">AI visibility</div>
          <div style={{ fontWeight: 600 }}>{v ? `Named or cited in ${v.share}% of AI searches` : "Not checked yet"}</div>
          {top && <><div className="small muted" style={{ marginTop: 6 }}>Top fix</div><div className="small"><b>{top.label}.</b> {top.fix}</div></>}
        </div>
      </div>
    </Panel>
  );
}

// Click → lead → qualified → won. Clicks come from smart links (last 30 days, bots excluded);
// the lead stages are today's pipeline.
function Funnel() {
  const mode = useEmma((s) => s.mode);
  const wsId = useEmma((s) => s.wsId);
  const leads = useEmma((s) => s.ws.leads);
  const [clicks, setClicks] = useState<number | null>(null);
  useEffect(() => {
    if (mode !== "cloud" || !wsId) { setClicks(null); return; }
    let live = true;
    void fetch(`/api/links?workspaceId=${encodeURIComponent(wsId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { links?: { archived: boolean; stats?: { daily: number[] } }[] } | null) => {
        if (live) setClicks(b?.links ? b.links.reduce((a, l) => a + (l.stats?.daily.reduce((x, y) => x + y, 0) ?? 0), 0) : null);
      })
      .catch(() => live && setClicks(null));
    return () => { live = false; };
  }, [mode, wsId]);
  const qualified = leads.filter((l) => ["qualified", "proposal", "won"].includes(l.stage)).length;
  const won = leads.filter((l) => l.stage === "won").length;
  const steps: [string, number | null][] = [["Clicked a smart link (30 days)", clicks], ["Became leads", leads.length], ["Qualified or further", qualified], ["Won customers", won]];
  const max = Math.max(1, ...steps.map(([, v]) => v ?? 0));
  return (
    <Panel title="Growth funnel" right={<Link className="btn ghost sm" href="/app/links">Smart links</Link>}>
      <div className="stack" style={{ gap: 10 }}>
        {steps.map(([label, v], i) => {
          const prev = i > 0 ? steps[i - 1][1] : null;
          const rate = prev && v !== null && prev > 0 ? Math.round((v / prev) * 100) : null;
          return (
            <div key={label}>
              <div className="row" style={{ justifyContent: "space-between" }}><span className="small">{label}</span><span className="small"><b>{v === null ? "No links yet" : num(v)}</b>{rate !== null ? <span className="muted"> · {rate}%</span> : null}</span></div>
              <div className="meter-track" style={{ marginTop: 4 }}><div className="meter-fill" style={{ width: `${v === null ? 0 : Math.max(2, (v / max) * 100)}%` }} /></div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ReadyForYou() {
  const ws = useEmma((s) => s.ws);
  const { suggestions, heldForConsent } = useMemo(() => evaluate(ws), [ws]);
  const on = (ws.automations ?? []).filter((a) => a.enabled).length;
  return (
    <Panel title="Automations" right={<Link className="btn ghost sm" href="/app/automations">Open</Link>}>
      <div className="stack" style={{ gap: 8 }}>
        <div className="stat" style={{ padding: 0 }}><div className="label">Ready for you</div><div className="value">{num(suggestions.length)}</div><div className="foot">{on} automation{on === 1 ? "" : "s"} on{heldForConsent ? ` · ${heldForConsent} held for consent` : ""}</div></div>
        {suggestions.slice(0, 3).map((s) => <div key={s.key} className="small"><b>{s.target.kind === "lead" ? s.target.lead.name : s.target.keyDate.name}</b> <span className="muted">· {s.automationName}</span></div>)}
        {on === 0 && <Link className="small link" href="/app/automations">Turn on a recipe to get follow-ups lined up for you</Link>}
      </div>
    </Panel>
  );
}
