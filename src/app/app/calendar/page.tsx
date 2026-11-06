"use client";

import { hostOf, safeHref } from "@/lib/safe";
import { useMemo, useState } from "react";
import { useEmma } from "@/lib/store";
import { dossierCompleteness, pct, shortDate } from "@/lib/metrics";
import type { CalendarEntry, EntryStatus } from "@/lib/types";
import { Dossier, PageIntro, Panel, Sheet } from "@/components/ui";
import { IconPen, IconTrash } from "@/components/icons";

const STATUSES: EntryStatus[] = ["idea", "drafting", "in review", "scheduled", "published"];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const remove = useEmma((s) => s.remove);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const [view, setView] = useState<"month" | "list">("month");
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [platform, setPlatform] = useState("");
  const [sector, setSector] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const toast = useEmma((s) => s.toast);
  // Moving a post keeps its prep schedule: draft and review shift by the same number of days.
  const reschedule = (id: string, to: string) => {
    const e = ws.calendar.find((x) => x.id === id);
    if (!e || e.date === to) return;
    const shift = (iso: string) => {
      if (!iso) return iso;
      const delta = (new Date(to).getTime() - new Date(e.date).getTime());
      return new Date(new Date(iso).getTime() + delta).toISOString().slice(0, 10);
    };
    patch("calendar", id, { date: to, publishDate: to, draftDue: shift(e.draftDue), reviewDate: shift(e.reviewDate) });
    toast(`Moved to ${new Date(to).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.`, "info");
  };

  const entries = ws.calendar.filter((e) => (!platform || e.platform === platform) && (!sector || e.sector === sector));
  const open = ws.calendar.find((e) => e.id === openId) ?? null;
  const platforms = [...new Set(ws.calendar.map((e) => e.platform))];
  const offeringName = (id: string) => ws.profile.offerings.find((o) => o.id === id)?.name ?? id;

  const days = useMemo(() => {
    const first = new Date(cursor);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7)); // back to Monday
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);

  const today = ymd(new Date());
  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const move = (n: number) => setCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + n); return d; });

  const askDraft = (e: CalendarEntry) => {
    setOpenId(null);
    setDrawer(true);
    void send(`Write the copy for this calendar entry and save it to the library: "${e.angle}" (${e.contentType} on ${e.platform}, ${shortDate(e.date)}, offering ${e.linkedOffering}, audience: ${e.audienceSegment}). Follow the platform best practice: ${e.bestPractice}.`);
  };

  return (
    <div>
      <PageIntro
        title="Content Calendar"
        right={
          <div className="row">
            <select className="select sm" value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Filter by platform">
              <option value="">All platforms</option>{platforms.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select className="select sm" value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Filter by sector">
              <option value="">All sectors</option>{ws.profile.sectors.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="tabs" role="tablist">
              <button className={view === "month" ? "on" : ""} onClick={() => setView("month")}>Month</button>
              <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>Dossiers</button>
            </div>
            <button className="btn ai sm" onClick={() => { setDrawer(true); void send("Build a content calendar for the next four weeks around our key dates. Fill every dossier field."); }}>
              <IconPen />Plan with EMMA
            </button>
          </div>
        }
      />

      {view === "month" ? (
        <Panel
          title={monthLabel}
          right={<><button className="btn sm" onClick={() => move(-1)} aria-label="Previous month">‹</button><button className="btn sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</button><button className="btn sm" onClick={() => move(1)} aria-label="Next month">›</button></>}
        >
          <div className="cal">
            {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {days.map((d) => {
              const key = ymd(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const dayEntries = entries.filter((e) => e.date === key);
              const keyDates = ws.profile.keyDates.filter((k) => k.date === key);
              const cls = `cal-day ${inMonth ? "" : "out"} ${key === today ? "today" : ""} ${!dayEntries.length && !keyDates.length ? "empty-day" : ""}`;
              return (
                <div
                  key={key}
                  className={`${cls} ${dropKey === key ? "drop" : ""}`}
                  onDragOver={(ev) => { ev.preventDefault(); if (dropKey !== key) setDropKey(key); }}
                  onDragLeave={(ev) => { if (!ev.currentTarget.contains(ev.relatedTarget as Node)) setDropKey(null); }}
                  onDrop={(ev) => { ev.preventDefault(); setDropKey(null); const id = ev.dataTransfer.getData("text/plain"); if (id) reschedule(id, key); }}
                >
                  <div className="d"><span>{d.getDate()}</span><span className="faint">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span></div>
                  {keyDates.map((k) => <div key={k.id} className="keydate">★ {k.name}</div>)}
                  {dayEntries.map((e) => (
                    <button key={e.id} className={`cal-entry s-${e.status}`} onClick={() => setOpenId(e.id)} title={`${e.platform}: ${e.angle}. Drag to reschedule`}
                      draggable onDragStart={(ev) => { ev.dataTransfer.setData("text/plain", e.id); ev.dataTransfer.effectAllowed = "move"; }}>
                      <b>{e.platform}</b> · {e.angle}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="row small muted" style={{ marginTop: 12, gap: 16 }}>
            <span><span style={{ color: "var(--faint)" }}>▍</span> Idea</span>
            <span><span style={{ color: "var(--primary)" }}>▍</span> Drafting</span>
            <span><span style={{ color: "var(--warn)" }}>▍</span> In review</span>
            <span><span style={{ color: "var(--ok)" }}>▍</span> Scheduled / published</span>
            <span style={{ color: "var(--warn)" }}>★ Key date</span>
          </div>
        </Panel>
      ) : (
        <Panel title="All entries" hint={`${entries.length} entries`}>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Date</th><th>Platform</th><th>Angle</th><th>Sector</th><th>Offering</th><th>KPI</th><th>Owner</th><th>Dossier</th><th>Status</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="click" onClick={() => setOpenId(e.id)}>
                    <td className="mono small">{shortDate(e.date)}</td>
                    <td><span className="chip accent">{e.platform}</span></td>
                    <td className="strong" style={{ minWidth: 240 }}>{e.angle}<div className="sub">{e.contentType}</div></td>
                    <td className="small">{e.sector}</td>
                    <td className="small">{offeringName(e.linkedOffering)}</td>
                    <td className="small">{e.kpi}</td>
                    <td className="small">{e.owner}</td>
                    <td className="num">{pct(dossierCompleteness(e))}</td>
                    <td><span className={`chip ${e.status === "scheduled" || e.status === "published" ? "ok" : e.status === "in review" ? "warn" : ""}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Sheet
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        kicker={open ? `${open.platform} · ${open.contentType} · ${shortDate(open.date)}` : ""}
        title={open?.angle ?? ""}
        foot={open && (
          <div className="row">
            <select className="select sm" value={open.status} onChange={(e) => patch("calendar", open.id, { status: e.target.value as EntryStatus })} aria-label="Status">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn ai sm" onClick={() => askDraft(open)}><IconPen />Draft copy with EMMA</button>
            <button className="btn ghost sm danger right" onClick={() => { remove("calendar", open.id); setOpenId(null); }}><IconTrash />Delete</button>
          </div>
        )}
      >
        {open && (
          <div className="stack">
            <Dossier rows={[
              ["Date", shortDate(open.date)], ["Sector", open.sector], ["Content type", open.contentType], ["Platform", open.platform],
              ["Angle", open.angle], ["Featured business", open.featuredBusiness], ["Website", safeHref(open.website) ? <a className="link" href={safeHref(open.website)} target="_blank" rel="noreferrer noopener">{hostOf(open.website)}</a> : open.website],
              ["Key contact", open.keyContact], ["Email", open.email], ["Phone", open.phone], ["Social handle", open.socialHandle],
              ["Linked offering", offeringName(open.linkedOffering)], ["Objective", open.objective], ["KPI", open.kpi],
              ["Audience segment", open.audienceSegment], ["Content mix", open.contentMix], ["Best practice", open.bestPractice],
              ["Theme pillar", open.themePillar], ["Owner", open.owner], ["Draft due", shortDate(open.draftDue)], ["Review date", shortDate(open.reviewDate)],
              ["Publish date", shortDate(open.publishDate)], ["Asset link", open.assetLink], ["Repurposing plan", open.repurposingPlan], ["Campaign", open.campaign],
            ]} />
            <div className="field">
              <label htmlFor="copy">Post copy</label>
              <textarea id="copy" className="textarea" rows={7} value={open.copy ?? ""} placeholder="No copy yet. Write it here or ask EMMA to draft it."
                onChange={(e) => patch("calendar", open.id, { copy: e.target.value })} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
