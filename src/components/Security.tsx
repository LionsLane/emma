"use client";

// Business Profile → Security: two-step verification (authenticator app, passkey, text message)
// and passkey sign-in. Optional, but EMMA nudges every account to turn one on.
import type { Factor } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Panel } from "./ui";

type Passkey = { id: string; friendly_name?: string; created_at: string; last_used_at?: string };
const LABEL: Record<string, string> = { totp: "Authenticator app", phone: "Text message", webauthn: "Passkey (two-step)" };
const when = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "");

export function SecurityPanel() {
  const sb = supabaseBrowser()!;
  const [factors, setFactors] = useState<Factor[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [totp, setTotp] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [phone, setPhone] = useState<{ id?: string; challengeId?: string; number: string } | null>(null);
  const [code, setCode] = useState("");
  const webauthn = typeof window !== "undefined" && "PublicKeyCredential" in window;

  const load = useCallback(async () => {
    const [{ data: f }, pk] = await Promise.all([sb.auth.mfa.listFactors(), sb.auth.passkey.list().catch(() => ({ data: null }))]);
    setFactors((f?.all ?? []).filter((x) => x.status === "verified"));
    setPasskeys((pk?.data as Passkey[] | null) ?? []);
  }, [sb]);
  useEffect(() => { void load(); }, [load]);

  const say = (ok: boolean, text: string) => setMsg({ ok, text });
  // Unverified leftovers from an abandoned setup block a new one with the same name; clear them first.
  const clearUnverified = async () => {
    const { data } = await sb.auth.mfa.listFactors();
    await Promise.all((data?.all ?? []).filter((x) => x.status !== "verified").map((x) => sb.auth.mfa.unenroll({ factorId: x.id })));
  };

  const startTotp = async () => {
    setBusy(true); setMsg(null); await clearUnverified();
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error || !data) { say(false, "Couldn't start the authenticator setup. Try again."); return; }
    setTotp({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret }); setCode("");
  };
  const finishTotp = async (e: React.FormEvent) => {
    e.preventDefault(); if (!totp) return;
    setBusy(true);
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: totp.id, code: code.replace(/\D/g, "") });
    setBusy(false);
    if (error) { say(false, "That code didn't match. Check the time on your phone is correct and try the newest code."); return; }
    setTotp(null); setCode(""); say(true, "Authenticator app is on. You'll be asked for a code when you sign in."); void load();
  };

  const addPasskeyFactor = async () => {
    setBusy(true); setMsg(null); await clearUnverified();
    const { error } = await sb.auth.mfa.webauthn.register({ friendlyName: `Passkey ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error) { say(false, "The passkey wasn't saved. Try again on a device with a fingerprint, face or screen lock."); return; }
    say(true, "Passkey added as your second step."); void load();
  };

  const startPhone = async (e: React.FormEvent) => {
    e.preventDefault(); if (!phone) return;
    const number = phone.number.replace(/[\s-]/g, "").replace(/^0(?=7|1)/, "+254");
    if (!/^\+\d{9,15}$/.test(number)) { say(false, "Enter the number with the country code, like +254 712 345 678."); return; }
    setBusy(true); setMsg(null); await clearUnverified();
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "phone", phone: number });
    if (error || !data) { setBusy(false); say(false, "Text-message codes aren't switched on for EMMA yet. Use an authenticator app or a passkey for now."); return; }
    const { data: ch, error: e2 } = await sb.auth.mfa.challenge({ factorId: data.id });
    setBusy(false);
    if (e2 || !ch) { say(false, "We couldn't send the text. Use an authenticator app or a passkey for now."); return; }
    setPhone({ id: data.id, challengeId: ch.id, number }); setCode("");
  };
  const finishPhone = async (e: React.FormEvent) => {
    e.preventDefault(); if (!phone?.id || !phone.challengeId) return;
    setBusy(true);
    const { error } = await sb.auth.mfa.verify({ factorId: phone.id, challengeId: phone.challengeId, code: code.replace(/\D/g, "") });
    setBusy(false);
    if (error) { say(false, "That code didn't work. Check it and try again."); return; }
    setPhone(null); setCode(""); say(true, "Text-message codes are on."); void load();
  };

  const remove = async (f: Factor) => {
    if (!window.confirm(`Remove ${LABEL[f.factor_type] ?? "this method"}?`)) return;
    const { error } = await sb.auth.mfa.unenroll({ factorId: f.id });
    if (error) { say(false, "Couldn't remove it. Sign out and back in with this method, then try again."); return; }
    say(true, "Removed."); void load();
  };

  const addSignInPasskey = async () => {
    setBusy(true); setMsg(null);
    const { error } = await sb.auth.registerPasskey();
    setBusy(false);
    if (error) { say(false, "The passkey wasn't saved. Passkey sign-in may not be switched on yet, or this device has no screen lock."); return; }
    say(true, "Passkey saved. Next time, choose \"Sign in with a passkey\"."); void load();
  };
  const removePasskey = async (p: Passkey) => {
    if (!window.confirm("Remove this sign-in passkey?")) return;
    const { error } = await sb.auth.passkey.delete({ passkeyId: p.id });
    if (error) { say(false, "Couldn't remove the passkey."); return; }
    say(true, "Passkey removed."); void load();
  };

  const protectedNow = factors.length > 0;
  return (
    <Panel title="Security" right={<span className={`chip ${protectedNow ? "ok" : "warn"}`}>{protectedNow ? "Two-step on" : "Two-step off"}</span>}>
      <div className="stack" id="security">
        {!protectedNow && <p className="small" style={{ margin: 0 }}>Add a second step so nobody can open your workspace with just your email.</p>}

        <h3 className="small" style={{ margin: "6px 0 0" }}>Two-step verification</h3>
        {factors.map((f) => (
          <div key={f.id} className="row" style={{ justifyContent: "space-between" }}>
            <span>{LABEL[f.factor_type] ?? f.factor_type} <span className="faint small">added {when(f.created_at)}</span></span>
            <button className="btn ghost sm danger" type="button" onClick={() => void remove(f)}>Remove</button>
          </div>
        ))}

        {totp ? (
          <form className="stack" onSubmit={finishTotp}>
            <p className="small" style={{ margin: 0 }}>Scan this with Google Authenticator, Microsoft Authenticator or any authenticator app, then enter the 6-digit code it shows.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={totp.qr} alt="QR code for your authenticator app" width={180} height={180} style={{ background: "#fff", borderRadius: 8, padding: 8 }} />
            <p className="faint small" style={{ margin: 0 }}>Can't scan? Enter this key instead: <code className="mono">{totp.secret}</code></p>
            <div className="row">
              <input className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={8} aria-label="Code from your authenticator app" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ maxWidth: 160 }} />
              <button className="btn ai sm" type="submit" disabled={busy}>Turn on</button>
              <button className="btn ghost sm" type="button" onClick={() => { setTotp(null); void clearUnverified(); }}>Cancel</button>
            </div>
          </form>
        ) : phone ? (
          phone.challengeId ? (
            <form className="row" onSubmit={finishPhone}>
              <input className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={8} aria-label="Code we texted you" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ maxWidth: 160 }} />
              <button className="btn ai sm" type="submit" disabled={busy}>Turn on</button>
              <button className="btn ghost sm" type="button" onClick={() => { setPhone(null); void clearUnverified(); }}>Cancel</button>
            </form>
          ) : (
            <form className="row" onSubmit={startPhone}>
              <input className="input" type="tel" autoComplete="tel" aria-label="Mobile number" value={phone.number} onChange={(e) => setPhone({ number: e.target.value })} placeholder="+254 712 345 678" style={{ maxWidth: 220 }} />
              <button className="btn ai sm" type="submit" disabled={busy}>Send code</button>
              <button className="btn ghost sm" type="button" onClick={() => setPhone(null)}>Cancel</button>
            </form>
          )
        ) : (
          <div className="row" style={{ flexWrap: "wrap" }}>
            {!factors.some((f) => f.factor_type === "totp") && <button className="btn sm" type="button" onClick={() => void startTotp()} disabled={busy}>Add authenticator app</button>}
            {webauthn && <button className="btn sm" type="button" onClick={() => void addPasskeyFactor()} disabled={busy}>Add passkey as second step</button>}
            {!factors.some((f) => f.factor_type === "phone") && <button className="btn sm" type="button" onClick={() => setPhone({ number: "" })} disabled={busy}>Add text-message codes</button>}
          </div>
        )}

        <h3 className="small" style={{ margin: "10px 0 0" }}>Sign in with a passkey</h3>
        <p className="faint small" style={{ margin: 0 }}>Skip the email code: sign in with your fingerprint, face or screen lock.</p>
        {passkeys.map((p) => (
          <div key={p.id} className="row" style={{ justifyContent: "space-between" }}>
            <span>{p.friendly_name || "Passkey"} <span className="faint small">added {when(p.created_at)}{p.last_used_at ? `, last used ${when(p.last_used_at)}` : ""}</span></span>
            <button className="btn ghost sm danger" type="button" onClick={() => void removePasskey(p)}>Remove</button>
          </div>
        ))}
        {webauthn && <div className="row"><button className="btn sm" type="button" onClick={() => void addSignInPasskey()} disabled={busy}>Add a sign-in passkey</button></div>}

        {msg && <div className="small" role="status" style={{ color: msg.ok ? "var(--ok)" : "var(--risk)" }}>{msg.text}</div>}
      </div>
    </Panel>
  );
}
