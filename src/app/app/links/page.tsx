"use client";

// Smart links: tracked short links with channel tags, QR codes, A/B pairs and click analytics.
// EMMA's answer to app-marketing "attribution links", built for WhatsApp, posters and Instagram bios.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEmma } from "@/lib/store";
import { num, relTime } from "@/lib/metrics";
import { Modal, Panel, Sk, Stat } from "@/components/ui";
import { Sparkline } from "@/components/Charts";
import { QRCode, downloadPng, downloadSvg } from "@/components/QR";
import { IconCheck, IconClose, IconLink, IconPlus } from "@/components/icons";

interface LinkStats { clicks: number; unique: number; bots: number; last7: number; daily: number[]; referrers: Record<string, number>; devices: Record<string, number>; countries: Record<string, number> }
interface SmartLink { code: string; name: string; destination: string; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; ab_group: string | null; archived: boolean; created_at: string; short: string; stats?: LinkStats }

const CHANNELS: { id: string; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" }, { id: "instagram", label: "Instagram" }, { id: "facebook", label: "Facebook" }, { id: "tiktok", label: "TikTok" },
  { id: "poster", label: "Poster / QR" }, { id: "email", label: "Email" }, { id: "sms", label: "SMS" }, { id: "ads", label: "Paid ads" },
];

const top = (r: Record<string, number>, n = 3) => Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, n);
const fileName = (s: string) => s.replace(/[^a-z0-9]+/gi, " ").trim().split(" ").map((w) => w[0]?.toUpperCase() + w.slice(1)).join("") || "EmmaLink";

export default function LinksPage() {
  const mode = useEmma((s) => s.mode);
  const wsId = useEmma((s) => s.wsId);
  const toast = useEmma((s) => s.toast);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  const [links, setLinks] = useState<SmartLink[] | null>(null);
  const [limit, setLimit] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<SmartLink | null>(null);
  const [showOff, setShowOff] = useState(false);

  const load = useCallback(async () => {
    if (!wsId) return;
    const res = await fetch(`/api/links?workspaceId=${encodeURIComponent(wsId)}`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { links?: SmartLink[]; limit?: number; error?: string };
    if (!res.ok) { setError(body.error ?? "Couldn't load your links."); setLinks([]); return; }
    setLinks(body.links ?? []); setLimit(body.limit ?? 0); setError(null);
  }, [wsId]);
  useEffect(() => { void load(); }, [load]);

  if (mode !== "cloud") return <Panel><p className="muted" style={{ margin: 0 }}>Smart links need an EMMA account, because clicks are counted on our servers.</p></Panel>;

  const active = (links ?? []).filter((l) => !l.archived);
  const off = (links ?? []).filter((l) => l.archived);
  const total = active.reduce((a, l) => a + (l.stats?.clicks ?? 0), 0);
  const unique = active.reduce((a, l) => a + (l.stats?.unique ?? 0), 0);
  const last7 = active.reduce((a, l) => a + (l.stats?.last7 ?? 0), 0);
  const daily = Array.from({ length: 30 }, (_, i) => active.reduce((a, l) => a + (l.stats?.daily[i] ?? 0), 0));

  // A/B: links sharing an ab_group are compared on unique visitors.
  const groups = new Map<string, SmartLink[]>();
  for (const l of active) if (l.ab_group) groups.set(l.ab_group, [...(groups.get(l.ab_group) ?? []), l]);
  const singles = active.filter((l) => !l.ab_group || (groups.get(l.ab_group)?.length ?? 0) < 2);

  const setArchived = async (l: SmartLink, archived: boolean) => {
    const res = await fetch(`/api/links/${l.code}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived }) });
    const body = (await res.json().catch(() => ({}))) as { error?: string; upgrade?: boolean };
    if (!res.ok) { if (body.upgrade) openUpgrade(body.error ?? null); else toast(body.error ?? "Couldn't change the link.", "risk"); return; }
    toast(archived ? "Link switched off. It now shows a 'not active' page." : "Link is live again.", "ok");
    void load();
  };

  return (
    <div className="stack">
      <div className="grid cols-4">
        <Stat label="Clicks, 30 days" value={links ? num(daily.reduce((a, b) => a + b, 0)) : <Sk w={60} h={24} />} foot={<Sparkline values={daily} width={120} height={24} />} />
        <Stat label="People, 90 days" value={links ? num(unique) : <Sk w={60} h={24} />} foot="Unique visitors per day, bots excluded" />
        <Stat label="Last 7 days" value={links ? num(last7) : <Sk w={60} h={24} />} foot={`${num(total)} clicks in 90 days`} />
        <Stat label="Active links" value={links ? `${active.length} / ${limit}` : <Sk w={60} h={24} />} foot="On your plan" />
      </div>

      <CreateLink onCreated={() => void load()} />

      {error && <div className="err" role="alert">{error}</div>}
      {!links && <div className="glass panel stack" aria-busy="true"><Sk w="40%" h={14} /><Sk w="90%" h={10} /><Sk w="70%" h={10} /></div>}

      {[...groups.entries()].filter(([, ls]) => ls.length >= 2).map(([g, ls]) => <ABGroup key={g} name={g} links={ls} onQr={setQr} onOff={(l) => void setArchived(l, true)} />)}

      {links && singles.length > 0 && (
        <Panel title="Your links" hint={`${singles.length}`}>
          <div className="list">{singles.map((l) => <LinkRow key={l.code} l={l} onQr={() => setQr(l)} onOff={() => void setArchived(l, true)} />)}</div>
        </Panel>
      )}
      {links && active.length === 0 && !error && (
        <Panel><p className="muted" style={{ margin: 0 }}>Make a link for every place you share: your WhatsApp status, Instagram bio, a poster at the shop. EMMA counts the clicks from each, so you know which channel brings customers.</p></Panel>
      )}

      {off.length > 0 && (
        <div>
          <button className="btn ghost sm" onClick={() => setShowOff(!showOff)} aria-expanded={showOff}>{showOff ? "Hide" : "Show"} {off.length} switched-off link{off.length === 1 ? "" : "s"}</button>
          {showOff && <div className="list" style={{ marginTop: 8 }}>{off.map((l) => (
            <div key={l.code} className="list-item"><span className="chip cold"><IconClose />Off</span><div style={{ flex: 1, minWidth: 0 }} className="small"><b>{l.name}</b> <span className="muted">{l.short.replace(/^https?:\/\//, "")}</span></div><button className="btn ghost sm" onClick={() => void setArchived(l, false)}>Switch on</button></div>
          ))}</div>}
        </div>
      )}

      <Modal open={Boolean(qr)} onClose={() => setQr(null)} label="QR code">
        {qr && (
          <div className="stack" style={{ padding: 22, alignItems: "center", textAlign: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{qr.name}</h2>
            <QRCode text={qr.short} size={240} label={`QR code for ${qr.short}`} />
            <div className="small muted mono" style={{ overflowWrap: "anywhere" }}>{qr.short.replace(/^https?:\/\//, "")}</div>
            <div className="row" style={{ justifyContent: "center" }}>
              <button className="btn primary sm" onClick={() => downloadPng(qr.short, fileName(qr.name))}>Download PNG</button>
              <button className="btn sm" onClick={() => downloadSvg(qr.short, fileName(qr.name))}>Download SVG (print)</button>
            </div>
            <p className="small faint" style={{ margin: 0 }}>Scans are counted on this link, so print this one QR on posters, receipts and packaging.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateLink({ onCreated }: { onCreated: () => void }) {
  const wsId = useEmma((s) => s.wsId);
  const website = useEmma((s) => s.ws.profile.website);
  const toast = useEmma((s) => s.toast);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  const [name, setName] = useState("");
  const [dest, setDest] = useState(website || "");
  const [channel, setChannel] = useState("whatsapp");
  const [campaign, setCampaign] = useState("");
  const [ab, setAb] = useState(false);
  const [destB, setDestB] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const make = async (payload: object) => {
    const res = await fetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = (await res.json().catch(() => ({}))) as { error?: string; upgrade?: boolean };
    return { ok: res.ok, body };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!wsId) return;
    if (!name.trim() || !dest.trim()) { setError("Give the link a name and the page it should open."); return; }
    setBusy(true);
    const camp = campaign.trim() || undefined;
    const base = { workspaceId: wsId, channel, ...(camp ? { utm: { campaign: camp.toLowerCase().replace(/\s+/g, "_") } } : {}) };
    const group = ab ? name.trim() : undefined;
    const a = await make({ ...base, name: ab ? `${name.trim()} (A)` : name.trim(), destination: dest.trim(), abGroup: group, ...(ab ? { utm: { ...(camp ? { campaign: camp.toLowerCase().replace(/\s+/g, "_") } : {}), content: "a" } } : {}) });
    let b = { ok: true, body: {} as { error?: string; upgrade?: boolean } };
    if (a.ok && ab) b = await make({ ...base, name: `${name.trim()} (B)`, destination: (destB.trim() || dest.trim()), abGroup: group, utm: { ...(camp ? { campaign: camp.toLowerCase().replace(/\s+/g, "_") } : {}), content: "b" } });
    setBusy(false);
    const failed = !a.ok ? a : !b.ok ? b : null;
    if (failed) { if (failed.body.upgrade) openUpgrade(failed.body.error ?? null); else setError(failed.body.error ?? "Couldn't create the link."); if (a.ok) onCreated(); return; }
    toast(ab ? "A/B pair created. Share A and B in the same kind of place to compare." : "Link created. Copy it or download its QR.", "ok");
    setName(""); setCampaign(""); setAb(false); setDestB("");
    onCreated();
  };

  return (
    <Panel title="New smart link">
      <form onSubmit={submit} className="stack" style={{ gap: 12 }} noValidate>
        <div className="grid cols-2">
          <div className="field"><label htmlFor="ln-name">Name</label><input id="ln-name" className="input" maxLength={100} placeholder="Weekend offer, WhatsApp status" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="ln-dest">Opens</label><input id="ln-dest" className="input" inputMode="url" placeholder="mybusiness.co.ke/offer" value={dest} onChange={(e) => setDest(e.target.value)} /></div>
        </div>
        <div className="field">
          <span className="small" style={{ fontWeight: 600 }} id="ln-ch">Where you'll share it</span>
          <div className="row links-channels" role="radiogroup" aria-labelledby="ln-ch">
            {CHANNELS.map((c) => <button type="button" key={c.id} role="radio" aria-checked={channel === c.id} className={`chip ${channel === c.id ? "accent" : ""}`} onClick={() => setChannel(c.id)}>{channel === c.id && <IconCheck />}{c.label}</button>)}
          </div>
        </div>
        <div className="grid cols-2">
          <div className="field"><label htmlFor="ln-camp">Campaign (optional)</label><input id="ln-camp" className="input" maxLength={60} placeholder="December sale" value={campaign} onChange={(e) => setCampaign(e.target.value)} /></div>
          <label className="row small" style={{ gap: 8, alignSelf: "end", cursor: "pointer" }}><input type="checkbox" checked={ab} onChange={(e) => setAb(e.target.checked)} style={{ accentColor: "var(--accent)" }} />A/B test: make two versions and see which gets more people</label>
        </div>
        {ab && <div className="field"><label htmlFor="ln-destb">Version B opens (leave empty to test two captions with the same page)</label><input id="ln-destb" className="input" inputMode="url" placeholder="mybusiness.co.ke/offer-b" value={destB} onChange={(e) => setDestB(e.target.value)} /></div>}
        {error && <div className="err" role="alert">{error}</div>}
        <div className="row"><button className="btn ai" type="submit" disabled={busy}><IconPlus />{busy ? "Creating…" : ab ? "Create A and B" : "Create link"}</button></div>
      </form>
    </Panel>
  );
}

function useCopy() {
  const toast = useEmma((s) => s.toast);
  return async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast("Link copied.", "ok"); } catch { toast("Couldn't copy. Select the link and copy it yourself.", "warn"); }
  };
}

function LinkRow({ l, onQr, onOff }: { l: SmartLink; onQr: () => void; onOff: () => void }) {
  const copy = useCopy();
  const s = l.stats;
  return (
    <div className="list-item links-row">
      <IconLink width={18} style={{ color: "var(--muted)", flex: "none", marginTop: 3 }} />
      <div style={{ flex: 1, minWidth: 0 }} className="stack links-main">
        <div className="row" style={{ gap: 8 }}>
          <b>{l.name}</b>
          {l.utm_source && <span className="chip">{l.utm_source}</span>}
          {l.utm_campaign && <span className="chip cold">{l.utm_campaign}</span>}
        </div>
        <div className="small mono" style={{ overflowWrap: "anywhere" }}>{l.short.replace(/^https?:\/\//, "")} <span className="faint">→ {l.destination.replace(/^https?:\/\//, "").slice(0, 60)}</span></div>
        {s && s.clicks > 0 && <div className="small muted">Top: {top(s.referrers).map(([k, v]) => `${k} ${v}`).join(" · ")} · {top(s.devices, 2).map(([k, v]) => `${k} ${v}`).join(" · ")}</div>}
        <div className="small faint">Created {relTime(l.created_at)}{s && s.bots ? ` · ${s.bots} link previews and bots not counted` : ""}</div>
      </div>
      <div className="links-num stack" style={{ gap: 2, alignItems: "flex-end" }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>{num(s?.clicks ?? 0)}</div>
        <div className="small muted">{num(s?.unique ?? 0)} people</div>
        {s && <Sparkline values={s.daily} width={90} height={20} />}
      </div>
      <div className="row links-actions" style={{ gap: 6 }}>
        <button className="btn sm" onClick={() => void copy(l.short)}>Copy</button>
        <button className="btn ghost sm" onClick={onQr}>QR</button>
        <button className="btn ghost sm" onClick={onOff} aria-label={`Switch off ${l.name}`}>Switch off</button>
      </div>
    </div>
  );
}

function ABGroup({ name, links, onQr, onOff }: { name: string; links: SmartLink[]; onQr: (l: SmartLink) => void; onOff: (l: SmartLink) => void }) {
  const sorted = useMemo(() => [...links].sort((a, b) => (a.utm_content ?? a.name).localeCompare(b.utm_content ?? b.name)), [links]);
  const people = sorted.map((l) => l.stats?.unique ?? 0);
  const total = people.reduce((a, b) => a + b, 0);
  const best = Math.max(...people);
  const lead = people.indexOf(best);
  const second = [...people].sort((a, b) => b - a)[1] ?? 0;
  // Plain-language confidence: needs volume and a clear gap before calling a winner.
  const verdict = total < 30 ? "Too early: share both until at least 30 people have clicked." : best >= second * 1.25 && best - second >= 10 ? `Version ${String.fromCharCode(65 + lead)} is winning.` : "Too close to call yet.";
  return (
    <Panel title={`A/B test: ${name}`} hint={`${num(total)} people`}>
      <div className="stack" style={{ gap: 10 }}>
        <div className={`banner`} role="status">{total >= 30 && best >= second * 1.25 && best - second >= 10 ? <IconCheck /> : null}{verdict}</div>
        <div className="list">{sorted.map((l) => <LinkRow key={l.code} l={l} onQr={() => onQr(l)} onOff={() => onOff(l)} />)}</div>
      </div>
    </Panel>
  );
}
