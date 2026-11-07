import Link from "next/link";
import { CookieSettingsButton } from "@/components/Consent";
import { Orb } from "@/components/Orb";
import { COMPANY } from "@/lib/company";

export function SiteNav() {
  return (
    <header className="site-nav">
      <a href="#main" className="skip">Skip to content</a>
      <Link href="/" className="brand" aria-label="EMMA home"><Orb size={32} /><div><div className="brand-word">EMMA</div><div className="brand-sub">by <b>LionsLane</b></div></div></Link>
      <nav aria-label="Site" className="site-links">
        <a href="/#how">How it works</a>
        <a href="/#pricing">Pricing</a>
        <a href="/#faq">FAQ</a>
      </nav>
      <div className="row" style={{ gap: 8 }}>
        <Link href="/signin" className="btn ghost sm">Sign in</Link>
        <Link href="/signin" className="btn ai sm">Start free</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div>
        <div className="row" style={{ gap: 10 }}><Orb size={26} /><b>EMMA</b></div>
        <p className="small muted" style={{ margin: "8px 0 0" }}>A product of {COMPANY.legalName}, {COMPANY.city}.</p>
        {COMPANY.address && <p className="small muted" style={{ margin: "4px 0 0" }}>{COMPANY.address}</p>}
        {COMPANY.email && <p className="small muted" style={{ margin: "4px 0 0" }}><a className="link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>{COMPANY.phone ? ` · ${COMPANY.phone}` : ""}</p>}
      </div>
      <nav aria-label="Legal" className="foot-links">
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/cookies">Cookies</Link>
        <Link href="/legal/refunds">Refunds</Link>
        <Link href="/legal/acceptable-use">Acceptable use</Link>
        <Link href="/legal/ai">AI policy</Link>
        <Link href="/legal/security">Security</Link>
        <Link href="/legal/dpa">Data processing</Link>
        <a href="https://lionslane.co.ke/emma">About EMMA at Lions Lane</a>
        <CookieSettingsButton />
      </nav>
      <p className="small faint" style={{ margin: 0 }}>© {new Date().getFullYear()} {COMPANY.legalName}</p>
    </footer>
  );
}
