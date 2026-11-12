"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEmma } from "@/lib/store";
import { evaluate } from "@/lib/automations";
import { Orb } from "./Orb";
import { PageSkeleton, Sheet, Sk } from "./ui";
import { Composer, QuickCommands, Thread } from "./Chat";
import { useHealth } from "./health";
import { AccountMenu, BILLING_NAV, CommandPalette, JURY_NAV, NAV, PROFILE_NAV, TabBar, Toasts, UpgradeModal, UsageMeter, UserMenu } from "./Chrome";
import { IconChat, IconClose, IconMenu, IconRefresh, IconSearch } from "./icons";

// Sidebar sections (Command Center sits above them). Every NAV entry appears in exactly one group.
const NAV_GROUPS: { label: string; hrefs: string[] }[] = [
  { label: "Plan & create", hrefs: ["/app/dashboard", "/app/calendar", "/app/campaigns", "/app/library"] },
  { label: "Customers", hrefs: ["/app/leads", "/app/audiences", "/app/automations", "/app/email"] },
  { label: "Grow", hrefs: ["/app/search", "/app/links", "/app/catalog", "/app/roi"] },
];

const TITLES: Record<string, string> = Object.fromEntries(
  [...NAV, JURY_NAV, PROFILE_NAV, BILLING_NAV].map((n) => [n.href, n.label]),
);

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const mode = useEmma((s) => s.mode);
  const ready = useEmma((s) => s.ready);
  const account = useEmma((s) => s.account);
  const ws = useEmma((s) => s.ws);
  const busy = useEmma((s) => s.busy);
  const saveState = useEmma((s) => s.saveState);
  const pending = useEmma((s) => Object.values(s.proposals).filter((p) => p.status === "pending").length);
  const drawerOpen = useEmma((s) => s.drawerOpen);
  const setDrawer = useEmma((s) => s.setDrawer);
  const setPalette = useEmma((s) => s.setPalette);
  const bootstrap = useEmma((s) => s.bootstrap);
  const health = useHealth();

  useEffect(() => setHydrated(true), []);
  useEffect(() => setNavOpen(false), [pathname]);

  // Phone drawer: Escape closes it, the page behind can't scroll, and focus moves in and back out.
  const menuBtn = useRef<HTMLButtonElement>(null);
  const sideRef = useRef<HTMLElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setNavOpen(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (sideRef.current?.querySelector<HTMLElement>(".nav a.active") ?? sideRef.current?.querySelector<HTMLElement>(".nav a"))?.focus();
    const btn = menuBtn.current;
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; btn?.focus(); };
  }, [navOpen]);
  // Keep the current page's link in view inside the sidebar's own scroll area.
  useEffect(() => {
    sideRef.current?.querySelector<HTMLElement>(".nav a.active")?.scrollIntoView({ block: "nearest" });
  }, [pathname, hydrated]);

  // Cloud: who is this, and do they have a workspace yet?
  useEffect(() => {
    if (!hydrated || mode !== "cloud") return;
    let live = true;
    void bootstrap().then((r) => {
      if (!live) return;
      if (r === "signin") router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      else if (r === "welcome" && pathname !== "/app/welcome") router.replace("/app/welcome");
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, mode]);

  // Re-skin: the client's palette drives the brand tokens.
  const pal = ws.profile.brand.palette;
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--primary", pal.primary);
    r.setProperty("--accent", pal.accent);
    r.setProperty("--ai-from", pal.aiFrom);
    r.setProperty("--ai-to", pal.aiTo);
  }, [pal.primary, pal.accent, pal.aiFrom, pal.aiTo]);

  // Onboarding gets the whole screen.
  if (pathname === "/app/welcome") return <>{hydrated ? children : null}<Toasts /></>;

  if (!hydrated || !ready) return <ShellSkeleton />;

  const showJury = mode === "demo" || Boolean(account?.user.staff) || account?.plan.id === "max";
  const hotLeads = ws.leads.filter((l) => l.score >= 75 && l.stage !== "won" && l.stage !== "lost").length;
  const risks = ws.compliance.filter((c) => c.status === "risk").length;
  const readyCount = evaluate(ws).suggestions.length;
  const counts: Record<string, { n: number; hot?: boolean } | undefined> = {
    "/app": pending ? { n: pending, hot: true } : undefined,
    "/app/leads": hotLeads ? { n: hotLeads } : undefined,
    "/app/roi": risks ? { n: risks, hot: true } : undefined,
    "/app/automations": readyCount ? { n: readyCount, hot: true } : undefined,
  };
  const stateLabel = health.connected === false ? "Not connected" : busy ? "Working…" : "Online";
  const dotClass = health.connected === false ? "off" : busy ? "busy" : "";

  const link = (n: { href: string; label: string; icon: typeof IconChat }) => {
    const active = pathname === n.href;
    const c = counts[n.href];
    return (
      <Link key={n.href} href={n.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
        <n.icon />{n.label}
        {c && <span className={`count ${c.hot ? "hot" : ""}`}>{c.n}</span>}
      </Link>
    );
  };

  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      {navOpen && <div className="scrim" style={{ zIndex: 65 }} onClick={() => setNavOpen(false)} aria-hidden="true" />}
      <aside ref={sideRef} id="app-sidebar" className={`sidebar ${navOpen ? "open" : ""}`} aria-label="Sidebar"
        {...(narrow && !navOpen ? { inert: true, "aria-hidden": true } : {})}>
        <div className="sidebar-head">
          <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
            <Link href="/app" className="brand" aria-label="EMMA home">
              <Orb size={38} busy={busy} />
              <div>
                <div className="brand-word">EMMA</div>
                <div className="brand-sub">by <b>LionsLane</b></div>
              </div>
            </Link>
            <button className="btn ghost sm sidebar-close" onClick={() => setNavOpen(false)} aria-label="Close menu"><IconClose /></button>
          </div>
          <button className="btn ghost sm sidebar-search" onClick={() => { setNavOpen(false); setPalette(true); }}>
            <IconSearch />Search or jump to…<span className="kbd-key" style={{ marginLeft: "auto" }}>Ctrl K</span>
          </button>
        </div>
        <div className="sidebar-scroll">
          <nav className="nav" aria-label="Main">
            {link(NAV[0])}
            {NAV_GROUPS.map((g) => (
              <div key={g.label} className="nav-group" role="group" aria-label={g.label}>
                <div className="nav-label" aria-hidden="true">{g.label}</div>
                {g.hrefs.map((h) => NAV.find((n) => n.href === h)).filter((n): n is (typeof NAV)[number] => Boolean(n)).map(link)}
              </div>
            ))}
            {showJury && (<div className="nav-group" role="group" aria-label="Studio"><div className="nav-label" aria-hidden="true">Studio</div>{link(JURY_NAV)}</div>)}
          </nav>
        </div>
        <div className="sidebar-foot">
          <UsageMeter />
          <AccountMenu />
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button ref={menuBtn} className="btn ghost sm menu-btn" onClick={() => setNavOpen(true)} aria-label="Open menu" aria-expanded={navOpen} aria-controls="app-sidebar"><IconMenu /></button>
          <div style={{ minWidth: 0 }}>
            <div className="crumb">{ws.profile.name}</div>
            <h1>{TITLES[pathname] ?? "EMMA"}</h1>
          </div>
          {mode === "cloud" && saveState !== "idle" && (
            <span className="save-dot" aria-live="polite">{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Not saved"}</span>
          )}
          <span className="spacer" />
          {pathname !== "/app" && <button className="btn ai sm" onClick={() => setDrawer(true)}><IconChat />Ask EMMA</button>}
          <div className="emma-presence" title={health.connected === false ? "The server has no AI key yet" : "EMMA is ready"}>
            <Orb size={28} busy={busy} />
            <div>
              <div className="who">EMMA</div>
              <div className="state"><span className={`live-dot ${dotClass}`} />{stateLabel}</div>
            </div>
          </div>
          <UserMenu />
        </header>
        <main id="main" className="page" key={pathname} tabIndex={-1}>{children}</main>
      </div>

      <AskDrawer open={drawerOpen && pathname !== "/app"} onClose={() => setDrawer(false)} />
      <CommandPalette showJury={showJury} />
      <UpgradeModal />
      <TabBar />
      <Toasts />
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="shell" aria-busy="true">
      <aside className="sidebar" aria-hidden="true">
        <div className="brand"><Orb size={38} className="orb-float" /><div className="stack" style={{ gap: 6, flex: 1 }}><Sk w={70} h={14} /><Sk w={90} h={9} /></div></div>
        <div className="stack" style={{ gap: 14, padding: "8px 12px" }}>{Array.from({ length: 9 }, (_, i) => <Sk key={i} w={`${70 - (i % 3) * 12}%`} h={12} />)}</div>
      </aside>
      <div className="main">
        <header className="topbar"><div className="stack" style={{ gap: 6 }}><Sk w={90} h={9} /><Sk w={180} h={16} /></div></header>
        <main className="page"><PageSkeleton /></main>
      </div>
    </div>
  );
}

function AskDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const chat = useEmma((s) => s.chat);
  const newThread = useEmma((s) => s.newThread);
  const busy = useEmma((s) => s.busy);
  const [seed, setSeed] = useState<{ text: string; n: number }>();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={<span className="row" style={{ gap: 8 }}><Orb size={22} busy={busy} />Ask EMMA</span>}
      foot={<Composer autoFocus seed={seed} placeholder="Ask or brief EMMA…" />}
    >
      {chat.length === 0 ? (
        <QuickCommands onPick={(p) => setSeed({ text: p, n: Date.now() })} />
      ) : (
        <>
          <Thread messages={chat} />
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn ghost sm" onClick={newThread} disabled={busy}><IconRefresh />New thread</button>
          </div>
        </>
      )}
    </Sheet>
  );
}
