"use client";

// App chrome: toasts, command palette, upgrade sheet, account menu, usage
// meter, mobile tab bar.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEmma } from "@/lib/store";
import { PLANS, PLAN_ORDER, formatKES } from "@/lib/plans";
import { Modal } from "./ui";
import { QUICK_COMMANDS } from "./Chat";
import {
  IconAlert, IconBox, IconCalendar, IconChat, IconCheck, IconClose, IconCommand, IconDashboard, IconFolder, IconGavel, IconMail,
  IconMegaphone, IconMenu, IconSearch, IconSettings, IconShield, IconUsers, IconBolt, IconGlobe,
} from "./icons";

export const NAV = [
  { href: "/app", label: "Command Center", short: "EMMA", icon: IconCommand },
  { href: "/app/dashboard", label: "Dashboard", short: "Dashboard", icon: IconDashboard },
  { href: "/app/calendar", label: "Content Calendar", short: "Calendar", icon: IconCalendar },
  { href: "/app/campaigns", label: "Campaigns", short: "Campaigns", icon: IconMegaphone },
  { href: "/app/leads", label: "Leads", short: "Leads", icon: IconUsers },
  { href: "/app/search", label: "Search & AI", short: "Search", icon: IconGlobe },
  { href: "/app/email", label: "Email Hub", short: "Email", icon: IconMail },
  { href: "/app/library", label: "Content Library", short: "Library", icon: IconFolder },
  { href: "/app/catalog", label: "Catalog", short: "Catalog", icon: IconBox },
  { href: "/app/roi", label: "ROI & Compliance", short: "ROI", icon: IconShield },
];
export const JURY_NAV = { href: "/app/jury", label: "Pitch Jury", short: "Jury", icon: IconGavel };
export const PROFILE_NAV = { href: "/app/settings", label: "Business Profile", short: "Profile", icon: IconSettings };
export const BILLING_NAV = { href: "/app/billing", label: "Plan & Billing", short: "Billing", icon: IconBolt };

// ---------------------------------------------------------------- toasts

export function Toasts() {
  const toasts = useEmma((s) => s.toasts);
  const dismiss = useEmma((s) => s.dismissToast);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          {t.tone === "ok" ? <IconCheck /> : t.tone === "info" ? <IconChat /> : <IconAlert />}
          <span>{t.text}</span>
          <button className="x" onClick={() => dismiss(t.id)} aria-label="Dismiss"><IconClose width={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- command palette

interface Cmd { id: string; group: string; label: string; hint?: string; icon: typeof IconCommand; run: () => void }

export function CommandPalette({ showJury }: { showJury: boolean }) {
  const open = useEmma((s) => s.paletteOpen);
  const setOpen = useEmma((s) => s.setPalette);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const newThread = useEmma((s) => s.newThread);
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!useEmma.getState().paletteOpen); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
  useEffect(() => { if (open) { setQ(""); setIdx(0); } }, [open]);

  const cmds = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => { setOpen(false); router.push(href); };
    const nav = [...NAV, ...(showJury ? [JURY_NAV] : []), PROFILE_NAV, BILLING_NAV];
    const brief = (prompt: string) => () => {
      setOpen(false);
      if (pathname !== "/app") setDrawer(true);
      void send(prompt);
    };
    return [
      { id: "new", group: "EMMA", label: "New thread", icon: IconChat, run: () => { setOpen(false); newThread(); router.push("/app"); } },
      ...QUICK_COMMANDS.map((c) => ({ id: `q-${c.label}`, group: "Ask EMMA", label: c.label, icon: c.icon, run: brief(c.prompt) })),
      ...nav.map((n) => ({ id: n.href, group: "Go to", label: n.label, icon: n.icon, run: go(n.href) })),
    ];
  }, [router, pathname, send, setDrawer, setOpen, newThread, showJury]);

  const needle = q.trim().toLowerCase();
  const typedBrief: Cmd[] = needle.length > 12 ? [{ id: "brief", group: "Ask EMMA", label: `Brief EMMA: “${q.trim()}”`, icon: IconBolt, run: () => { setOpen(false); if (pathname !== "/app") setDrawer(true); void send(q.trim()); } }] : [];
  const shown = [...typedBrief, ...cmds.filter((c) => !needle || c.label.toLowerCase().includes(needle))];
  const groups = [...new Set(shown.map((c) => c.group))];

  useEffect(() => { listRef.current?.querySelector(".palette-item.on")?.scrollIntoView({ block: "nearest" }); }, [idx]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} label="Command palette">
      <div className="row" style={{ flexWrap: "nowrap", gap: 0, paddingLeft: 16 }}>
        <IconSearch width={18} style={{ color: "var(--muted)", flex: "none" }} />
        <input
          className="palette-input" data-autofocus value={q} placeholder="Search pages and actions, or type a brief…"
          aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="palette-list"
          aria-activedescendant={shown[idx] ? `cmd-${idx}` : undefined}
          onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, shown.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); shown[idx]?.run(); }
          }}
        />
      </div>
      <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
        {shown.length === 0 && <div className="empty">Nothing matches.</div>}
        {groups.map((g) => (
          <div key={g}>
            <div className="palette-group">{g}</div>
            {shown.filter((c) => c.group === g).map((c) => {
              const i = shown.indexOf(c);
              return (
                <button key={c.id} id={`cmd-${i}`} role="option" aria-selected={i === idx} className={`palette-item ${i === idx ? "on" : ""}`} onMouseEnter={() => setIdx(i)} onClick={c.run}>
                  <c.icon />{c.label}{c.hint && <span className="hint">{c.hint}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- upgrade sheet

export function UpgradeModal() {
  const upgrade = useEmma((s) => s.upgrade);
  const close = useEmma((s) => s.closeUpgrade);
  const account = useEmma((s) => s.account);
  const router = useRouter();
  const current = account?.plan.id ?? "free";
  return (
    <Modal open={upgrade.open} onClose={close} label="Upgrade your plan" wide>
      <div style={{ padding: 22 }} className="stack">
        <div className="row">
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Get more from EMMA</h2>
            {upgrade.reason && <p className="muted small" style={{ margin: "4px 0 0" }}>{upgrade.reason}</p>}
          </div>
          <button className="btn ghost sm" onClick={close} aria-label="Close"><IconClose /></button>
        </div>
        <PlanCards current={current} onPick={(id) => { close(); router.push(`/app/billing?plan=${id}`); }} />
      </div>
    </Modal>
  );
}

export function PlanCards({ current, onPick }: { current: string; onPick: (id: "pro" | "max") => void }) {
  return (
    <div className="plans">
      {PLAN_ORDER.map((id) => {
        const p = PLANS[id];
        const isCurrent = current === id;
        return (
          <div key={id} className={`glass plan ${id === "pro" ? "featured" : ""}`}>
            {id === "pro" && <span className="chip ai tag">Most popular</span>}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              <div className="small muted">{p.modelLabel}</div>
            </div>
            <div className="price">{formatKES(p.priceKES)}<small>/ month</small></div>
            <ul>{p.features.map((f) => <li key={f}><IconCheck />{f}</li>)}</ul>
            <div style={{ marginTop: "auto" }}>
              {isCurrent ? <button className="btn sm" disabled style={{ width: "100%" }}>Your plan</button>
                : id === "free" ? <span className="small faint">Always free</span>
                : <button className={`btn ${id === "pro" ? "ai" : "primary"}`} style={{ width: "100%" }} onClick={() => onPick(id)}>Upgrade to {p.name}</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- usage meter + account menu

export function UsageMeter() {
  const account = useEmma((s) => s.account);
  const openUpgrade = useEmma((s) => s.openUpgrade);
  if (!account || account.plan.id === "demo") return null;
  const used = account.usage.briefs, limit = account.limits.briefs;
  const v = limit ? Math.min(1, used / limit) : 0;
  const near = v >= 0.8;
  return (
    <div className="usage">
      <div className="top"><span><b>{account.plan.name}</b> plan</span><span className="mono">{used}/{limit} briefs</span></div>
      <div className="meter-track" role="meter" aria-label="Briefs used this month" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit}>
        <div className="meter-fill" style={{ width: `${v * 100}%`, background: near ? "var(--warn)" : undefined }} />
      </div>
      {account.plan.id !== "max" && (
        <button className={`btn sm ${near ? "ai" : "ghost"}`} onClick={() => openUpgrade(near ? "You're close to this month's limit." : null)}>
          {near ? "Upgrade before you run out" : "See plans"}
        </button>
      )}
    </div>
  );
}

export function AccountMenu() {
  const account = useEmma((s) => s.account);
  const ws = useEmma((s) => s.ws);
  const wsId = useEmma((s) => s.wsId);
  const selectWorkspace = useEmma((s) => s.selectWorkspace);
  const signOut = useEmma((s) => s.signOut);
  const mode = useEmma((s) => s.mode);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const others = (account?.workspaces ?? []).filter((w) => w.id !== wsId);
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="client-chip" style={{ width: "100%", cursor: "pointer", textAlign: "left" }} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
        <span className="dot">{(ws.profile.name || "E").slice(0, 1)}</span>
        <div className="meta" style={{ flex: 1 }}>
          <div className="name">{ws.profile.name || "Your business"}</div>
          <div className="sub">{mode === "demo" ? "Demo workspace" : account?.user.email ?? ""}</div>
        </div>
        <IconMenu width={16} style={{ color: "var(--muted)" }} />
      </button>
      {open && (
        <div className="menu up" role="menu">
          {others.length > 0 && (
            <>
              <div className="meta">Switch workspace</div>
              {others.map((w) => <button key={w.id} role="menuitem" onClick={() => { setOpen(false); void selectWorkspace(w.id); }}><IconBox />{w.name}</button>)}
              <hr />
            </>
          )}
          <Link role="menuitem" href={PROFILE_NAV.href} onClick={() => setOpen(false)}><IconSettings />Business profile</Link>
          {mode === "cloud" && <Link role="menuitem" href={BILLING_NAV.href} onClick={() => setOpen(false)}><IconBolt />Plan & billing</Link>}
          <Link role="menuitem" href="/legal/privacy" onClick={() => setOpen(false)}><IconShield />Privacy</Link>
          {mode === "cloud" && (<><hr /><button role="menuitem" onClick={() => void signOut()}><IconClose />Log out</button></>)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- top bar account button

const initials = (name: string, email: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? email[0] ?? "Y").toUpperCase();
};

export function UserMenu() {
  const account = useEmma((s) => s.account);
  const signOut = useEmma((s) => s.signOut);
  const mode = useEmma((s) => s.mode);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  if (mode !== "cloud" || !account) return null;
  const { name, email } = account.user;
  const close = () => setOpen(false);
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="avatar-btn" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Your account">
        {initials(name, email ?? "")}
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-id">
            <div className="name">{name || "Your account"}</div>
            <div className="sub">{email}</div>
          </div>
          <hr />
          <Link role="menuitem" href="/app/settings#account" onClick={close}><IconUsers />Your profile</Link>
          <Link role="menuitem" href="/app/settings#business" onClick={close}><IconSettings />Business profile</Link>
          <Link role="menuitem" href="/app/settings#security" onClick={close}><IconShield />Sign-in security</Link>
          <Link role="menuitem" href={BILLING_NAV.href} onClick={close}><IconBolt />Plan & billing</Link>
          <hr />
          <button role="menuitem" disabled={leaving} onClick={() => { setLeaving(true); void signOut(); }}><IconClose />{leaving ? "Logging out…" : "Log out"}</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- mobile tab bar

export function TabBar() {
  const pathname = usePathname();
  const setPalette = useEmma((s) => s.setPalette);
  const tabs = [NAV[0], NAV[2], NAV[4], NAV[1]];
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={pathname === t.href ? "on" : ""} aria-current={pathname === t.href ? "page" : undefined}><t.icon />{t.short}</Link>
      ))}
      <button onClick={() => setPalette(true)} aria-label="More"><IconSearch />More</button>
    </nav>
  );
}
