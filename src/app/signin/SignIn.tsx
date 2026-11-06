"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Orb } from "@/components/Orb";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Only allow same-site relative redirects after sign-in (no open redirects).
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app";
}

export function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? "That link has expired or was already used. Enter your email and we'll send a new code." : null);
  const codeRef = useRef<HTMLInputElement>(null);

  if (!CLOUD) {
    return (
      <AuthFrame>
        <h1 className="auth-title">Accounts aren&apos;t set up here yet</h1>
        <p className="muted">This server runs EMMA as a local demo. Add the Supabase settings to turn on sign-in.</p>
        <Link className="btn ai" href="/app">Open the demo</Link>
      </AuthFrame>
    );
  }
  const sb = supabaseBrowser()!;

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setBusy(true);
    // The email carries a code (custom template) or, with Supabase's default template, a link that lands on /auth/callback.
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) { setError(error.status === 429 ? "Too many attempts. Wait a minute and try again." : "We couldn't send a code. Check the address and try again."); return; }
    setStep("code");
    setTimeout(() => codeRef.current?.focus(), 50);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = code.replace(/\D/g, "");
    if (token.length < 6) { setError("Enter the 6-digit code from your email."); return; }
    setBusy(true);
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    setBusy(false);
    if (error) { setError("That code didn't work. It may have expired; request a new one."); return; }
    router.replace(next);
    router.refresh();
  };

  const google = async () => {
    setError(null);
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setError("Google sign-in isn't available right now. Use your email instead.");
  };

  return (
    <AuthFrame>
      {step === "email" ? (
        <form onSubmit={sendCode} className="stack" style={{ gap: 14 }} noValidate>
          <h1 className="auth-title">Sign in to EMMA</h1>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" inputMode="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.co.ke" aria-describedby={error ? "auth-error" : undefined} />
          </div>
          <button className="btn ai" type="submit" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
          <div className="auth-or"><span>or</span></div>
          <button className="btn" type="button" onClick={google}><GoogleMark />Continue with Google</button>
        </form>
      ) : (
        <form onSubmit={verify} className="stack" style={{ gap: 14 }} noValidate>
          <h1 className="auth-title">Check your email</h1>
          <p className="muted small" style={{ margin: 0 }}>We sent a sign-in email to <b style={{ color: "var(--text)" }}>{email}</b>. Enter its 6-digit code, or open the link in it on this device.</p>
          <div className="field">
            <label htmlFor="code">Code</label>
            <input id="code" ref={codeRef} className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ letterSpacing: "0.4em", fontSize: 18 }} aria-describedby={error ? "auth-error" : undefined} />
          </div>
          <button className="btn ai" type="submit" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
          <button className="btn ghost sm" type="button" onClick={() => { setStep("email"); setCode(""); }}>Use a different email</button>
        </form>
      )}
      {error && <div id="auth-error" className="err" role="alert">{error}</div>}
      <p className="small faint" style={{ margin: 0 }}>
        By continuing you agree to the <Link href="/legal/terms" className="link">Terms</Link> and <Link href="/legal/privacy" className="link">Privacy Policy</Link>.
      </p>
    </AuthFrame>
  );
}

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth">
      <Link href="/" className="auth-brand" aria-label="EMMA home"><Orb size={44} /><span className="brand-word">EMMA</span></Link>
      <div className="glass auth-card stack" style={{ gap: 16 }}>{children}</div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
