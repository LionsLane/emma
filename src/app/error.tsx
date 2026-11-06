"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Orb } from "@/components/Orb";

// Any unexpected error in a page lands here instead of a blank screen.
// We show nothing technical; the digest lets us find the server log.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[emma] page error", error.digest ?? error.message); }, [error]);
  return (
    <main className="auth">
      <div className="glass auth-card stack" style={{ gap: 14, alignItems: "flex-start" }} role="alert">
        <Orb size={44} />
        <h1 className="auth-title">Something went wrong</h1>
        <p className="muted" style={{ margin: 0 }}>Your work is saved. Try again, and if it keeps happening, tell us{error.digest ? <> and quote <code>{error.digest}</code></> : null}.</p>
        <div className="row"><button className="btn ai" onClick={reset}>Try again</button><Link className="btn ghost" href="/app">Back to EMMA</Link></div>
      </div>
    </main>
  );
}
