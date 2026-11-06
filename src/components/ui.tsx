"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { IconAlert, IconCheck, IconClose } from "./icons";
import type { CheckStatus } from "@/lib/types";

export function Panel({ title, hint, right, children, className = "" }: { title?: ReactNode; hint?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`glass panel ${className}`}>
      {(title || right) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {hint && <span className="hint">{hint}</span>}
          {right && <div className="right">{right}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, foot }: { label: string; value: ReactNode; foot?: ReactNode }) {
  return (
    <div className="glass stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {foot && <div className="foot">{foot}</div>}
    </div>
  );
}

// The definition lives in a tooltip, not as another line of text.
export function Meter({ label, value, why }: { label: string; value: number; why: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="meter" role="meter" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label} aria-description={why} title={why}>
      <div className="meter-top"><span>{label}</span><span>{Math.round(v * 100)}%</span></div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${v * 100}%` }} /></div>
    </div>
  );
}

// Status always ships with an icon and a word, never colour alone.
export function StatusChip({ status }: { status: CheckStatus }) {
  const label = { ok: "OK", attention: "Attention", risk: "At risk" }[status];
  const cls = { ok: "ok", attention: "warn", risk: "risk" }[status];
  return (
    <span className={`chip ${cls}`}>
      {status === "ok" ? <IconCheck /> : <IconAlert />}
      {label}
    </span>
  );
}

// Keep keyboard focus inside a dialog, restore it on close, close on Escape.
export function useFocusTrap(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () =>
      el ? Array.from(el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')) : [];
    const auto = el?.querySelector<HTMLElement>("[autofocus], [data-autofocus]");
    (auto ?? focusables()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, [open, onClose, ref]);
}

export function Sheet({ open, onClose, title, kicker, children, foot }: { open: boolean; onClose: () => void; title: ReactNode; kicker?: ReactNode; children: ReactNode; foot?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside ref={ref} className="drawer" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Details"}>
        <div className="drawer-head">
          <div style={{ minWidth: 0, flex: 1 }}>
            {kicker && <div className="small muted">{kicker}</div>}
            <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
          </div>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {foot && <div className="drawer-foot">{foot}</div>}
      </aside>
    </>
  );
}

export function Modal({ open, onClose, label, wide = false, children }: { open: boolean; onClose: () => void; label: string; wide?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div ref={ref} className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={label}>{children}</div>
    </>
  );
}

export function Dossier({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="dossier">
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt>{k}</dt>
          <dd>{v === "" || v === undefined || v === null ? <span className="faint">—</span> : v}</dd>
        </div>
      ))}
    </dl>
  );
}

// Page toolbar. The page name already sits in the top bar, so no repeated
// heading and no explanatory sub-heading: just the page's actions.
export function PageIntro({ right }: { title?: string; sub?: string; right?: ReactNode }) {
  if (!right) return null;
  return <div className="row toolbar" style={{ justifyContent: "flex-end", marginBottom: 16 }}>{right}</div>;
}

// ---- skeletons: the layout appears before the data does

export function Sk({ w, h, r, className = "" }: { w?: number | string; h?: number | string; r?: number; className?: string }) {
  return <span className={`sk ${className}`} style={{ display: "block", width: w ?? "100%", height: h ?? 12, borderRadius: r }} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading">
      <div className="grid cols-6">{Array.from({ length: 6 }, (_, i) => <div key={i} className="glass stat"><Sk w="50%" /><Sk w="70%" h={26} r={6} className="mt" /><Sk w="60%" /></div>)}</div>
      <div className="grid cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="glass panel stack" style={{ gap: 12 }}>
            <Sk w="40%" h={16} />
            {Array.from({ length: 5 }, (_, j) => <Sk key={j} w={`${90 - j * 8}%`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="stack" style={{ gap: 14 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="row" style={{ gap: 14, flexWrap: "nowrap" }}>
          <Sk w={36} h={36} r={18} />
          <div className="stack" style={{ gap: 6, flex: 1 }}><Sk w="45%" /><Sk w="70%" h={10} /></div>
          <Sk w={70} h={22} r={11} />
        </div>
      ))}
    </div>
  );
}
