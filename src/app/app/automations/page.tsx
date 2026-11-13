"use client";

// Automations: IF-THEN rules and ready-made recipes. They never send anything by themselves:
// each match becomes a suggestion in "Ready for you", and a person approves or skips it.

import Link from "next/link";
import { useMemo, useState } from "react";
import { useEmma, uid } from "@/lib/store";
import { RECIPES, describeAction, describeTrigger, evaluate, type Suggestion } from "@/lib/automations";
import { STAGES, num } from "@/lib/metrics";
import { safeActionHref } from "@/lib/safe";
import { Modal, Panel } from "@/components/ui";
import { IconBolt, IconCheck, IconClose, IconPlus, IconTrash } from "@/components/icons";
import type { Automation, AutomationAction, AutomationTrigger, LeadStage } from "@/lib/types";

export default function AutomationsPage() {
  const ws = useEmma((s) => s.ws);
  const saveAutomation = useEmma((s) => s.saveAutomation);
  const deleteAutomation = useEmma((s) => s.deleteAutomation);
  const resolve = useEmma((s) => s.resolveSuggestion);
  const toast = useEmma((s) => s.toast);
  const autos = ws.automations ?? [];
  const { suggestions, heldForConsent } = useMemo(() => evaluate(ws), [ws]);
  const [editing, setEditing] = useState<Automation | null>(null);

  const start = (r: (typeof RECIPES)[number]) => {
    saveAutomation({ ...r.build(), id: uid("au"), fired: {}, createdAt: new Date().toISOString() });
    toast(`"${r.name}" is on. Matches appear in Ready for you.`, "ok");
  };

  const approve = (s: Suggestion) => {
    const href = safeActionHref(s.link);
    if (s.action.kind === "message" && href) window.open(href, "_blank", "noopener,noreferrer");
    resolve(s, "approve");
    toast(s.action.kind === "message" ? (href ? "Opened with the message ready. Press send in your app." : "Marked as contacted. Add a phone or email to send next time.") : s.action.kind === "task" ? "Task added." : s.action.kind === "tag" ? "Tag added." : "Lead moved.", "ok");
  };

  return (
    <div className="stack">
      <Panel title="Ready for you" hint={`${suggestions.length}`}>
        {suggestions.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>{autos.length ? "Nothing needs you right now. New matches show up here." : "Turn on a recipe below and EMMA will line up follow-ups for you to approve."}</p>
        ) : (
          <div className="list">
            {suggestions.slice(0, 50).map((s) => (
              <div key={s.key} className="list-item auto-sug">
                <IconBolt width={18} style={{ color: "var(--ai-text)", flex: "none", marginTop: 3 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="small muted">{s.automationName} · {s.reason}</div>
                  <div style={{ fontWeight: 600 }}>{s.target.kind === "lead" ? s.target.lead.name : s.target.keyDate.name}</div>
                  <div className="small" style={{ whiteSpace: "pre-wrap" }}>{s.text}</div>
                  {s.action.kind === "message" && !s.link && <div className="small faint">No {s.action.channel === "email" ? "email address" : "phone number"} on this lead.</div>}
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn primary sm" onClick={() => approve(s)}>{s.action.kind === "message" ? (s.action.channel === "whatsapp" ? "Open WhatsApp" : s.action.channel === "sms" ? "Open SMS" : "Open email") : s.action.kind === "task" ? "Add task" : s.action.kind === "tag" ? "Add tag" : "Move lead"}</button>
                  <button className="btn ghost sm" onClick={() => resolve(s, "skip")}>Skip</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {heldForConsent > 0 && <div className="small faint" style={{ marginTop: 10 }}>{num(heldForConsent)} message{heldForConsent === 1 ? "" : "s"} held back: those leads haven&apos;t agreed to marketing. Record consent on the <Link className="link" href="/app/leads">lead</Link> first.</div>}
      </Panel>

      <Panel title="Your automations" hint={`${autos.length}`} right={<button className="btn sm" onClick={() => setEditing(blank())}><IconPlus />New automation</button>}>
        {autos.length === 0 ? <p className="muted" style={{ margin: 0 }}>No automations yet. Start with a recipe.</p> : (
          <div className="list">
            {autos.map((a) => {
              const seg = ws.segments?.find((s) => s.id === a.segmentId);
              return (
                <div key={a.id} className="list-item" style={{ alignItems: "center" }}>
                  <label className="switch" title={a.enabled ? "On" : "Off"}>
                    <input type="checkbox" checked={a.enabled} onChange={() => saveAutomation({ ...a, enabled: !a.enabled })} aria-label={`${a.name} ${a.enabled ? "on" : "off"}`} />
                    <span>{a.enabled ? <><IconCheck />On</> : <><IconClose />Off</>}</span>
                  </label>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>{a.name}</b>
                    <div className="small muted">When {describeTrigger(a.trigger)}{seg ? ` (in "${seg.name}")` : ""}, {describeAction(a.action)}. At most once every {a.cooldownDays} days per {a.trigger.kind === "keyDate" ? "date" : "lead"}.</div>
                  </div>
                  <button className="btn ghost sm" onClick={() => setEditing(a)}>Edit</button>
                  <button className="btn ghost sm" aria-label={`Delete ${a.name}`} onClick={() => { if (window.confirm(`Delete "${a.name}"?`)) deleteAutomation(a.id); }}><IconTrash /></button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Recipes">
        <div className="grid cols-3">
          {RECIPES.map((r) => {
            const on = autos.some((a) => a.name === r.build().name);
            return (
              <div key={r.id} className="glass panel stack" style={{ gap: 8 }}>
                <b>{r.name}</b>
                <div className="small muted" style={{ flex: 1 }}>{r.blurb}</div>
                <div>{on ? <span className="chip ok"><IconCheck />On</span> : <button className="btn sm" onClick={() => start(r)}>Turn on</button>}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Editor a={editing} onClose={() => setEditing(null)} onSave={(a) => { saveAutomation(a); setEditing(null); toast("Automation saved.", "ok"); }} />
    </div>
  );
}

const blank = (): Automation => ({ id: uid("au"), name: "", enabled: true, trigger: { kind: "newLead" }, action: { kind: "message", channel: "whatsapp", text: "Hi {first_name}, thanks for reaching out to {business}!" }, cooldownDays: 7, fired: {}, createdAt: new Date().toISOString() });

function Editor({ a, onClose, onSave }: { a: Automation | null; onClose: () => void; onSave: (a: Automation) => void }) {
  // Select the stored value, default outside: a fresh [] inside the selector re-renders forever.
  const storedSegments = useEmma((s) => s.ws.segments);
  const segments = storedSegments ?? [];
  const [x, setX] = useState<Automation | null>(a);
  if (a && (!x || x.id !== a.id)) setX(a);
  if (!a || !x) return null;
  const setTrigger = (kind: AutomationTrigger["kind"]) => setX({ ...x, trigger: kind === "newLead" ? { kind } : kind === "stageQuiet" ? { kind, stage: "contacted", days: 3 } : kind === "hotLead" ? { kind, score: 75 } : { kind, daysBefore: 14 } });
  const setAction = (kind: AutomationAction["kind"]) => setX({ ...x, action: kind === "message" ? { kind, channel: "whatsapp", text: "Hi {first_name}, " } : kind === "task" ? { kind, title: "Follow up with {name}" } : kind === "tag" ? { kind, tag: "" } : { kind, stage: "contacted" } });
  return (
    <Modal open onClose={onClose} label="Automation">
      <div className="stack" style={{ padding: 22, gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{a.name ? "Edit automation" : "New automation"}</h2>
        <div className="field"><label htmlFor="au-name">Name</label><input id="au-name" className="input" maxLength={80} value={x.name} onChange={(e) => setX({ ...x, name: e.target.value })} placeholder="Follow up quiet leads" /></div>
        <div className="field"><label htmlFor="au-when">When</label>
          <select id="au-when" className="select" value={x.trigger.kind} onChange={(e) => setTrigger(e.target.value as AutomationTrigger["kind"])}>
            <option value="newLead">a new lead comes in</option><option value="stageQuiet">a lead goes quiet in a stage</option><option value="hotLead">a lead becomes hot</option><option value="keyDate">a key date is coming up</option>
          </select></div>
        {x.trigger.kind === "stageQuiet" && (
          <div className="grid cols-2">
            <div className="field"><label htmlFor="au-stage">Stage</label><select id="au-stage" className="select" value={x.trigger.stage} onChange={(e) => setX({ ...x, trigger: { ...(x.trigger as Extract<AutomationTrigger, { kind: "stageQuiet" }>), stage: e.target.value as LeadStage } })}>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="field"><label htmlFor="au-days">Days without contact</label><input id="au-days" className="input" type="number" min={1} max={365} value={x.trigger.days} onChange={(e) => setX({ ...x, trigger: { ...(x.trigger as Extract<AutomationTrigger, { kind: "stageQuiet" }>), days: Math.max(1, Math.min(365, Number(e.target.value) || 1)) } })} /></div>
          </div>
        )}
        {x.trigger.kind === "hotLead" && <div className="field"><label htmlFor="au-score">Score at least</label><input id="au-score" className="input" type="number" min={1} max={100} value={x.trigger.score} onChange={(e) => setX({ ...x, trigger: { kind: "hotLead", score: Math.max(1, Math.min(100, Number(e.target.value) || 75)) } })} /></div>}
        {x.trigger.kind === "keyDate" && <div className="field"><label htmlFor="au-before">Days before the date</label><input id="au-before" className="input" type="number" min={0} max={90} value={x.trigger.daysBefore} onChange={(e) => setX({ ...x, trigger: { kind: "keyDate", daysBefore: Math.max(0, Math.min(90, Number(e.target.value) || 0)) } })} /></div>}
        {x.trigger.kind !== "keyDate" && (
          <div className="field"><label htmlFor="au-seg">Only for</label>
            <select id="au-seg" className="select" value={x.segmentId ?? ""} onChange={(e) => setX({ ...x, segmentId: e.target.value || undefined })}><option value="">all leads</option>{segments.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        )}
        <div className="field"><label htmlFor="au-then">Then</label>
          <select id="au-then" className="select" value={x.action.kind} onChange={(e) => setAction(e.target.value as AutomationAction["kind"])}>
            <option value="message">draft a message</option><option value="task">create a task</option>{x.trigger.kind !== "keyDate" && <option value="moveStage">move the lead to a stage</option>}{x.trigger.kind !== "keyDate" && <option value="tag">tag the lead</option>}
          </select></div>
        {x.action.kind === "message" && (
          <>
            <div className="field"><label htmlFor="au-ch">Channel</label><select id="au-ch" className="select" value={x.action.channel} onChange={(e) => setX({ ...x, action: { ...(x.action as Extract<AutomationAction, { kind: "message" }>), channel: e.target.value as "whatsapp" | "email" | "sms" } })}><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option><option value="email">Email</option></select></div>
            <div className="field"><label htmlFor="au-text">Message</label><textarea id="au-text" className="input" rows={4} maxLength={700} value={x.action.text} onChange={(e) => setX({ ...x, action: { ...(x.action as Extract<AutomationAction, { kind: "message" }>), text: e.target.value } })} />
              <span className="help">Use {"{first_name}"}, {"{company}"}, {"{business}"}. Leads without consent only get messages while you&apos;re already talking.</span></div>
          </>
        )}
        {x.action.kind === "task" && <div className="field"><label htmlFor="au-task">Task</label><input id="au-task" className="input" maxLength={160} value={x.action.title} onChange={(e) => setX({ ...x, action: { kind: "task", title: e.target.value } })} /><span className="help">Use {"{name}"}, {"{company}"}, {"{date_name}"}, {"{date}"}.</span></div>}
        {x.action.kind === "moveStage" && <div className="field"><label htmlFor="au-to">Move to</label><select id="au-to" className="select" value={x.action.stage} onChange={(e) => setX({ ...x, action: { kind: "moveStage", stage: e.target.value as LeadStage } })}>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>}
        {x.action.kind === "tag" && <div className="field"><label htmlFor="au-tag">Tag</label><input id="au-tag" className="input" maxLength={30} placeholder="vip" value={x.action.tag} onChange={(e) => setX({ ...x, action: { kind: "tag", tag: e.target.value } })} /><span className="help">Use tags in Audiences to group leads.</span></div>}
        <div className="field"><label htmlFor="au-cool">At most once every (days)</label><input id="au-cool" className="input" type="number" min={1} max={365} value={x.cooldownDays} onChange={(e) => setX({ ...x, cooldownDays: Math.max(1, Math.min(365, Number(e.target.value) || 7)) })} /></div>
        <div className="row"><button className="btn primary" onClick={() => onSave({ ...x, name: x.name.trim() || "Untitled automation" })}>Save</button><button className="btn ghost" onClick={onClose}>Cancel</button></div>
      </div>
    </Modal>
  );
}
