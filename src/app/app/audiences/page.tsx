"use client";

// Audiences: build segments of your leads with simple rules, see who's in them live, and use them
// in automations. Exports include only people who agreed to marketing.

import Link from "next/link";
import { useMemo, useState } from "react";
import { useEmma, uid } from "@/lib/store";
import { FIELD_LABEL, OPS_FOR, OP_LABEL, STARTER_SEGMENTS, members, toCsv } from "@/lib/audience";
import { STAGES, num } from "@/lib/metrics";
import { Panel } from "@/components/ui";
import { IconCheck, IconClose, IconPlus, IconTrash, IconUsers } from "@/components/icons";
import type { Segment, SegmentField, SegmentRule } from "@/lib/types";

const FIELDS = Object.keys(FIELD_LABEL) as SegmentField[];
const blankRule = (): SegmentRule => ({ field: "stage", op: "is", value: "new" });

export default function AudiencesPage() {
  const ws = useEmma((s) => s.ws);
  const saveSegment = useEmma((s) => s.saveSegment);
  const deleteSegment = useEmma((s) => s.deleteSegment);
  const toast = useEmma((s) => s.toast);
  const segments = ws.segments ?? [];
  const [editing, setEditing] = useState<Segment | null>(null);

  const addStarters = () => {
    const now = new Date().toISOString();
    for (const s of [...STARTER_SEGMENTS].reverse()) if (!segments.some((x) => x.name === s.name)) saveSegment({ ...s, id: uid("sg"), createdAt: now });
    toast("Starter audiences added.", "ok");
  };

  const exportCsv = (s: Segment) => {
    const list = members(ws.leads, s);
    const consented = list.filter((l) => l.consent).length;
    if (!consented) { toast("No one in this audience has agreed to marketing yet, so there's nothing to export.", "warn"); return; }
    const url = URL.createObjectURL(new Blob([toCsv(list)], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `${s.name.replace(/[^a-z0-9]+/gi, " ").trim().split(" ").map((w) => w[0]?.toUpperCase() + w.slice(1)).join("") || "Audience"}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`Exported ${consented} consented contact${consented === 1 ? "" : "s"}${list.length > consented ? ` (${list.length - consented} without consent left out)` : ""}.`, "ok");
  };

  return (
    <div className="stack">
      <Panel title="Audiences" hint={`${segments.length}`} right={
        <div className="row" style={{ gap: 8 }}>
          {segments.length === 0 && <button className="btn sm" onClick={addStarters}>Add starter audiences</button>}
          <button className="btn ai sm" onClick={() => setEditing({ id: uid("sg"), name: "", match: "all", rules: [blankRule()], createdAt: new Date().toISOString() })}><IconPlus />New audience</button>
        </div>
      }>
        {segments.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Group your leads by who they are and where they are in the journey, then let automations follow up with each group the right way.</p>
        ) : (
          <div className="list">
            {segments.map((s) => {
              const m = members(ws.leads, s);
              const consented = m.filter((l) => l.consent).length;
              return (
                <div key={s.id} className="list-item" style={{ alignItems: "center" }}>
                  <IconUsers width={18} style={{ color: "var(--muted)", flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>{s.name}</b>
                    <div className="small muted">{s.rules.map((r) => `${FIELD_LABEL[r.field]} ${OP_LABEL[r.op]} ${r.value === "true" ? "yes" : r.value === "false" ? "no" : r.value}`).join(s.match === "all" ? " and " : " or ")}</div>
                  </div>
                  <div className="stack" style={{ gap: 0, alignItems: "flex-end" }}><b>{num(m.length)}</b><span className="small muted">{num(consented)} consented</span></div>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn ghost sm" onClick={() => setEditing(s)}>Edit</button>
                    <button className="btn ghost sm" onClick={() => exportCsv(s)}>Export</button>
                    <button className="btn ghost sm" aria-label={`Delete ${s.name}`} onClick={() => { if (window.confirm(`Delete the audience "${s.name}"? Automations using it will apply to all leads.`)) deleteSegment(s.id); }}><IconTrash /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {editing && <Builder key={editing.id} initial={editing} onCancel={() => setEditing(null)} onSave={(s) => { saveSegment(s); setEditing(null); toast("Audience saved.", "ok"); }} />}

      <p className="small faint" style={{ margin: 0 }}>Use audiences in <Link className="link" href="/app/automations">Automations</Link> so each group gets the right follow-up.</p>
    </div>
  );
}

function Builder({ initial, onSave, onCancel }: { initial: Segment; onSave: (s: Segment) => void; onCancel: () => void }) {
  const leads = useEmma((s) => s.ws.leads);
  const [s, setS] = useState<Segment>(initial);
  const list = useMemo(() => members(leads, s), [leads, s]);
  const setRule = (i: number, r: Partial<SegmentRule>) => setS((x) => ({ ...x, rules: x.rules.map((y, n) => {
    if (n !== i) return y;
    const merged = { ...y, ...r };
    if (r.field) { merged.op = OPS_FOR[r.field][0]; merged.value = r.field === "stage" ? "new" : r.field === "consent" || r.field === "verified" ? "true" : ""; }
    return merged;
  }) }));

  return (
    <Panel title={initial.name ? `Edit: ${initial.name}` : "New audience"}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="grid cols-2">
          <div className="field"><label htmlFor="sg-name">Name</label><input id="sg-name" className="input" maxLength={60} placeholder="Nairobi offices, hot" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="sg-match">Include leads that match</label>
            <select id="sg-match" className="select" value={s.match} onChange={(e) => setS({ ...s, match: e.target.value as "all" | "any" })}><option value="all">all of these rules</option><option value="any">any of these rules</option></select></div>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {s.rules.map((r, i) => (
            <div key={i} className="row aud-rule" style={{ gap: 8, flexWrap: "nowrap" }}>
              <select className="select" aria-label={`Rule ${i + 1} field`} value={r.field} onChange={(e) => setRule(i, { field: e.target.value as SegmentField })}>{FIELDS.map((f) => <option key={f} value={f}>{FIELD_LABEL[f]}</option>)}</select>
              <select className="select" aria-label={`Rule ${i + 1} condition`} value={r.op} onChange={(e) => setRule(i, { op: e.target.value as SegmentRule["op"] })}>{OPS_FOR[r.field].map((o) => <option key={o} value={o}>{OP_LABEL[o]}</option>)}</select>
              {r.field === "stage" ? (
                <select className="select" aria-label={`Rule ${i + 1} value`} value={r.value} onChange={(e) => setRule(i, { value: e.target.value })}>{STAGES.map((st) => <option key={st} value={st}>{st}</option>)}</select>
              ) : r.field === "consent" || r.field === "verified" ? (
                <select className="select" aria-label={`Rule ${i + 1} value`} value={r.value} onChange={(e) => setRule(i, { value: e.target.value })}><option value="true">yes</option><option value="false">no</option></select>
              ) : (
                <input className="input" aria-label={`Rule ${i + 1} value`} inputMode={["score", "value", "lastTouchDays"].includes(r.field) ? "numeric" : "text"} value={r.value} maxLength={60} onChange={(e) => setRule(i, { value: e.target.value })} />
              )}
              <button className="btn ghost sm" aria-label={`Remove rule ${i + 1}`} onClick={() => setS({ ...s, rules: s.rules.filter((_, n) => n !== i) })}><IconClose /></button>
            </div>
          ))}
          <div><button className="btn ghost sm" onClick={() => setS({ ...s, rules: [...s.rules, blankRule()].slice(0, 10) })} disabled={s.rules.length >= 10}><IconPlus />Add rule</button></div>
        </div>
        <div className="banner" role="status"><IconCheck /><b>{num(list.length)}</b>&nbsp;lead{list.length === 1 ? "" : "s"} match, {num(list.filter((l) => l.consent).length)} agreed to marketing.</div>
        {list.length > 0 && (
          <div className="list">
            {list.slice(0, 8).map((l) => (
              <div key={l.id} className="list-item small"><b style={{ flex: 1 }}>{l.name}</b><span className="muted">{l.company}</span><span className="chip cold">{l.stage}</span><span className="mono">{l.score}</span>{l.consent ? <span className="chip ok"><IconCheck />Consent</span> : <span className="chip warn">No consent</span>}</div>
            ))}
            {list.length > 8 && <div className="small muted">and {num(list.length - 8)} more</div>}
          </div>
        )}
        <div className="row">
          <button className="btn primary" onClick={() => onSave({ ...s, name: s.name.trim() || "Untitled audience" })}>Save audience</button>
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </Panel>
  );
}
