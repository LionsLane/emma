"use client";

import { useState } from "react";
import { useEmma } from "@/lib/store";
import { clickRate, num, openRate, pct, shortDate } from "@/lib/metrics";
import type { EmailItem } from "@/lib/types";
import { Dossier, PageIntro, Panel, Sheet, Stat } from "@/components/ui";
import { HBars } from "@/components/Charts";
import { IconMail, IconPause, IconPlay, IconTrash } from "@/components/icons";

type Tab = "campaigns" | "automations" | "analytics";

export default function EmailHub() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const remove = useEmma((s) => s.remove);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const [tab, setTab] = useState<Tab>("campaigns");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = ws.emails.find((e) => e.id === openId) ?? null;
  const broadcasts = ws.emails.filter((e) => e.kind === "broadcast");
  const automations = ws.emails.filter((e) => e.kind === "automation");
  const sent = ws.emails.filter((e) => e.sent > 0);
  const totals = sent.reduce((t, e) => ({ sent: t.sent + e.sent, opens: t.opens + e.opens, clicks: t.clicks + e.clicks }), { sent: 0, opens: 0, clicks: 0 });
  const ask = (p: string) => { setOpenId(null); setDrawer(true); void send(p); };

  return (
    <div className="stack">
      <PageIntro
        title="Email Hub"
        right={
          <div className="row">
            <div className="tabs" role="tablist">
              {(["campaigns", "automations", "analytics"] as Tab[]).map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
            </div>
            <button className="btn ai sm" onClick={() => ask("Draft our next email: look at what's coming up on the calendar and what our audience opened last time.")}><IconMail />Draft with EMMA</button>
          </div>
        }
      />

      {tab === "campaigns" && <EmailTable items={broadcasts} onOpen={setOpenId} />}
      {tab === "automations" && (
        <Panel title="Automations" hint={`${automations.filter((a) => a.status === "running").length} running`}>
          <div className="stack" style={{ gap: 10 }}>
            {automations.map((a) => (
              <div key={a.id} className="glass" style={{ padding: 14, cursor: "pointer" }} onClick={() => setOpenId(a.id)}>
                <div className="row">
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div className="small muted">{a.audience} · {a.steps.length} steps over {a.steps.at(-1)?.delayDays ?? 0} days</div>
                  </div>
                  <span className={`chip ${a.status === "running" ? "ok" : "warn"}`}>{a.status}</span>
                  <span className="small mono muted">{a.sent ? `${pct(openRate(a))} open · ${pct(clickRate(a))} click` : "not sent yet"}</span>
                  <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); patch("emails", a.id, { status: a.status === "running" ? "paused" : "running" }); }} aria-label={a.status === "running" ? "Pause" : "Run"}>
                    {a.status === "running" ? <IconPause /> : <IconPlay />}
                  </button>
                </div>
                <div className="row small" style={{ marginTop: 10, gap: 6 }}>
                  {a.steps.map((s, i) => <span key={i} className="chip">Day {s.delayDays}: {s.subject}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {tab === "analytics" && (
        <>
          <div className="grid cols-4">
            <Stat label="Emails sent" value={num(totals.sent)} />
            <Stat label="Open rate" value={pct(totals.sent ? totals.opens / totals.sent : 0)} />
            <Stat label="Click rate" value={pct(totals.sent ? totals.clicks / totals.sent : 0, 1)} />
            <Stat label="Click-to-open" value={pct(totals.opens ? totals.clicks / totals.opens : 0)} />
          </div>
          <div className="grid cols-2">
            <Panel title="Open rate by email">
              <HBars rows={sent.map((e) => ({ label: e.name, value: openRate(e), note: `${num(e.sent)} sent` }))} format={(n) => pct(n)} max={1} />
            </Panel>
            <Panel title="Top subject lines" hint="By open rate">
              <div className="list">
                {[...sent].sort((a, b) => openRate(b) - openRate(a)).map((e) => (
                  <div key={e.id} className="list-item"><div style={{ flex: 1 }} className="small">“{e.subject}”</div><span className="mono small">{pct(openRate(e))}</span></div>
                ))}
              </div>
              <p className="small faint" style={{ marginBottom: 0 }}>Best send times appear once your email provider is connected.</p>
            </Panel>
          </div>
        </>
      )}

      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} kicker={open ? `${open.kind} · ${open.status}` : ""} title={open?.name ?? ""}
        foot={open && (
          <div className="row">
            <button className="btn ai sm" onClick={() => ask(`Improve the email "${open.name}" (id ${open.id}): sharper subject line options and a tighter body. Propose it as a new version.`)}>Improve with EMMA</button>
            <button className="btn ghost sm danger right" onClick={() => { remove("emails", open.id); setOpenId(null); }}><IconTrash />Delete</button>
          </div>
        )}
      >
        {open && (
          <div className="stack">
            <Dossier rows={[
              ["Audience", open.audience], ["Subject", open.subject], ["Scheduled", shortDate(open.scheduledFor)],
              ["Sent", num(open.sent)], ["Open rate", open.sent ? pct(openRate(open)) : ""], ["Click rate", open.sent ? pct(clickRate(open), 1) : ""],
            ]} />
            {open.body && <div className="field"><label>Body</label><pre className="glass" style={{ whiteSpace: "pre-wrap", padding: 12, margin: 0, fontFamily: "inherit", fontSize: 13 }}>{open.body}</pre></div>}
            {open.steps.map((s, i) => (
              <div key={i} className="glass" style={{ padding: 12 }}>
                <div className="small muted">Step {i + 1} · day {s.delayDays}</div>
                <div style={{ fontWeight: 600, margin: "2px 0 6px" }}>{s.subject}</div>
                <div className="small" style={{ whiteSpace: "pre-wrap", color: "var(--text-2)" }}>{s.body}</div>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}

function EmailTable({ items, onOpen }: { items: EmailItem[]; onOpen: (id: string) => void }) {
  return (
    <Panel title="Broadcasts" hint={`${items.length} total`}>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Email</th><th>Audience</th><th>Status</th><th>Date</th><th className="num">Sent</th><th className="num">Open</th><th className="num">Click</th></tr></thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="click" onClick={() => onOpen(e.id)}>
                <td style={{ minWidth: 220 }}><div className="strong">{e.name}</div><div className="sub">“{e.subject}”</div></td>
                <td className="small">{e.audience}</td>
                <td><span className={`chip ${e.status === "sent" ? "ok" : e.status === "scheduled" ? "accent" : ""}`}>{e.status}</span></td>
                <td className="small mono">{shortDate(e.scheduledFor)}</td>
                <td className="num">{num(e.sent)}</td>
                <td className="num">{e.sent ? pct(openRate(e)) : "—"}</td>
                <td className="num">{e.sent ? pct(clickRate(e), 1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
