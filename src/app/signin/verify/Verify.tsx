"use client";

// Step two of sign-in, for people who turned on two-step verification: an authenticator app code,
// a text-message code or a passkey. The proxy sends them here until it is done (aal2).
import type { Factor } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { AuthFrame, safeNext } from "../SignIn";

const LABEL: Record<string, string> = { totp: "Authenticator app", phone: "Text message", webauthn: "Passkey" };

export function Verify() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const sb = supabaseBrowser()!;
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [active, setActive] = useState<Factor | null>(null);
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void sb.auth.mfa.listFactors().then(({ data }) => {
      const list = (data?.all ?? []).filter((f) => f.status === "verified");
      setFactors(list);
      setActive(list[0] ?? null);
    });
  }, [sb]);

  const done = () => { router.replace(next); router.refresh(); };

  const pick = (f: Factor) => { setActive(f); setCode(""); setChallengeId(null); setError(null); };

  const sendText = async () => {
    if (!active) return;
    setBusy(true); setError(null);
    const { data, error } = await sb.auth.mfa.challenge({ factorId: active.id });
    setBusy(false);
    if (error || !data) { setError("We couldn't send a text right now. Try another method."); return; }
    setChallengeId(data.id);
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const token = code.replace(/\D/g, "");
    if (token.length < 6) { setError("Enter the 6-digit code."); return; }
    setBusy(true); setError(null);
    const { error } = active.factor_type === "phone" && challengeId
      ? await sb.auth.mfa.verify({ factorId: active.id, challengeId, code: token })
      : await sb.auth.mfa.challengeAndVerify({ factorId: active.id, code: token });
    setBusy(false);
    if (error) { setError("That code didn't work. Check it and try again."); return; }
    done();
  };

  const usePasskey = async () => {
    if (!active) return;
    setBusy(true); setError(null);
    const { error } = await sb.auth.mfa.webauthn.authenticate({ factorId: active.id });
    setBusy(false);
    if (error) { setError("That passkey didn't work. Try again or use another method."); return; }
    done();
  };

  const signOut = async () => { await sb.auth.signOut(); router.replace("/signin"); };

  return (
    <AuthFrame>
      <h1 className="auth-title">One more step</h1>
      {factors === null ? <p className="muted small">Loading your sign-in methods…</p> : factors.length === 0 ? (
        <p className="muted small">No second step is set up on this account.</p>
      ) : (
        <>
          {factors.length > 1 && (
            <div className="row" role="group" aria-label="Choose a method" style={{ flexWrap: "wrap", gap: 8 }}>
              {factors.map((f) => (
                <button key={f.id} type="button" className={`btn sm${active?.id === f.id ? " ai" : ""}`} aria-pressed={active?.id === f.id} onClick={() => pick(f)}>
                  {LABEL[f.factor_type] ?? f.factor_type}
                </button>
              ))}
            </div>
          )}
          {active?.factor_type === "webauthn" ? (
            <>
              <p className="muted small" style={{ margin: 0 }}>Use the passkey on this device: your fingerprint, face or screen lock.</p>
              <button className="btn ai" type="button" onClick={usePasskey} disabled={busy}>{busy ? "Waiting for your passkey…" : "Use my passkey"}</button>
            </>
          ) : active?.factor_type === "phone" && !challengeId ? (
            <>
              <p className="muted small" style={{ margin: 0 }}>We will text a 6-digit code to {(active as Factor & { phone?: string }).phone ?? "your phone"}.</p>
              <button className="btn ai" type="button" onClick={sendText} disabled={busy}>{busy ? "Sending…" : "Text me a code"}</button>
            </>
          ) : active ? (
            <form onSubmit={submitCode} className="stack" style={{ gap: 14 }} noValidate>
              <p className="muted small" style={{ margin: 0 }}>{active.factor_type === "phone" ? "Enter the code we texted you." : "Enter the 6-digit code from your authenticator app."}</p>
              <div className="field">
                <label htmlFor="mfa-code">Code</label>
                <input id="mfa-code" className="input mono" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={8} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ letterSpacing: "0.4em", fontSize: 18 }} aria-describedby={error ? "mfa-error" : undefined} />
              </div>
              <button className="btn ai" type="submit" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
            </form>
          ) : null}
        </>
      )}
      {error && <div id="mfa-error" className="err" role="alert">{error}</div>}
      <button className="btn ghost sm" type="button" onClick={signOut}>Sign out</button>
    </AuthFrame>
  );
}
