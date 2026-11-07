"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEmma } from "@/lib/store";
import { PLANS, formatKES } from "@/lib/plans";
import { Modal, Stat } from "@/components/ui";
import { PlanCards } from "@/components/Chrome";
import { IconCheck, IconClose } from "@/components/icons";

export default function BillingPage() {
  return <Suspense><Billing /></Suspense>;
}

function Billing() {
  const params = useSearchParams();
  const router = useRouter();
  const account = useEmma((s) => s.account);
  const mode = useEmma((s) => s.mode);
  const refreshAccount = useEmma((s) => s.refreshAccount);
  const toast = useEmma((s) => s.toast);
  const [checkout, setCheckout] = useState<"pro" | "max" | null>(null);
  const status = params.get("status");

  // Pre-select from the upgrade sheet (?plan=pro|max).
  useEffect(() => {
    const p = params.get("plan");
    if (p === "pro" || p === "max") setCheckout(p);
  }, [params]);

  // Back from Paystack (?paystack=1&reference=…): confirm with our server, which asks Paystack.
  const psRef = params.get("paystack") ? params.get("reference") ?? params.get("trxref") : null;
  useEffect(() => {
    if (!psRef) return;
    let tries = 0;
    let done = false;
    const run = async () => {
      tries += 1;
      const res = await fetch(`/api/billing/paystack/verify?reference=${encodeURIComponent(psRef)}`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
      if (body.status === "paid") { done = true; await refreshAccount(); toast(`Payment received. You're on ${useEmma.getState().account?.plan.name ?? "your new plan"}.`, "ok"); }
      else if (body.status === "failed") { done = true; toast("The payment didn't go through. Nothing was charged.", "risk"); }
      else if (!res.ok) { done = true; toast(body.error ?? "Couldn't confirm the payment. Contact support if you were charged.", "risk"); }
      else if (tries >= 10) { done = true; toast("Paystack is still processing. Your plan updates as soon as it confirms.", "info"); }
      if (done) { clearInterval(t); router.replace("/app/billing"); }
    };
    const t = setInterval(() => { if (!done) void run(); }, 3000);
    void run();
    return () => clearInterval(t);
  }, [psRef, refreshAccount, router, toast]);

  // Back from Stripe: the webhook may land a moment after the redirect.
  useEffect(() => {
    if (status !== "success") { if (status === "cancelled") toast("Checkout cancelled. Nothing was charged.", "info"); return; }
    let tries = 0;
    const before = useEmma.getState().account?.plan.id;
    const t = setInterval(async () => {
      tries += 1;
      await refreshAccount();
      const now = useEmma.getState().account?.plan.id;
      if ((now && now !== before && now !== "free") || tries > 10) {
        clearInterval(t);
        if (now !== "free") toast(`You're on ${useEmma.getState().account?.plan.name}. Thank you!`, "ok");
        router.replace("/app/billing");
      }
    }, 3000);
    return () => clearInterval(t);
  }, [status, refreshAccount, router, toast]);

  if (mode === "demo" || !account) {
    return (
      <div className="stack">
        <PlanCards current="demo" onPick={() => toast("Billing is available once accounts are set up.", "info")} />
      </div>
    );
  }

  const p = account.plan;
  const end = p.periodEnd ? new Date(p.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  const manageCard = async () => {
    const res = await fetch("/api/billing/stripe/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (body.url) window.location.href = body.url;
    else toast(body.error ?? "Couldn't open card settings.", "risk");
  };

  return (
    <div className="stack">
      <div className="grid cols-4">
        <Stat label="Plan" value={p.name} foot={p.priceKES ? `${formatKES(p.priceKES)} / month` : "Free forever"} />
        <Stat label="Briefs this month" value={`${account.usage.briefs} / ${account.limits.briefs}`} />
        <Stat label="Web searches" value={account.limits.searches ? `${account.usage.searches} / ${account.limits.searches}` : "Pro and Max"} />
        <Stat label={p.provider === "mpesa" || p.provider === "paystack" ? "Paid until" : "Renews"} value={end ?? "—"} foot={p.provider === "mpesa" ? "M-Pesa, 30 days per payment" : p.provider === "paystack" ? "Paystack, 30 days per payment" : p.provider === "stripe" ? "Card" : undefined} />
      </div>
      {p.provider === "stripe" && <div className="row"><button className="btn sm" onClick={manageCard}>Manage card subscription</button></div>}
      <PlanCards current={p.id} onPick={setCheckout} />
      <p className="small faint" style={{ margin: 0 }}>Cancel any time; you keep your plan until the period ends. See the <a className="link" href="/legal/refunds">refund policy</a>.</p>
      <Checkout plan={checkout} onClose={() => setCheckout(null)} />
    </div>
  );
}

type Method = "mpesa" | "paystack" | "card";
const METHOD_LABEL: Record<Method, string> = { mpesa: "M-Pesa", paystack: "Paystack", card: "Card" };

function Checkout({ plan, onClose }: { plan: "pro" | "max" | null; onClose: () => void }) {
  const refreshAccount = useEmma((s) => s.refreshAccount);
  const toast = useEmma((s) => s.toast);
  const open = useEmma((s) => s.account?.payments) ?? { mpesa: true, paystack: false, card: true };
  const methods = (["mpesa", "paystack", "card"] as const).filter((m) => open[m]);
  const [picked, setMethod] = useState<Method | null>(null);
  const method: Method | null = picked && methods.includes(picked) ? picked : methods[0] ?? null;
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "waiting" | "paid" | "failed">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => { if (!plan) { setState("idle"); setMessage(null); setRequestId(null); if (timer.current) clearInterval(timer.current); } }, [plan]);

  const check = async (id: string) => {
    const res = await fetch(`/api/billing/mpesa/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { status?: string };
    if (body.status === "paid") {
      if (timer.current) clearInterval(timer.current);
      setState("paid");
      await refreshAccount();
      toast("Payment received. Your plan is active.", "ok");
    } else if (body.status === "failed" || body.status === "cancelled") {
      if (timer.current) clearInterval(timer.current);
      setState("failed");
      setMessage(body.status === "cancelled" ? "The payment was cancelled on the phone." : "The payment didn't go through. Nothing was charged.");
    }
  };

  const payMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setState("sending");
    setMessage(null);
    const res = await fetch("/api/billing/mpesa/stk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, phone }) });
    const body = (await res.json().catch(() => ({}))) as { checkoutRequestId?: string; message?: string; error?: string };
    if (!res.ok || !body.checkoutRequestId) { setState("failed"); setMessage(body.error ?? "M-Pesa didn't accept the request."); return; }
    setRequestId(body.checkoutRequestId);
    setState("waiting");
    setMessage(body.message ?? "Check your phone and enter your M-Pesa PIN.");
    let n = 0;
    timer.current = setInterval(() => { n += 1; if (n > 30) { if (timer.current) clearInterval(timer.current); return; } void check(body.checkoutRequestId!); }, 4000);
  };

  const payPaystack = async () => {
    if (!plan) return;
    setState("sending");
    setMessage(null);
    const res = await fetch("/api/billing/paystack/init", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (body.url && body.url.startsWith("https://checkout.paystack.com/")) { window.location.href = body.url; return; }
    setState("failed");
    setMessage(body.error ?? "Couldn't open Paystack checkout.");
  };

  const payCard = async () => {
    if (!plan) return;
    setState("sending");
    const res = await fetch("/api/billing/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (body.url) { window.location.href = body.url; return; }
    setState("failed");
    setMessage(body.error ?? "Couldn't start card checkout.");
  };

  if (!plan) return null;
  const p = PLANS[plan];
  return (
    <Modal open={Boolean(plan)} onClose={onClose} label={`Upgrade to ${p.name}`}>
      <div style={{ padding: 22 }} className="stack">
        <div className="row">
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Upgrade to {p.name}</h2>
            <div className="small muted">{formatKES(p.priceKES)} / month · {p.modelLabel}</div>
          </div>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {state === "paid" ? (
          <div className="stack" style={{ alignItems: "center", textAlign: "center", padding: "12px 0" }}>
            <span className="chip ok"><IconCheck />Paid</span>
            <p style={{ margin: 0 }}>You&apos;re on {p.name}. Enjoy.</p>
            <button className="btn primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {methods.length === 0 ? (
              <div className="banner" role="status">Payments open as soon as our payment accounts are verified. Your Free plan keeps working in the meantime.</div>
            ) : (
              <>
                {methods.length > 1 && (
                  <div className="tabs" role="tablist" aria-label="Payment method">
                    {methods.map((m) => (
                      <button key={m} role="tab" aria-selected={method === m} className={method === m ? "on" : ""} onClick={() => setMethod(m)}>{METHOD_LABEL[m]}</button>
                    ))}
                  </div>
                )}
                {method === "mpesa" && (
                  <form onSubmit={payMpesa} className="stack" style={{ gap: 12 }}>
                    <div className="field">
                      <label htmlFor="mp">M-Pesa number</label>
                      <input id="mp" className="input" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" data-autofocus disabled={state === "waiting"} />
                    </div>
                    <button className="btn ai" type="submit" disabled={state === "sending" || state === "waiting" || phone.replace(/\D/g, "").length < 9}>
                      {state === "sending" ? "Sending prompt…" : state === "waiting" ? "Waiting for your PIN…" : `Pay ${formatKES(p.priceKES)}`}
                    </button>
                    {state === "waiting" && requestId && <button type="button" className="btn ghost sm" onClick={() => void check(requestId)}>I&apos;ve paid. Check now</button>}
                    <p className="small faint" style={{ margin: 0 }}>Each payment gives you 30 days. We&apos;ll remind you before it ends.</p>
                  </form>
                )}
                {method === "paystack" && (
                  <div className="stack" style={{ gap: 12 }}>
                    <p className="small muted" style={{ margin: 0 }}>Pay with M-Pesa or a Visa or Mastercard card on Paystack&apos;s secure page. Each payment gives you 30 days.</p>
                    <button className="btn ai" onClick={payPaystack} disabled={state === "sending"}>{state === "sending" ? "Opening Paystack…" : `Pay ${formatKES(p.priceKES)} with Paystack`}</button>
                  </div>
                )}
                {method === "card" && (
                  <div className="stack" style={{ gap: 12 }}>
                    <p className="small muted" style={{ margin: 0 }}>Pay by Visa or Mastercard through Stripe. Renews monthly; cancel any time.</p>
                    <button className="btn primary" onClick={payCard} disabled={state === "sending"}>{state === "sending" ? "Opening checkout…" : "Continue to secure checkout"}</button>
                  </div>
                )}
              </>
            )}
            {message && <div className={state === "failed" ? "err" : "banner"} role={state === "failed" ? "alert" : "status"}>{message}</div>}
          </>
        )}
      </div>
    </Modal>
  );
}
