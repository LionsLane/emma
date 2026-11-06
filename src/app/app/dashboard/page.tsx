"use client";

import { useEmma } from "@/lib/store";
import { money, num, pct, relTime, shortDate, summary } from "@/lib/metrics";
import { Meter, Panel, Stat } from "@/components/ui";
import { Sparkline } from "@/components/Charts";
import { IconCheck } from "@/components/icons";

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
