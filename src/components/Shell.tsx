"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useEmma } from "@/lib/store";
import { Orb } from "./Orb";
import { PageSkeleton, Sheet, Sk } from "./ui";
import { Composer, QuickCommands, Thread } from "./Chat";
import { useHealth } from "./health";
import { AccountMenu, BILLING_NAV, CommandPalette, JURY_NAV, NAV, PROFILE_NAV, TabBar, Toasts, UpgradeModal, UsageMeter, UserMenu } from "./Chrome";
import { IconChat, IconMenu, IconRefresh, IconSearch } from "./icons";

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
  const counts: Record<string, { n: number; hot?: boolean } | undefined> = {
    "/app": pending ? { n: pending, hot: true } : undefined,
    "/app/leads": hotLeads ? { n: hotLeads } : undefined,
    "/app/roi": risks ? { n: risks, hot: true } : undefined,
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
      {navOpen && <div className="scrim" style={{ zIndex: 35 }} onClick={() => setNavOpen(false)} />}
      <aside className={`sidebar ${navOpen ? "open" : ""}`} aria-label="Sidebar">
        <Link href="/app" className="brand" aria-label="EMMA home">
          <Orb size={38} busy={busy} />
          <div>
            <div className="brand-word">EMMA</div>
            <div className="brand-sub">by <b>LionsLane</b></div>
          </div>
        </Link>
        <button className="btn ghost sm" style={{ justifyContent: "flex-start", color: "var(--muted)", marginBottom: 4 }} onClick={() => setPalette(true)}>
          <IconSearch />Search or jump to…<span className="kbd-key" style={{ marginLeft: "auto" }}>Ctrl K</span>
        </button>
        <nav className="nav" aria-label="Main">
          {link(NAV[0])}
          <div className="nav-label">Operate</div>
          {NAV.slice(1).map(link)}
          {showJury && (<><div className="nav-label">Studio</div>{link(JURY_NAV)}</>)}
        </nav>
        <div className="sidebar-foot">
          <UsageMeter />
          <AccountMenu />
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn ghost sm menu-btn" onClick={() => setNavOpen(true)} aria-label="Open menu"><IconMenu /></button>
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
