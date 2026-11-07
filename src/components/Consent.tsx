"use client";

// Page analytics, only with consent (Kenya Data Protection Act 2019).
// Until someone taps "Allow", no analytics script loads: not Google Analytics and not
// Vercel Web Analytics, so nothing about the visit is sent anywhere.
// "No thanks" is remembered too. "Cookie settings" in the footer reopens the choice.

import Link from "next/link";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const KEY = "emma-consent"; // "granted" | "denied"
const OPEN = "emma-consent-open";

type Choice = "granted" | "denied" | null;
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function readChoice(): Choice {
  try { const v = window.localStorage.getItem(KEY); return v === "granted" || v === "denied" ? v : null; } catch { return null; }
}
function saveChoice(v: "granted" | "denied") {
  try { window.localStorage.setItem(KEY, v); } catch { /* private mode: ask again next visit */ }
}

let loaded = false;
function loadAnalytics() {
  if (loaded || !GA_ID) return;
  loaded = true;
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer ?? [];
  // gtag must push the arguments object itself, as Google's snippet does.
  w.gtag = function gtag() { // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  w.gtag("js", new Date());
  // Default cookie settings: the _ga visitor cookie lives on .lionslane.co.ke and is shared
  // with the Lions Lane website (same company, its own consent). Tested 7 Nov 2026:
  // gtag ignored cookie_prefix/cookie_domain here, so we document the real behaviour.
  w.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

// Removes the Google Analytics cookies (_ga and _ga_<id>) when someone withdraws consent.
// _ga sits on .lionslane.co.ke and is shared with the Lions Lane website; if that site
// also has consent, its analytics simply starts a new _ga on the next visit there.
function clearAnalyticsCookies() {
  // Stop gtag first: a running script rewrites its cookie on the next hit (even the
  // one sent as the page unloads), which would undo the deletion below.
  const w = window as GtagWindow;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  const host = window.location.hostname;
  const parent = host.split(".").slice(-3).join(".");
  for (const name of ["_ga", `_ga_${GA_ID.replace(/^G-/, "")}`]) {
    for (const d of ["", host, `.${host}`, `.${parent}`]) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

export function Consent() {
  const [choice, setChoice] = useState<Choice>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    if (c === "granted") loadAnalytics();
    else if (c === null) setOpen(true);
    // After "No thanks", sweep up anything a script wrote before it stopped.
    else if (GA_ID) clearAnalyticsCookies();
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN, reopen);
    return () => window.removeEventListener(OPEN, reopen);
  }, []);

  const choose = (v: "granted" | "denied") => {
    const before = readChoice();
    saveChoice(v);
    setChoice(v);
    setOpen(false);
    if (v === "granted") loadAnalytics();
    else {
      if (GA_ID) clearAnalyticsCookies();
      // Analytics already running on this page stops on the next load.
      if (before === "granted") window.location.reload();
    }
  };

  return (
    <>
      {/* Vercel Web Analytics mounts (and injects its script) only after "Allow". */}
      {choice === "granted" && <Analytics />}
      {open && (
        <div className="consent glass" role="dialog" aria-live="polite" aria-label="Cookie choice">
          <p className="small" style={{ margin: 0 }}>
            May we measure visits with {GA_ID ? "Google Analytics and Vercel Web Analytics" : "Vercel Web Analytics"} to see which pages help people? Nothing loads unless you allow it. <Link href="/legal/cookies" className="link">Cookie policy</Link>
          </p>
          <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
            <button className="btn ghost sm" onClick={() => choose("denied")}>No thanks</button>
            <button className="btn primary sm" onClick={() => choose("granted")}>Allow</button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return <button type="button" className={`linklike ${className}`} onClick={() => window.dispatchEvent(new Event(OPEN))}>Cookie settings</button>;
}
