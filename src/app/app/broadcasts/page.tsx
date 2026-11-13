"use client";

// Broadcasts: one message, in up to five versions, to an audience of people who agreed to
// marketing. You send each one by tapping through the queue (it opens your own WhatsApp, SMS or
// email with the text filled in). A hold-out group gets nothing, so you can see the difference.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useEmma, uid } from "@/lib/store";
import { SMART_SEGMENTS } from "@/lib/audience";
import { LABELS, MAX_VARIANTS, audiencePreview, buildSends, render, report, sendLink } from "@/lib/broadcasts";
import { num, relTime } from "@/lib/metrics";
import { safeActionHref } from "@/lib/safe";
import { Panel } from "@/components/ui";
import { IconCheck, IconPlus, IconSend, IconTrash } from "@/components/icons";
import type { Broadcast, BroadcastVariant } from "@/lib/types";

type Stats = Record<string, { clicks: number; unique: number }>;
const CHANNEL_LABEL = { whatsapp: "WhatsApp", sms: "SMS", email: "Email" } as const;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 60);

export default function BroadcastsPage() {
  const mode = useEmma((s) => s.mode);
  const wsId = useEmma((s) => s.wsId);
  const stored = useEmma((s) => s.ws.broadcasts);
  const broadcasts = stored ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(async () => {
    if (mode !== "cloud" || !wsId) { setStats(null); return; }
    const res = await fetch(`/api/links?workspaceId=${encodeURIComponent(wsId)}`, { cache: "no-store" }).catch(() => null);
    const body = res?.ok ? ((await res.json().catch(() => null)) as { links?: { code: string; stats?: { clicks: number; unique: number } }[] } | null) : null;
    setStats(body?.links ? Object.fromEntries(body.links.map((l) => [l.code, { clicks: l.stats?.clicks ?? 0, unique: l.stats?.unique ?? 0 }])) : null);
  }, [mode, wsId]);
  useEffect(() => { void loadStats(); }, [loadStats]);

  const open = broadcasts.find((b) => b.id === openId) ?? null;

  return (
    <div className="stack">
      {!creating && !open && (
        <Panel title="Broadcasts" hint={`${broadcasts.length}`} right={<button className="btn ai sm" onClick={() => setCreating(true)}><IconPlus />New broadcast</button>}>
          {broadcasts.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>Send an offer or an update to a whole audience at once. Try two versions of the message and EMMA shows which one more people open.</p>
          ) : (
            <div className="list">
              {broadcasts.map((b) => {
                const all = Object.values(b.sends);
                const sent = all.filter((s) => s.state === "sent").length, queued = all.filter((s) => s.state === "queued").length;
                return (
                  <button key={b.id} className="list-item bc-row" onClick={() => setOpenId(b.id)} aria-label={`Open ${b.name}`}>
                    <IconSend width={18} style={{ color: "var(--muted)", flex: "none" }} />
                    <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}><b>{b.name}</b><span className="small muted" style={{ display: "block" }}>{CHANNEL_LABEL[b.channel]} · {b.variants.length} version{b.variants.length === 1 ? "" : "s"} · {relTime(b.createdAt)}</span></span>
                    <span className="small"><b>{num(sent)}</b> sent{queued ? <span className="muted"> · {num(queued)} to go</span> : null}</span>
                    {b.status === "done" ? <span className="chip ok"><IconCheck />Done</span> : <span className="chip accent">Sending</span>}
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      )}
      {creating && <Composer onCancel={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpenId(id); void loadStats(); }} />}
      {open && <Detail b={open} stats={stats} onBack={() => setOpenId(null)} onRefresh={() => void loadStats()} />}
    </div>
  );
}

function Composer({ onCancel, onCreated }: { onCancel: () => void; onCreated: (id: string) => void }) {
  const router = useRouter();
  const ws = useEmma((s) => s.ws);
  const mode = useEmma((s) => s.mode);
  const wsId = useEmma((s) => s.wsId);
  const saveBroadcast = useEmma((s) => s.saveBroadcast);
  const send = useEmma((s) => s.send);
  const toast = useEmma((s) => s.toast);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Broadcast["channel"]>("whatsapp");
  const [audience, setAudience] = useState("");
  const [destination, setDestination] = useState("");
  const [texts, setTexts] = useState<string[]>(["Hi {first_name}, "]);
  const [holdout, setHoldout] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = useMemo(() => audiencePreview(ws, audience, channel), [ws, audience, channel]);
  const holdSize = Math.round((preview.eligible.length * holdout) / 100);
  const sample = preview.eligible[0];

  const askEmma = () => {
    void send(`Write ${Math.max(2, texts.length)} short ${CHANNEL_LABEL[channel]} broadcast messages for ${ws.profile.name} to send to the audience "${preview.name}"${name.trim() ? ` about: ${name.trim()}` : ""}. Each must be a clearly different angle so we can A/B test them, under 400 characters, in our brand voice, start with "Hi {first_name}," and end with a clear next step${destination.trim() ? " and the token {link}" : ""}. Save them as one library card so I can paste them into a broadcast.`);
    router.push("/app");
  };

  const create = async () => {
    setError(null);
    const clean = texts.map((t) => t.trim()).filter(Boolean);
    if (!name.trim()) { setError("Give the broadcast a name, like December offer."); return; }
    if (!clean.length) { setError("Write the message."); return; }
    if (!preview.eligible.length) { setError("No one in this audience can receive it yet. They need to have agreed to marketing and have a phone number or email."); return; }
    let dest = destination.trim();
    if (dest) {
      try { const u = new URL(/^https?:\/\//i.test(dest) ? dest : `https://${dest}`); if (!u.hostname.includes(".")) throw new Error(); dest = u.toString(); }
      catch { setError("That link doesn't look like a web address."); return; }
    }
    setBusy(true);
    const id = uid("bc");
    const variants: BroadcastVariant[] = clean.slice(0, MAX_VARIANTS).map((t, i) => ({ id: uid("bv"), label: LABELS[i], text: dest && !t.includes("{link}") ? `${t}\n{link}` : t }));
    let untracked = false;
    if (dest && mode === "cloud" && wsId) {
      for (const v of variants) {
        const res = await fetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId: wsId, name: `${name.trim()}${variants.length > 1 ? ` (${v.label})` : ""}`.slice(0, 120), destination: dest, channel: channel === "email" ? "email" : channel, abGroup: variants.length > 1 ? name.trim().slice(0, 60) : undefined, utm: { campaign: slug(name), content: v.label.toLowerCase() } }) }).catch(() => null);
        const body = res ? ((await res.json().catch(() => ({}))) as { link?: { code: string } }) : {};
        if (res?.ok && body.link) { v.linkCode = body.link.code; v.short = `${window.location.origin}/l/${body.link.code}`; } else untracked = true;
      }
    }
    saveBroadcast({ id, name: name.trim().slice(0, 80), channel, audience, variants, holdoutPct: holdout, destination: dest || undefined, status: "sending", createdAt: new Date().toISOString(), sends: buildSends(id, preview.eligible, variants, holdout, new Date().toISOString()) });
    setBusy(false);
    toast(untracked ? "Broadcast ready. Some links couldn't be tracked (your plan's link allowance may be full), so those versions use the plain address." : "Broadcast ready. Work through the queue to send.", untracked ? "warn" : "ok");
    onCreated(id);
  };

  return (
    <Panel title="New broadcast" right={<button className="btn sm" onClick={askEmma}>Ask EMMA to write versions</button>}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="grid cols-3">
          <div className="field"><label htmlFor="bc-name">Name</label><input id="bc-name" className="input" maxLength={80} placeholder="December offer" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="bc-ch">Send by</label><select id="bc-ch" className="select" value={channel} onChange={(e) => setChannel(e.target.value as Broadcast["channel"])}><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option><option value="email">Email</option></select></div>
          <div className="field"><label htmlFor="bc-aud">To</label>
            <select id="bc-aud" className="select" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="">Everyone who agreed to marketing</option>
              <optgroup label="Smart audiences">{SMART_SEGMENTS.map((s) => <option key={s.id} value={`smart:${s.id}`}>{s.name}</option>)}</optgroup>
              {(ws.segments ?? []).length > 0 && <optgroup label="Your audiences">{(ws.segments ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>}
            </select></div>
        </div>
        <div className="banner" role="status">
          <span><b>{num(preview.eligible.length)}</b> {preview.eligible.length === 1 ? "person" : "people"} will be in this broadcast{holdout ? <>: about {num(preview.eligible.length - holdSize)} get the message, {num(holdSize)} are held out</> : null}.
            {preview.noConsent > 0 && <> {num(preview.noConsent)} left out (no marketing consent).</>}{preview.noContact > 0 && <> {num(preview.noContact)} left out (no {channel === "email" ? "email address" : "phone number"}).</>}</span>
        </div>
        <div className="field"><label htmlFor="bc-dest">Link to track (optional)</label><input id="bc-dest" className="input" inputMode="url" placeholder="mybusiness.co.ke/offer" value={destination} onChange={(e) => setDestination(e.target.value)} /><span className="help">EMMA makes a short link for each version and counts who opens it. Put {"{link}"} where it should appear, or it goes at the end.</span></div>
        {texts.map((t, i) => (
          <div key={i} className="field">
            <div className="row" style={{ justifyContent: "space-between" }}><label htmlFor={`bc-t${i}`}>{texts.length > 1 ? `Version ${LABELS[i]}` : "Message"}</label>{texts.length > 1 && <button className="btn ghost sm" aria-label={`Remove version ${LABELS[i]}`} onClick={() => setTexts(texts.filter((_, n) => n !== i))}><IconTrash /></button>}</div>
            <textarea id={`bc-t${i}`} className="textarea" rows={4} maxLength={900} value={t} onChange={(e) => setTexts(texts.map((x, n) => (n === i ? e.target.value : x)))} />
            {i === 0 && <span className="help">Use {"{first_name}"}, {"{company}"} and {"{business}"}. {sample && t.trim() ? <>Preview for {sample.name || sample.company}: &ldquo;{render({ destination: destination.trim() || undefined } as Broadcast, { id: "p", label: "A", text: t }, sample, ws.profile.name || "us").slice(0, 160)}&rdquo;</> : null}</span>}
          </div>
        ))}
        <div className="row">
          <button className="btn ghost sm" onClick={() => setTexts([...texts, texts[0] ?? ""])} disabled={texts.length >= MAX_VARIANTS}><IconPlus />Add a version to test</button>
          <label className="row small" style={{ gap: 8 }} htmlFor="bc-hold">Hold out
            <select id="bc-hold" className="select sm" value={holdout} onChange={(e) => setHoldout(Number(e.target.value))}><option value={0}>nobody</option><option value={10}>10%</option><option value={20}>20%</option><option value={30}>30%</option></select>
            <span className="muted">so you can see what the message changed</span></label>
        </div>
        {error && <div className="err" role="alert">{error}</div>}
        <div className="row"><button className="btn primary" onClick={() => void create()} disabled={busy}>{busy ? "Preparing…" : "Create broadcast"}</button><button className="btn ghost" onClick={onCancel} disabled={busy}>Cancel</button></div>
      </div>
    </Panel>
  );
}

function Detail({ b, stats, onBack, onRefresh }: { b: Broadcast; stats: Stats | null; onBack: () => void; onRefresh: () => void }) {
  const ws = useEmma((s) => s.ws);
  const mark = useEmma((s) => s.markBroadcast);
  const end = useEmma((s) => s.endBroadcast);
  const del = useEmma((s) => s.deleteBroadcast);
  const toast = useEmma((s) => s.toast);
  const r = useMemo(() => report(b, ws.leads, stats), [b, ws.leads, stats]);
  const business = ws.profile.name || "us";
  const queue = useMemo(() => Object.entries(b.sends).filter(([, s]) => s.state === "queued").map(([id, s]) => ({ lead: ws.leads.find((l) => l.id === id), variant: b.variants.find((v) => v.id === s.v) })).filter((x): x is { lead: NonNullable<typeof x.lead>; variant: BroadcastVariant } => Boolean(x.lead && x.variant)), [b, ws.leads]);
  const pct = (a: number, n: number) => (n ? `${Math.round((a / n) * 100)}%` : "0%");

  const sendOne = (leadId: string, href: string | undefined) => {
    const safe = safeActionHref(href);
    if (!safe) { toast("This lead's contact details can't be opened. Skip them or fix the number.", "warn"); return; }
    window.open(safe, "_blank", "noopener,noreferrer");
    mark(b.id, leadId, "sent");
  };

  return (
    <>
      <Panel title={b.name} hint={`${CHANNEL_LABEL[b.channel]} · ${relTime(b.createdAt)}`} right={
        <div className="row" style={{ gap: 6 }}>
          <button className="btn ghost sm" onClick={onBack}>All broadcasts</button>
          <button className="btn ghost sm" onClick={onRefresh}>Refresh clicks</button>
          <button className="btn ghost sm" aria-label={`Delete ${b.name}`} onClick={() => { if (window.confirm(`Delete "${b.name}" and its report? Messages already sent stay sent.`)) { del(b.id); onBack(); } }}><IconTrash /></button>
        </div>
      }>
        <div className="stack" style={{ gap: 12 }}>
          <div className="banner" role="status">{r.winner && <IconCheck />}{r.verdict}</div>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Version</th><th className="num">Sent</th><th className="num">To go</th><th className="num">Skipped</th><th className="num">Opened link</th><th className="num">Rate</th></tr></thead>
              <tbody>
                {r.variants.map((v) => (
                  <tr key={v.id}>
                    <td><b>{b.variants.length > 1 ? v.label : "Message"}</b>{r.winner === v.label && <span className="chip ok" style={{ marginLeft: 6 }}><IconCheck />Winning</span>}<div className="sub" style={{ whiteSpace: "pre-wrap", maxWidth: 420 }}>{b.variants.find((x) => x.id === v.id)?.text.slice(0, 140)}</div></td>
                    <td className="num">{num(v.sent)}</td><td className="num">{num(v.queued)}</td><td className="num">{num(v.skipped)}</td>
                    <td className="num">{v.people === null ? <span className="faint">not tracked</span> : num(v.people)}</td>
                    <td className="num">{v.rate === null ? "" : `${Math.round(v.rate * 100)}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.holdoutPct > 0 && (
            <div className="small">
              <b>Did it make a difference?</b> {r.messaged.size + r.holdout.size < 30
                ? <span className="muted">Too early to say. So far {num(r.messaged.progressed)} of {num(r.messaged.size)} people messaged moved forward a stage, against {num(r.holdout.progressed)} of {num(r.holdout.size)} held out.</span>
                : <>Of the people messaged, {pct(r.messaged.progressed, r.messaged.size)} moved forward a stage ({num(r.messaged.progressed)} of {num(r.messaged.size)}). Of those held out, {pct(r.holdout.progressed, r.holdout.size)} did ({num(r.holdout.progressed)} of {num(r.holdout.size)}).</>}
            </div>
          )}
        </div>
      </Panel>

      {b.status === "sending" && (
        <Panel title="Send queue" hint={`${queue.length} to go`} right={queue.length > 0 ? <button className="btn ghost sm" onClick={() => { if (window.confirm(`Stop here? ${queue.length} people won't get this broadcast.`)) end(b.id); }}>Stop here</button> : undefined}>
          {queue.length === 0 ? <p className="muted" style={{ margin: 0 }}>Everyone is done.</p> : (
            <div className="list">
              {queue.slice(0, 25).map(({ lead, variant }) => {
                const text = render(b, variant, lead, business);
                return (
                  <div key={lead.id} className="list-item auto-sug">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{lead.name || lead.company}{b.variants.length > 1 && <span className="chip cold" style={{ marginLeft: 6 }}>Version {variant.label}</span>}</div>
                      <div className="small" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{text}</div>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn primary sm" onClick={() => sendOne(lead.id, sendLink(b, text, lead))}>Open {CHANNEL_LABEL[b.channel]}</button>
                      <button className="btn ghost sm" onClick={() => mark(b.id, lead.id, "skipped")}>Skip</button>
                    </div>
                  </div>
                );
              })}
              {queue.length > 25 && <div className="small muted">and {num(queue.length - 25)} more after these</div>}
            </div>
          )}
          <p className="small faint" style={{ margin: "10px 0 0" }}>Each tap opens your own {CHANNEL_LABEL[b.channel]} with the message filled in; you press send. Only people who agreed to marketing are in this list. See <Link className="link" href="/app/audiences">Audiences</Link>.</p>
        </Panel>
      )}
    </>
  );
}
