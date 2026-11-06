import Link from "next/link";
import { Orb } from "@/components/Orb";

export default function NotFound() {
  return (
    <main className="auth">
      <div className="glass auth-card stack" style={{ gap: 14, alignItems: "flex-start" }}>
        <Orb size={44} />
        <h1 className="auth-title">That page doesn&apos;t exist</h1>
        <div className="row"><Link className="btn ai" href="/app">Open EMMA</Link><Link className="btn ghost" href="/">Home</Link></div>
      </div>
    </main>
  );
}
