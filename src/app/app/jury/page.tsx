"use client";

import { useEffect, useMemo, useState } from "react";
import { useEmma, type JuryDraft } from "@/lib/store";
import { JURORS, jurorByRole, tally, verdictLine } from "@/lib/jury";
import type { JurorVerdict, JuryCase, JuryRound } from "@/lib/types";
import { PageIntro, Panel } from "@/components/ui";
import { IconAlert, IconCheck, IconGavel, IconPlus, IconTrash, IconX, IconCommand } from "@/components/icons";
import { useHealth } from "@/components/health";

const KINDS = ["Product", "Offer", "Campaign", "Ad", "Startup idea", "Price change"];

export default function PitchJury() {
  const ws = useEmma((s) => s.ws);
  const juryDraft = useEmma((s) => s.juryDraft);
  const setJuryDraft = useEmma((s) => s.setJuryDraft);
  const createCase = useEmma((s) => s.createCase);
  const deleteCase = useEmma((s) => s.deleteCase);
  const runRound = useEmma((s) => s.runRound);
  const juryBusy = useEmma((s) => s.juryBusy);
  const health = useHealth();

  const p = ws.profile;
  const defaultContext = `${p.name}${p.industry ? `, ${p.industry}` : ""}${p.location ? ` in ${p.location}` : ""}. Regulated under the ${p.compliance.regime}.`;
  const blank: JuryDraft = { title: "", kind: "Offer", context: defaultContext, pitch: "", audience: "", price: "" };

  const [caseId, setCaseId] = useState<string | null>(ws.juries[0]?.id ?? null);
  const [creating, setCreating] = useState<JuryDraft | null>(ws.juries.length ? null : blank);
  const [error, setError] = useState<string | null>(null);

  // Arriving from the Catalog's "Put on trial" button.
  useEffect(() => {
    if (juryDraft) {
      setCreating({ ...blank, ...juryDraft, context: juryDraft.context || defaultContext });
      setJuryDraft(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [juryDraft]);

  const current = ws.juries.find((j) => j.id === caseId) ?? null;

  const startCase = async (d: JuryDraft) => {
    setError(null);
    const id = createCase({ title: d.title.trim() || "Untitled pitch", kind: d.kind, context: d.context });
    setCaseId(id);
    setCreating(null);
    const err = await runRound(id, { pitch: d.pitch, audience: d.audience, price: d.price });
    if (err) setError(err);
  };

  return (
    <div>
      <PageIntro
        title="Pitch Jury"
        right={<button className="btn ai sm" onClick={() => { setCreating(blank); setError(null); }}><IconPlus />New case</button>}
      />

      {health.connected === false && (
        <div className="banner" style={{ marginBottom: 16 }}>
          <span>⚠</span>
          <div><b>The jury can&apos;t sit until EMMA is connected.</b> The two example cases below show what a trial looks like. Add <code>ANTHROPIC_API_KEY</code> to <code>.env.local</code> to run your own.</div>
        </div>
      )}

      <div className="jury-layout">
        <aside className="case-list" aria-label="Cases">
          {ws.juries.map((c) => {
            const last = c.rounds.at(-1);
            const t = last ? tally(last.verdicts) : null;
            return (
              <button key={c.id} className={`case-item ${c.id === caseId && !creating ? "on" : ""}`} onClick={() => { setCaseId(c.id); setCreating(null); setError(null); }}>
                <span className="t">{c.title}</span>
                <span className="m">
                  <span>{c.kind}</span>
                  <span>{c.rounds.length} round{c.rounds.length === 1 ? "" : "s"}</span>
                  {c.example && <span className="chip">Example</span>}
                  {juryBusy === c.id && <span className="chip ai">On trial</span>}
                </span>
                {last && t && <span className="m"><Dots verdicts={last.verdicts} pending={juryBusy === c.id} /><span className="mono">{t.notGuilty}/{JURORS.length}</span></span>}
              </button>
            );
          })}
          {ws.juries.length === 0 && <div className="empty">No cases yet.</div>}
        </aside>

        <div className="stack" style={{ minWidth: 0 }}>
          {error && <div className="err">{error}</div>}
          {creating ? (
            <NewCase draft={creating} onChange={setCreating} onCancel={ws.juries.length ? () => setCreating(null) : undefined} onSubmit={startCase} busy={Boolean(juryBusy)} />
          ) : current ? (
            <CaseView key={current.id} c={current} onError={setError} onDelete={() => { deleteCase(current.id); setCaseId(ws.juries.find((j) => j.id !== current.id)?.id ?? null); }} />
          ) : (
            <div className="empty">Pick a case or start a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dots({ verdicts, pending = false, lg = false }: { verdicts: JurorVerdict[]; pending?: boolean; lg?: boolean }) {
  return (
    <span className={`dots ${lg ? "lg" : ""}`} aria-hidden="true">
      {JURORS.map((j) => {
        const v = verdicts.find((x) => x.role === j.role);
        const cls = !v ? (pending ? "wait" : "") : v.error ? "" : v.verdict === "not_guilty" ? "ng" : "g";
        return <i key={j.role} className={cls} title={`${j.name}: ${!v ? "deliberating" : v.error ? "no verdict" : v.verdict === "not_guilty" ? "not guilty" : "guilty"}`} />;
      })}
    </span>
  );
}

function NewCase({ draft, onChange, onCancel, onSubmit, busy }: { draft: JuryDraft; onChange: (d: JuryDraft) => void; onCancel?: () => void; onSubmit: (d: JuryDraft) => void; busy: boolean }) {
  const offerings = useEmma((s) => s.ws.profile.offerings);
  const currency = useEmma((s) => s.ws.profile.currency);
  const set = (k: keyof JuryDraft, v: string) => onChange({ ...draft, [k]: v });
  const words = draft.pitch.trim() ? draft.pitch.trim().split(/\s+/).length : 0;

  return (
    <Panel title="New case" hint="Write it the way you'd say it in 60 seconds" right={onCancel && <button className="btn ghost sm" onClick={onCancel}>Cancel</button>}>
      <div className="stack">
        <div className="grid cols-3">
          <div className="field"><label htmlFor="jt">Case name</label><input id="jt" className="input" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Office coffee trial" /></div>
          <div className="field"><label htmlFor="jk">What are you pitching?</label>
            <select id="jk" className="select" value={draft.kind} onChange={(e) => set("kind", e.target.value)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
          </div>
          <div className="field"><label htmlFor="jo">Start from the catalog</label>
            <select id="jo" className="select" value="" onChange={(e) => {
              const o = offerings.find((x) => x.id === e.target.value);
              if (o) onChange({ ...draft, title: o.name, pitch: `${o.name}: ${o.description}`, price: `${currency} ${o.price.toLocaleString("en-KE")}` });
            }}>
              <option value="">Choose an offering…</option>
              {offerings.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="jp">The pitch</label>
          <textarea id="jp" className="textarea" rows={7} value={draft.pitch} onChange={(e) => set("pitch", e.target.value)}
            placeholder="Who it's for, what it does, what it costs, why now. The jury hears it once." />
          <span className="help">{words} words{words > 160 ? " · long for a pitch; juries punish rambling" : ""}</span>
        </div>
        <div className="grid cols-2">
          <div className="field"><label htmlFor="ja">Target audience</label><input id="ja" className="input" value={draft.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Who has to say yes" /></div>
          <div className="field"><label htmlFor="jpr">Price</label><input id="jpr" className="input" value={draft.price} onChange={(e) => set("price", e.target.value)} placeholder={`e.g. ${currency} 38,000 a month`} /></div>
        </div>
        <div className="field">
          <label htmlFor="jc">Context for the jury</label>
          <input id="jc" className="input" value={draft.context} onChange={(e) => set("context", e.target.value)} />
          <span className="help">Who&apos;s pitching, where and under which rules. The lawyer and competitor judge against this.</span>
        </div>
        <div className="row">
          <button className="btn ai" disabled={busy || !draft.pitch.trim()} onClick={() => onSubmit(draft)}><IconGavel />Put it on trial</button>
          <span className="small faint">Nine jurors, judged independently. About two minutes.</span>
        </div>
      </div>
    </Panel>
  );
}

function CaseView({ c, onError, onDelete }: { c: JuryCase; onError: (e: string | null) => void; onDelete: () => void }) {
  const runRound = useEmma((s) => s.runRound);
  const juryBusy = useEmma((s) => s.juryBusy);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const busy = juryBusy === c.id;
  const [idx, setIdx] = useState(c.rounds.length - 1);
  const round: JuryRound | undefined = c.rounds[Math.min(Math.max(idx, 0), c.rounds.length - 1)];
  const last = c.rounds.at(-1);
  const [next, setNext] = useState({ pitch: last?.revisedPitch || last?.pitch || "", audience: last?.audience ?? "", price: last?.price ?? "" });
  const [elapsed, setElapsed] = useState(0);

  // Follow the newest round while the jury is sitting, and queue its rewrite.
  useEffect(() => { setIdx(c.rounds.length - 1); }, [c.rounds.length]);
  useEffect(() => {
    if (last?.revisedPitch) setNext({ pitch: last.revisedPitch, audience: last.audience, price: last.price });
  }, [last?.id, last?.revisedPitch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!busy) return;
    const start = Date.now();
    setElapsed(0);
    const t = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [busy]);

  const t = useMemo(() => (round ? tally(round.verdicts) : { notGuilty: 0, guilty: 0, total: 0 }), [round]);
  const acquitted = Boolean(round) && t.notGuilty === JURORS.length;
  const isLatest = round?.id === last?.id;

  const rerun = async () => {
    onError(null);
    const err = await runRound(c.id, next);
    if (err) onError(err);
  };

  const handToEmma = () => {
    if (!round) return;
    setDrawer(true);
    void send(`This pitch was acquitted ${t.notGuilty}-${t.guilty} by the Pitch Jury ("${c.title}"):\n\n${round.pitch}\n\nAudience: ${round.audience}. Price: ${round.price}.\n\nBuild a launch around it: calendar entries across the funnel, one paid campaign and an email. Keep every claim exactly as true as the pitch.`);
  };

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div style={{ minWidth: 0 }}>
          <div className="small muted">{c.kind}{c.example ? " · example case" : ""}</div>
          <h3 style={{ margin: "2px 0 0", fontSize: 18 }}>{c.title}</h3>
        </div>
        <div className="rounds" aria-label="Rounds">
          {c.rounds.map((r, i) => {
            const rt = tally(r.verdicts);
            return (
              <span key={r.id} className="row" style={{ gap: 8 }}>
                {i > 0 && <span className="round-arrow">→</span>}
                <button className={`round-chip ${r.id === round?.id ? "on" : ""}`} onClick={() => setIdx(i)}>
                  Round {i + 1} <span className="n">{rt.notGuilty}/{JURORS.length}</span>
                </button>
              </span>
            );
          })}
          <button className="btn ghost sm danger" onClick={() => window.confirm(`Delete "${c.title}" and all its rounds?`) && onDelete()} aria-label="Delete case"><IconTrash /></button>
        </div>
      </div>

      {round && (
        <>
          <div className={`glass verdict-banner ${acquitted ? "acquitted" : ""}`}>
            <div className="score">{t.notGuilty}<small>/ {JURORS.length} not guilty</small></div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="line">{busy && isLatest ? `The jury is out… ${elapsed}s` : verdictLine(t.notGuilty, t.total)}</div>
              <div style={{ marginTop: 8 }}><Dots verdicts={round.verdicts} pending={busy && isLatest} lg /></div>
            </div>
            {acquitted && !busy && <button className="btn ai" onClick={handToEmma}><IconCommand />Hand it to EMMA</button>}
          </div>

          <Panel title={`Round ${c.rounds.indexOf(round) + 1}: the pitch on trial`} hint={[round.audience && `For ${round.audience}`, round.price].filter(Boolean).join(" · ")}>
            <div className="pitch-text">{round.pitch}</div>
          </Panel>

          <div className="jury-box">
            {JURORS.map((j) => <JurorCard key={j.role} role={j.role} verdict={round.verdicts.find((v) => v.role === j.role)} pending={busy && isLatest} />)}
          </div>

          {round.summary && (
            <Panel title="The foreperson">
              <div className="stack">
                <p style={{ margin: 0, fontWeight: 600 }}>{round.summary}</p>
                {round.objections && round.objections.length > 0 && (
                  <div>
                    <div className="small muted" style={{ marginBottom: 6 }}>{acquitted ? "Conditions the verdict depends on" : "Objections that matter most"}</div>
                    <ol style={{ margin: 0, paddingLeft: 20 }} className="small">{round.objections.map((o, i) => <li key={i} style={{ margin: "4px 0" }}>{o}</li>)}</ol>
                  </div>
                )}
                {!acquitted && round.revisedPitch && (
                  <div className="stack" style={{ gap: 8 }}>
                    <div className="small muted">Revised pitch</div>
                    <div className="glass pitch-text" style={{ padding: 14 }}>{round.revisedPitch}</div>
                    {round.changes && round.changes.length > 0 && (
                      <ul className="small" style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)" }}>{round.changes.map((ch, i) => <li key={i} style={{ margin: "3px 0" }}>{ch}</li>)}</ul>
                    )}
                    {isLatest && (
                      <div><button className="btn sm" onClick={() => setNext({ ...next, pitch: round.revisedPitch ?? next.pitch })}>Use this for the next round</button></div>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          )}
        </>
      )}

      <Panel title={c.rounds.length ? `Round ${c.rounds.length + 1}` : "Round 1"} hint={acquitted && isLatest ? "Already acquitted. Rerun only if you change the pitch." : "Fix what they convicted, then run it again"}>
        <div className="stack">
          <textarea className="textarea" rows={7} value={next.pitch} onChange={(e) => setNext({ ...next, pitch: e.target.value })} aria-label="Pitch for the next round" />
          <div className="grid cols-2">
            <input className="input" value={next.audience} onChange={(e) => setNext({ ...next, audience: e.target.value })} placeholder="Target audience" aria-label="Target audience" />
            <input className="input" value={next.price} onChange={(e) => setNext({ ...next, price: e.target.value })} placeholder="Price" aria-label="Price" />
          </div>
          <div className="row">
            <button className="btn ai" disabled={Boolean(juryBusy) || !next.pitch.trim()} onClick={rerun}><IconGavel />{busy ? "The jury is out…" : "Run it again"}</button>
            <span className="small faint">Every round is kept, so you can see what moved the vote.</span>
          </div>
        </div>
      </Panel>
    </>
  );
}

function JurorCard({ role, verdict, pending }: { role: JurorVerdict["role"]; verdict?: JurorVerdict; pending: boolean }) {
  const j = jurorByRole[role];
  if (!verdict) {
    return (
      <div className="glass juror pending">
        <div className="who"><b>{j.name}</b></div>
        <div className="pass">Not guilty = {j.pass.toLowerCase()}</div>
        <div className="quote">{pending ? <span className="typing"><i /><i /><i /></span> : "No verdict"}</div>
      </div>
    );
  }
  if (verdict.error) {
    return (
      <div className="glass juror">
        <div className="who"><b>{j.name}</b><span className="chip right">No verdict</span></div>
        <div className="why">{verdict.error}</div>
      </div>
    );
  }
  const ng = verdict.verdict === "not_guilty";
  return (
    <div className={`glass juror ${ng ? "ng" : "g"}`}>
      <div className="who">
        <b>{j.name}</b>
        <span className={`chip right ${ng ? "ok" : "risk"}`}>{ng ? <IconCheck /> : <IconX />}{ng ? "Not guilty" : "Guilty"}</span>
      </div>
      <div className="pass">Not guilty = {j.pass.toLowerCase()}</div>
      <div className="quote">“{verdict.headline}”</div>
      <div className="why">{verdict.reasoning}</div>
      <div className="fix"><b>{ng ? "To keep this vote: " : "To win this vote: "}</b>{verdict.fix}</div>
      {verdict.confidence === "low" && <div className="small faint row" style={{ gap: 4 }}><IconAlert width={12} />Low confidence</div>}
    </div>
  );
}
