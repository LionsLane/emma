"use client";

import { useRef, useState, type ReactNode } from "react";
import { useEmma, uid } from "@/lib/store";
import { blankWorkspace, seedWorkspace } from "@/lib/seed";
import type { ClientProfile, KeyDate, Offering, Partner } from "@/lib/types";
import { Panel } from "@/components/ui";
import { MAX_IMPORT_BYTES, parseWorkspaceImport } from "@/lib/importWorkspace";
import { useHealth } from "@/components/health";
import { IconPlus, IconTrash } from "@/components/icons";
import { usageCostUSD } from "@/lib/jury";
import { num } from "@/lib/metrics";
import { SecurityPanel } from "@/components/Security";

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function Settings() {
  const ws = useEmma((s) => s.ws);
  const update = useEmma((s) => s.updateProfile);
  const importWorkspace = useEmma((s) => s.importWorkspace);
  const mode = useEmma((s) => s.mode);
  const health = useHealth();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const p = ws.profile;

  const setBrand = (b: Partial<ClientProfile["brand"]>) => update({ brand: { ...p.brand, ...b } });
  const setPalette = (k: keyof ClientProfile["brand"]["palette"], v: string) => setBrand({ palette: { ...p.brand.palette, [k]: v } });

  const exportWs = () => {
    const blob = new Blob([JSON.stringify(ws, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${p.name.replace(/[^a-z0-9]+/gi, "")}EmmaWorkspace.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importWs = async (f: File) => {
    if (f.size > MAX_IMPORT_BYTES) { setMsg("That file is too large to import."); return; }
    const r = parseWorkspaceImport(await f.text());
    if (!r.ok) { setMsg(r.error); return; }
    importWorkspace(r.ws);
    setMsg(`Loaded ${r.ws.profile.name}.`);
  };

  const confirmThen = (q: string, fn: () => void) => { if (window.confirm(q)) fn(); };

  return (
    <div className="stack">
      <Panel title="Identity">
        <div className="grid cols-3">
          <Field label="Business name"><input className="input" value={p.name} onChange={(e) => update({ name: e.target.value })} /></Field>
          <Field label="Industry"><input className="input" value={p.industry} onChange={(e) => update({ industry: e.target.value })} /></Field>
          <Field label="Location"><input className="input" value={p.location} onChange={(e) => update({ location: e.target.value })} /></Field>
          <Field label="Tagline"><input className="input" value={p.tagline} onChange={(e) => update({ tagline: e.target.value })} /></Field>
          <Field label="Website"><input className="input" value={p.website} onChange={(e) => update({ website: e.target.value })} /></Field>
          <Field label="Currency"><input className="input" value={p.currency} onChange={(e) => update({ currency: e.target.value.toUpperCase().slice(0, 3) })} /></Field>
        </div>
      </Panel>

      <Panel title="1 · Sectors">
        <Field label="Comma-separated" help="e.g. Hospitality, Corporate offices, Retail">
          <input key={p.sectors.join()} className="input" defaultValue={p.sectors.join(", ")} onBlur={(e) => update({ sectors: list(e.target.value) })} />
        </Field>
      </Panel>

      <Panel title="2 · Offerings"
        right={<button className="btn sm" onClick={() => update({ offerings: [...p.offerings, { id: uid("off"), name: "New offering", kind: "service", price: 0, description: "", customers: 0, rating: 0, repeatRate: 0, revenue: 0 }] })}><IconPlus />Add</button>}>
        <Rows<Offering>
          items={p.offerings}
          onChange={(offerings) => update({ offerings })}
          cols={[
            { key: "name", label: "Name", w: 2 }, { key: "kind", label: "Kind" }, { key: "price", label: "Price", type: "number" },
            { key: "description", label: "Description", w: 3 }, { key: "customers", label: "Customers", type: "number" }, { key: "revenue", label: "Revenue", type: "number" },
          ]}
        />
      </Panel>

      <Panel title="3 · Partners & accounts"
        right={<button className="btn sm" onClick={() => update({ partners: [...p.partners, { id: uid("p"), name: "New partner", sector: p.sectors[0] ?? "", contact: "", email: "", phone: "", social: "", website: "", relationship: "" }] })}><IconPlus />Add</button>}>
        <Rows<Partner>
          items={p.partners}
          onChange={(partners) => update({ partners })}
          cols={[
            { key: "name", label: "Business", w: 2 }, { key: "sector", label: "Sector" }, { key: "contact", label: "Contact" },
            { key: "email", label: "Email", w: 2 }, { key: "phone", label: "Phone" }, { key: "relationship", label: "Relationship", w: 2 },
          ]}
        />
      </Panel>

      <Panel title="4 · Key dates"
        right={<button className="btn sm" onClick={() => update({ keyDates: [...p.keyDates, { id: uid("k"), name: "New date", date: new Date().toISOString().slice(0, 10), kind: "event", note: "" }] })}><IconPlus />Add</button>}>
        <Rows<KeyDate>
          items={[...p.keyDates].sort((a, b) => a.date.localeCompare(b.date))}
          onChange={(keyDates) => update({ keyDates })}
          cols={[
            { key: "date", label: "Date", type: "date" }, { key: "name", label: "Name", w: 2 },
            { key: "kind", label: "Kind", options: ["launch", "event", "season", "holiday", "deadline"] }, { key: "note", label: "Note", w: 3 },
          ]}
        />
      </Panel>

      <Panel title="5 · Brand voice & palette">
        <div className="grid cols-2">
          <div className="stack">
            <Field label="Voice"><textarea className="textarea" value={p.brand.voice} onChange={(e) => setBrand({ voice: e.target.value })} /></Field>
            <Field label="Theme pillars" help="Comma-separated"><input key={p.brand.pillars.join()} className="input" defaultValue={p.brand.pillars.join(", ")} onBlur={(e) => setBrand({ pillars: list(e.target.value) })} /></Field>
            <Field label="Always" help="Comma-separated"><input key={p.brand.doSay.join()} className="input" defaultValue={p.brand.doSay.join(", ")} onBlur={(e) => setBrand({ doSay: list(e.target.value) })} /></Field>
            <Field label="Never" help="Comma-separated"><input key={p.brand.dontSay.join()} className="input" defaultValue={p.brand.dontSay.join(", ")} onBlur={(e) => setBrand({ dontSay: list(e.target.value) })} /></Field>
          </div>
          <div className="stack">
            <div className="small muted">Palette: the interface re-skins live. Keep the AI pair distinct from the primary so people always know when a machine is doing the work.</div>
            <div className="grid cols-2">
              {([["primary", "Primary"], ["accent", "Accent (alive / actionable)"], ["aiFrom", "AI gradient start"], ["aiTo", "AI gradient end"]] as const).map(([k, label]) => (
                <Field key={k} label={label}>
                  <div className="row" style={{ flexWrap: "nowrap" }}>
                    <input type="color" value={p.brand.palette[k]} onChange={(e) => setPalette(k, e.target.value)} style={{ width: 44, height: 36, border: 0, background: "transparent", padding: 0, cursor: "pointer" }} aria-label={label} />
                    <input className="input mono" value={p.brand.palette[k]} onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && setPalette(k, e.target.value)} />
                  </div>
                </Field>
              ))}
            </div>
            <div className="row">
              <button className="btn ai sm">AI action preview</button>
              <button className="btn primary sm">Primary</button>
              <span className="chip accent">Accent</span>
              <button className="btn ghost sm" onClick={() => setBrand({ palette: seedWorkspace().profile.brand.palette })}>Reset to B-18</button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="6 · Compliance regime">
        <div className="grid cols-3">
          <Field label="Law"><input className="input" value={p.compliance.regime} onChange={(e) => update({ compliance: { ...p.compliance, regime: e.target.value } })} /></Field>
          <Field label="Regulator"><input className="input" value={p.compliance.regulator} onChange={(e) => update({ compliance: { ...p.compliance, regulator: e.target.value } })} /></Field>
          <Field label="Rules EMMA must follow"><input className="input" value={p.compliance.notes} onChange={(e) => update({ compliance: { ...p.compliance, notes: e.target.value } })} /></Field>
        </div>
      </Panel>

      <UsageAndData />

      {mode === "cloud" && <SecurityPanel />}

      <div className="grid cols-2">
        <Panel title="Your data">
          <div className="stack">
            <div className="row">
              <button className="btn sm" onClick={exportWs}>Export workspace</button>
              <button className="btn sm" onClick={() => file.current?.click()}>Import</button>
              <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && confirmThen("Replace this workspace with the imported file?", () => void importWs(e.target.files![0]))} />
              {mode === "cloud" ? (
                <NewWorkspace onDone={setMsg} />
              ) : (
                <>
                  <button className="btn sm" onClick={() => confirmThen("Start a blank workspace? Export this one first if you want to keep it.", () => { importWorkspace(blankWorkspace()); setMsg("Blank workspace ready. Fill in the six inputs above."); })}>New workspace</button>
                  <button className="btn ghost sm danger" onClick={() => confirmThen("Reset to the Jua Coffee demo? This replaces the current workspace and conversation.", () => { importWorkspace(seedWorkspace()); setMsg("Demo restored."); })}>Reset demo</button>
                </>
              )}
            </div>
            {msg && <div className="small" role="status" style={{ color: "var(--accent)" }}>{msg}</div>}
          </div>
        </Panel>
        {mode === "cloud" ? <DeleteAccount /> : (
          <Panel title="Connection">
            <div className="row">
              <span className={`live-dot ${health.connected ? "" : "off"}`} />
              <span>{health.connected === null ? "Checking…" : health.connected ? "AI connected (demo mode, no accounts)" : "Not connected. Set ANTHROPIC_API_KEY in .env.local and restart."}</span>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

function NewWorkspace({ onDone }: { onDone: (m: string) => void }) {
  const refreshAccount = useEmma((s) => s.refreshAccount);
  const selectWorkspace = useEmma((s) => s.selectWorkspace);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  const [busy, setBusy] = useState(false);
  const create = async () => {
    const name = window.prompt("Name of the new brand or business");
    if (!name?.trim()) return;
    setBusy(true);
    const res = await fetch("/api/workspaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
    const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string; upgrade?: boolean };
    setBusy(false);
    if (!res.ok || !body.id) { if (body.upgrade) openUpgrade(body.error ?? null); else onDone(body.error ?? "Couldn't create the workspace."); return; }
    await refreshAccount();
    await selectWorkspace(body.id);
    onDone(`${name.trim()} is ready. Fill in its profile above.`);
  };
  return <button className="btn sm" onClick={create} disabled={busy}>{busy ? "Creating…" : "New workspace"}</button>;
}

function DeleteAccount() {
  const toast = useEmma((s) => s.toast);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const del = async () => {
    setBusy(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) { setBusy(false); toast("Couldn't delete the account. Contact support.", "risk"); return; }
    window.location.href = "/";
  };
  return (
    <Panel title="Delete account">
      <div className="stack" style={{ gap: 10 }}>
        <p className="small muted" style={{ margin: 0 }}>Deletes your account, your workspaces and everything in them. This can&apos;t be undone. Export first if you want a copy.</p>
        <div className="field">
          <label htmlFor="del">Type DELETE to confirm</label>
          <input id="del" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        </div>
        <button className="btn danger" onClick={del} disabled={busy || confirm !== "DELETE"}>{busy ? "Deleting…" : "Delete my account"}</button>
      </div>
    </Panel>
  );
}

function UsageAndData() {
  const mode = useEmma((s) => s.mode);
  const account = useEmma((s) => s.account);
  const usage = useEmma((s) => s.ws.usage ?? []);
  const month = new Date().toISOString().slice(0, 7);
  const cur = usage.find((m) => m.month === month);
  const cloud = mode === "cloud" && account;
  return (
    <div className="grid cols-2">
      <Panel title="Usage this month">
        {cloud ? (
          <div className="grid cols-3">
            <div><div className="small muted">Briefs</div><div className="mono" style={{ fontSize: 20 }}>{account.usage.briefs}/{account.limits.briefs}</div></div>
            <div><div className="small muted">Web searches</div><div className="mono" style={{ fontSize: 20 }}>{account.limits.searches ? `${account.usage.searches}/${account.limits.searches}` : "—"}</div></div>
            <div><div className="small muted">AI cost</div><div className="mono" style={{ fontSize: 20 }}>${account.usage.costUSD.toFixed(2)}</div></div>
          </div>
        ) : (
          <div className="grid cols-3">
            <div><div className="small muted">AI cost</div><div className="mono" style={{ fontSize: 20 }}>${usageCostUSD(cur ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0, requests: 0 }).toFixed(2)}</div></div>
            <div><div className="small muted">Requests</div><div className="mono" style={{ fontSize: 20 }}>{num(cur?.requests ?? 0)}</div></div>
            <div><div className="small muted">Web searches</div><div className="mono" style={{ fontSize: 20 }}>{num(cur?.searches ?? 0)}</div></div>
          </div>
        )}
      </Panel>
      <Panel title="Where your data goes">
        <ul className="small" style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", lineHeight: 1.7 }}>
          {cloud
            ? <li>Your workspace is stored in our database (Supabase), private to your account and the people you add.</li>
            : <li>Demo mode: the workspace lives only in this browser.</li>}
          <li>When you brief EMMA, your message, the conversation and the relevant parts of this workspace go to Anthropic&apos;s Claude API to be processed (outside Kenya). It isn&apos;t used to train AI models.</li>
          <li>The Pitch Jury sends only the pitch, audience, price and context.</li>
          <li>Nothing EMMA drafts is published or sent until a person approves and posts it.</li>
        </ul>
        <p className="small" style={{ marginBottom: 0 }}><a className="link" href="/legal/privacy">Privacy policy</a></p>
      </Panel>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return <div className="field"><label>{label}</label>{children}{help && <span className="help">{help}</span>}</div>;
}

interface Col<T> { key: keyof T & string; label: string; w?: number; type?: "text" | "number" | "date"; options?: string[] }

function Rows<T extends { id: string }>({ items, onChange, cols }: { items: T[]; onChange: (items: T[]) => void; cols: Col<T>[] }) {
  const set = (id: string, key: keyof T, raw: string, type?: string) =>
    onChange(items.map((it) => (it.id === id ? { ...it, [key]: type === "number" ? Number(raw) || 0 : raw } : it)));
  if (!items.length) return <div className="empty">Nothing yet.</div>;
  return (
    <div className="table-wrap">
      <table className="t">
        <thead><tr>{cols.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              {cols.map((c) => (
                <td key={c.key} style={{ minWidth: (c.w ?? 1) * 110, padding: "6px 6px" }}>
                  {c.options ? (
                    <select className="select sm" style={{ width: "100%" }} value={String(it[c.key] ?? "")} onChange={(e) => set(it.id, c.key, e.target.value)} aria-label={c.label}>
                      {c.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="input sm" style={{ width: "100%", paddingRight: 9 }} type={c.type ?? "text"} value={String(it[c.key] ?? "")} onChange={(e) => set(it.id, c.key, e.target.value, c.type)} aria-label={c.label} />
                  )}
                </td>
              ))}
              <td><button className="btn ghost sm danger" onClick={() => onChange(items.filter((x) => x.id !== it.id))} aria-label="Remove"><IconTrash /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
