"use client";

// Google Analytics, only with consent (Kenya Data Protection Act 2019).
// Until someone taps "Allow", no Google script loads and nothing is sent to Google.
// "No thanks" is remembered too. "Cookie settings" in the footer reopens the choice.

import Link from "next/link";
import { useEffect, useState } from "react";

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
  w.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

// Removes Google Analytics cookies when someone withdraws consent.
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const parent = host.split(".").slice(-3).join(".");
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const d of ["", host, `.${host}`, `.${parent}`]) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

export function Consent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const c = readChoice();
    if (c === "granted") loadAnalytics();
    else if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN, reopen);
    return () => window.removeEventListener(OPEN, reopen);
  }, []);

  if (!GA_ID || !open) return null;

  const choose = (v: "granted" | "denied") => {
    const before = readChoice();
    saveChoice(v);
    setOpen(false);
    if (v === "granted") loadAnalytics();
    else {
      clearAnalyticsCookies();
      // Analytics already running on this page stops on the next load.
      if (before === "granted") window.location.reload();
    }
  };

  return (
    <div className="consent glass" role="dialog" aria-live="polite" aria-label="Cookie choice">
      <p className="small" style={{ margin: 0 }}>
        May we use Google Analytics cookies to see which pages help people? Only if you allow it. <Link href="/legal/cookies" className="link">Cookie policy</Link>
      </p>
      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
        <button className="btn ghost sm" onClick={() => choose("denied")}>No thanks</button>
        <button className="btn primary sm" onClick={() => choose("granted")}>Allow</button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  if (!GA_ID) return null;
  return <button type="button" className={`linklike ${className}`} onClick={() => window.dispatchEvent(new Event(OPEN))}>Cookie settings</button>;
}
