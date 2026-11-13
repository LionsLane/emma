"use client";

import { useRef, useState } from "react";
import { cleanTag, leadsFromCsv } from "@/lib/audience";
import { useEmma } from "@/lib/store";
import { leadTemp, money, shortDate, STAGE_WEIGHT, STAGES } from "@/lib/metrics";
import { hostOf, normaliseKenyanPhone, safeHref } from "@/lib/safe";
import type { Lead, LeadStage } from "@/lib/types";
import { Dossier, PageIntro, Panel, Sheet } from "@/components/ui";
import { IconAlert, IconCheck, IconSearch, IconTrash, IconUsers } from "@/components/icons";

export default function Leads() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const remove = useEmma((s) => s.remove);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const [stage, setStage] = useState<LeadStage | "">("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const toast = useEmma((s) => s.toast);
  const move = (id: string, to: LeadStage) => {
    const l = ws.leads.find((x) => x.id === id);
    if (!l || l.stage === to) return;
    patch("leads", id, { stage: to, lastTouch: new Date().toISOString().slice(0, 10) });
    toast(`${l.name || l.company} moved to ${to}.`, to === "won" ? "ok" : "info");
  };
  const [openId, setOpenId] = useState<string | null>(null);
  const importLeads = useEmma((s) => s.importLeads);
  const account = useEmma((s) => s.account);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tagDraft, setTagDraft] = useState("");

  // Spreadsheet import: CSV with a header row. Duplicates (same email or phone) are left out,
  // and the plan's lead allowance is respected.
  const onImport = async (f: File) => {
    if (f.size > 1_000_000) { toast("That file is over 1 MB. Split it into smaller files.", "warn"); return; }
    const r = leadsFromCsv(await f.text(), ws.leads);
    if (!r.columns.length || !r.leads.length) { toast(r.duplicates ? `Nothing new: all ${r.duplicates} rows are already in your leads.` : "No leads found. The first row needs column names like Name, Phone, Email.", "warn"); return; }
    const capLabel = account?.limits.leads ?? "Unlimited";
    const cap = /^\d/.test(capLabel) ? Number(capLabel.replace(/,/g, "")) : Number.POSITIVE_INFINITY;
    const room = Math.max(0, cap - ws.leads.length);
    if (room === 0) { openUpgrade(`Your plan stores ${capLabel} leads. Upgrade to import more.`); return; }
    const take = r.leads.slice(0, room);
    const consented = take.filter((l) => l.consent).length;
    const lines = [
      `Import ${take.length} lead${take.length === 1 ? "" : "s"}?`,
      "",
      `${consented} marked as agreed to marketing (from your Consent column).`,
      ...(r.duplicates ? [`${r.duplicates} duplicate${r.duplicates === 1 ? "" : "s"} left out.`] : []),
      ...(r.leads.length > take.length ? [`${r.leads.length - take.length} left out: your plan stores ${capLabel} leads.`] : []),
      "",
      "Only mark consent for people who agreed to hear from you.",
    ];
    if (!window.confirm(lines.join("\n"))) return;
    importLeads(take);
    toast(`Imported ${take.length} lead${take.length === 1 ? "" : "s"}.`, "ok");
  };
  const addTag = (id: string, current: string[] | undefined) => {
    const t = cleanTag(tagDraft);
    if (!t) return;
    patch("leads", id, { tags: [...new Set([...(current ?? []), t])].slice(0, 10) });
    setTagDraft("");
  };
  const cur = ws.profile.currency;
  const open = ws.leads.find((l) => l.id === openId) ?? null;

  const rows = ws.leads
    .filter((l) => (!stage || l.stage === stage) && (!q || `${l.name} ${l.company} ${l.role} ${l.source} ${(l.tags ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.score - a.score);
  const openLeads = ws.leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const forecast = openLeads.reduce((s, l) => s + l.value * STAGE_WEIGHT[l.stage], 0);
  const ask = (p: string) => { setOpenId(null); setDrawer(true); void send(p); };

  return (
    <div className="stack">
      <PageIntro
        title="Lead Management"
        right={
          <div className="row">
            <input className="input sm" style={{ width: 190 }} placeholder="Search leads" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
            <div className="tabs" role="tablist" aria-label="View">
              <button role="tab" aria-selected={view === "board"} className={view === "board" ? "on" : ""} onClick={() => setView("board")}>Board</button>
              <button role="tab" aria-selected={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
            </div>
            <button className="btn sm" onClick={() => fileRef.current?.click()}>Import CSV</button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onImport(f); }} />
            <button className="btn sm" onClick={() => ask("Propose the next touch for every hot and warm open lead, and add tasks for the team.")}><IconUsers />Nurture plan</button>
            <button className="btn ai sm" onClick={() => ask("Research real businesses in our area that fit our best customers and propose them as leads. Only include contact details you can source, with the source link.")}><IconSearch />Find prospects</button>
          </div>
        }
      />

      <div className="small muted">Weighted forecast <b className="mono" style={{ color: "var(--text)" }}>{money(forecast, cur, true)}</b> from {openLeads.length} open leads</div>

      {view === "board" ? (
        <Board leads={rows} cur={cur} onOpen={setOpenId} onMove={move} />
      ) : (<>
      <div className="pipe">
        {STAGES.map((s) => {
          const inStage = ws.leads.filter((l) => l.stage === s);
          return (
            <button key={s} className="pipe-col" onClick={() => setStage(stage === s ? "" : s)} style={{ textAlign: "left", cursor: "pointer", borderColor: stage === s ? "var(--accent)" : undefined }} aria-pressed={stage === s}>
              <div className="s">{s}</div>
              <div className="n">{inStage.length}</div>
              <div className="v">{money(inStage.reduce((t, l) => t + l.value, 0), cur, true)}</div>
            </button>
          );
        })}
      </div>

      <Panel title={stage ? `Stage: ${stage}` : "All leads"}>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Lead</th><th>Contact</th><th>Source</th><th>Stage</th><th className="num">Score</th><th className="num">Value</th><th>Last touch</th><th>Flags</th></tr></thead>
            <tbody>
              {rows.map((l) => {
                const temp = leadTemp(l);
                return (
                  <tr key={l.id} className="click" onClick={() => setOpenId(l.id)}>
                    <td style={{ minWidth: 180 }}><div className="strong">{l.name || "—"}</div><div className="sub">{l.role ? `${l.role}, ` : ""}{l.company}</div></td>
                    <td className="small" style={{ minWidth: 190 }}>{l.email || <span className="faint">no email</span>}<div className="sub">{l.phone}</div></td>
                    <td className="small">{l.source}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select className="select sm" value={l.stage} onChange={(e) => patch("leads", l.id, { stage: e.target.value as LeadStage, lastTouch: new Date().toISOString().slice(0, 10) })} aria-label={`Stage for ${l.name}`}>
                        {STAGES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="num"><span className={`chip ${temp}`}>{temp} · {l.score}</span></td>
                    <td className="num">{money(l.value, cur, true)}</td>
                    <td className="small mono">{shortDate(l.lastTouch)}</td>
                    <td>
                      <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
                        {!l.verified && <span className="chip warn" title="Researched by EMMA: verify before contacting"><IconAlert />Unverified</span>}
                        {!l.consent && <span className="chip risk" title="No marketing consent recorded: one-to-one contact only"><IconAlert />No consent</span>}
                        {l.verified && l.consent && <span className="chip ok"><IconCheck />Clear</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty">No leads match.</div>}
        </div>
      </Panel>
      </>)}

      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} kicker={open?.company} title={open?.name || open?.company || ""}
        foot={open && (
          <div className="row">
            <button className="btn ai sm" onClick={() => ask(`Draft the next message to ${open.name || open.company} at ${open.company} (lead ${open.id}, stage ${open.stage}). Respect their consent status and suggest the right channel.`)}>Draft next touch</button>
            {!open.verified && <button className="btn sm" onClick={() => patch("leads", open.id, { verified: true })}><IconCheck />Mark verified</button>}
            {!open.consent && <button className="btn sm" onClick={() => patch("leads", open.id, { consent: true })}>Record consent</button>}
            <button className="btn ghost sm danger right" onClick={() => { remove("leads", open.id); setOpenId(null); }} aria-label="Delete lead"><IconTrash /></button>
          </div>
        )}
      >
        {open && (
          <div className="stack">
            {(!open.verified || !open.consent) && (
              <div className="proposal-review">
                <IconAlert width={16} height={16} style={{ flex: "none" }} />
                <span>{!open.verified && "Contact details came from EMMA's research. Verify them before reaching out. "}{!open.consent && "No marketing consent on record: contact one-to-one only, never add to broadcasts."}</span>
              </div>
            )}
            <div className="field">
              <label htmlFor="lead-stage">Stage</label>
              <select id="lead-stage" className="select" value={open.stage} onChange={(e) => move(open.id, e.target.value as LeadStage)}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Dossier rows={[
              ["Company", open.company], ["Role", open.role],
              ["Email", open.email ? <a className="link" href={`mailto:${open.email}`}>{open.email}</a> : ""],
              ["Phone", open.phone ? <span className="row" style={{ gap: 8 }}><a className="link" href={`tel:${open.phone.replace(/\s/g, "")}`}>{open.phone}</a>{normaliseKenyanPhone(open.phone) && <a className="link" href={`https://wa.me/${normaliseKenyanPhone(open.phone)}`} target="_blank" rel="noreferrer noopener">WhatsApp</a>}</span> : ""],
              ["Social", open.social], ["Source", open.source],
              ["Source link", safeHref(open.sourceUrl) ? <a href={safeHref(open.sourceUrl)} target="_blank" rel="noreferrer noopener" className="link">{hostOf(open.sourceUrl!)}</a> : ""],
              ["Score", `${open.score} (${leadTemp(open)})`], ["Value", money(open.value, cur)], ["Last touch", shortDate(open.lastTouch)],
            ]} />
            <div className="field">
              <label htmlFor="lead-tag">Tags</label>
              <div className="row" style={{ gap: 6 }}>
                {(open.tags ?? []).map((t) => (
                  <span key={t} className="chip">{t}<button type="button" className="linklike" aria-label={`Remove tag ${t}`} onClick={() => patch("leads", open.id, { tags: (open.tags ?? []).filter((x) => x !== t) })}>×</button></span>
                ))}
                <input id="lead-tag" className="input sm" style={{ width: 150 }} maxLength={30} placeholder="Add a tag" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(open.id, open.tags); } }} onBlur={() => addTag(open.id, open.tags)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" className="textarea" value={open.notes} onChange={(e) => patch("leads", open.id, { notes: e.target.value })} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

// Drag cards between stages. Keyboard and screen-reader users open a card and
// change the stage from the sheet, so dragging is never the only way.
function Board({ leads, cur, onOpen, onMove }: { leads: Lead[]; cur: string; onOpen: (id: string) => void; onMove: (id: string, to: LeadStage) => void }) {
  const [over, setOver] = useState<LeadStage | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  return (
    <div className="board">
      {STAGES.map((s) => {
        const items = leads.filter((l) => l.stage === s).sort((a, b) => b.score - a.score);
        const total = items.reduce((t, l) => t + l.value, 0);
        return (
          <section
            key={s}
            className={`col ${over === s ? "over" : ""}`}
            aria-label={`${s}: ${items.length} leads`}
            onDragOver={(e) => { e.preventDefault(); if (over !== s) setOver(s); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
            onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) onMove(id, s); }}
          >
            <div className="col-head"><b>{s}</b><span className="mono">{items.length} · {money(total, cur, true)}</span></div>
            {items.map((l) => {
              const temp = leadTemp(l);
              return (
                <button
                  key={l.id}
                  className={`kcard ${dragId === l.id ? "dragging" : ""}`}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", l.id); e.dataTransfer.effectAllowed = "move"; setDragId(l.id); }}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onOpen(l.id)}
                  aria-label={`${l.name || l.company}, ${l.company}, ${s}. Open details`}
                >
                  <span className="n">{l.name || l.company}</span>
                  {l.name && <span className="c">{l.role ? `${l.role}, ` : ""}{l.company}</span>}
                  <span className="f">
                    <span className={`chip ${temp}`}>{temp} · {l.score}</span>
                    <span className="mono">{money(l.value, cur, true)}</span>
                    {!l.consent && <span className="chip risk"><IconAlert />No consent</span>}
                    {!l.verified && <span className="chip warn"><IconAlert />Unverified</span>}
                  </span>
                </button>
              );
            })}
            {items.length === 0 && <div className="small faint" style={{ padding: "6px 4px" }}>Drop a lead here</div>}
          </section>
        );
      })}
    </div>
  );
}
