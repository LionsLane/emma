"use client";

// Last-resort boundary when the root layout itself fails. Plain markup only.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#050914", color: "#e8eeff", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <main role="alert" style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22 }}>EMMA hit a problem</h1>
          <p style={{ color: "#b4c0de" }}>Please refresh the page.</p>
          <button onClick={reset} style={{ padding: "10px 18px", borderRadius: 10, border: 0, background: "#7c3aed", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
