"use client";

import Link from "next/link";
import { useState } from "react";
import { useEmma } from "@/lib/store";
import { Composer, QuickCommands, Thread } from "@/components/Chat";
import { Orb } from "@/components/Orb";
import { useHealth } from "@/components/health";
import { IconRefresh } from "@/components/icons";
import { shortDate } from "@/lib/metrics";

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function CommandCenter() {
  const chat = useEmma((s) => s.chat);
  const ws = useEmma((s) => s.ws);
  const busy = useEmma((s) => s.busy);
  const newThread = useEmma((s) => s.newThread);
  const proposals = useEmma((s) => s.proposals);
  const health = useHealth();
  const [seed, setSeed] = useState<{ text: string; n: number }>();

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = ws.profile.keyDates.filter((k) => k.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const dueTasks = ws.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const pending = Object.values(proposals).filter((p) => p.status === "pending");
  const empty = chat.length === 0;

  return (
    <div className="cc">
      <div className="cc-main">
        {health.connected === false && (
          <div className="banner">
            <span>⚠</span>
            <div>
              <b>EMMA isn&apos;t connected to her brain yet.</b> Every surface works on the demo data, but the Command Center needs a Claude API key.
              Copy <code>.env.example</code> to <code>.env.local</code>, set <code>ANTHROPIC_API_KEY</code>, then restart the server.
            </div>
          </div>
        )}

        {empty && (
          <div className="hero">
            <Orb size={84} busy={busy} className="orb-float" />
            <h2>{greeting()}. <span className="ai-text">What are we making happen?</span></h2>
          </div>
        )}

        {!empty && <Thread messages={chat} />}

        <div style={{ position: empty ? "static" : "sticky", bottom: 16, zIndex: 5 }}>
          <Composer autoFocus glow={empty} seed={seed} />
        </div>

        {empty ? (
          <QuickCommands onPick={(p) => setSeed({ text: p, n: Date.now() })} />
        ) : (
          <div className="row">
            <button className="btn ghost sm" onClick={newThread} disabled={busy}><IconRefresh />New thread</button>
            <span className="small faint">EMMA proposes; you approve. Nothing lands in the workspace without a yes.</span>
          </div>
        )}
      </div>

      <aside className="cc-side">
        <section className="glass panel">
          <div className="panel-head"><h3>Waiting on you</h3><span className="hint">{pending.length} proposal{pending.length === 1 ? "" : "s"}</span></div>
          {pending.length === 0 ? <div className="small muted">Nothing pending. Brief EMMA and her proposals land here.</div> : (
            <div className="list">{pending.map((p) => (
              <div key={p.id} className="list-item"><span className="bullet emma" /><div><div className="small" style={{ fontWeight: 600 }}>{p.title}</div><div className="small muted">{p.items.length} item{p.items.length === 1 ? "" : "s"} · {p.kind}</div></div></div>
            ))}</div>
          )}
        </section>

        <section className="glass panel">
          <div className="panel-head"><h3>Coming up</h3><Link href="/app/calendar" className="hint right">Calendar →</Link></div>
          <div className="list">{upcoming.map((k) => (
            <div key={k.id} className="list-item">
              <span className="chip">{shortDate(k.date)}</span>
              <div><div className="small" style={{ fontWeight: 600 }}>{k.name}</div><div className="small muted">{k.note}</div></div>
            </div>
          ))}</div>
        </section>

        <section className="glass panel">
          <div className="panel-head"><h3>Tasks due</h3><Link href="/app/dashboard" className="hint right">All →</Link></div>
          <div className="list">{dueTasks.map((t) => (
            <div key={t.id} className="list-item">
              <span className="bullet" />
              <div style={{ minWidth: 0 }}><div className="small" style={{ fontWeight: 600 }}>{t.title}</div><div className="small muted">{t.owner}</div></div>
              <span className="when">{shortDate(t.due)}</span>
            </div>
          ))}</div>
        </section>
      </aside>
    </div>
  );
}
