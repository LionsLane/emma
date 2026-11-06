"use client";

import { hostOf, safeHref } from "@/lib/safe";
import { useEffect, useRef, useState } from "react";
import { useEmma, type ChatMessage } from "@/lib/store";
import { Markdown } from "./Markdown";
import { ProposalCard } from "./ProposalCard";
import { Orb } from "./Orb";
import { IconCalendar, IconChart, IconPen, IconSearch, IconSend, IconUsers, IconMail, IconMegaphone } from "./icons";
import { useHealth } from "./health";

export const QUICK_COMMANDS = [
  { icon: IconCalendar, label: "Build a calendar", prompt: "Build a content calendar for the next four weeks. Use our key dates and keep every sector in the mix." },
  { icon: IconPen, label: "Write a blog", prompt: "Write a blog post for our strongest offering, then save it to the library with three social cut-downs." },
  { icon: IconUsers, label: "Nurture leads", prompt: "Look at our open leads and propose the next touch for each hot and warm lead, plus tasks for the team." },
  { icon: IconMegaphone, label: "Plan a campaign", prompt: "Plan a paid campaign for the offering with the most headroom. Recommend the budget split and write the ads." },
  { icon: IconMail, label: "Draft a sequence", prompt: "Draft an email follow-up sequence for new enquiries that haven't booked yet." },
  { icon: IconChart, label: "Analyse last month", prompt: "Analyse our marketing performance. What's working, what isn't, and where should next month's budget go?" },
  { icon: IconSearch, label: "Find prospects", prompt: "Find 8 real businesses in Nairobi worth calling for our corporate offering. Only include contact details you can source." },
];

export function Thread({ messages }: { messages: ChatMessage[] }) {
  const busy = useEmma((s) => s.busy);
  const end = useRef<HTMLDivElement>(null);
  const lastLen = JSON.stringify(messages[messages.length - 1]?.parts ?? []).length;

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, lastLen]);

  return (
    <div className="chat" aria-live="polite">
      {messages.map((m, idx) =>
        m.role === "user" ? (
          <div key={m.id} className="msg user"><div className="bubble">{m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}</div></div>
        ) : (
          <div key={m.id} className="msg emma">
            <Orb size={30} busy={busy && idx === messages.length - 1} />
            <div className="bubble">
              <EmmaParts message={m} live={busy && idx === messages.length - 1} />
            </div>
          </div>
        ),
      )}
      <div ref={end} />
    </div>
  );
}

function EmmaParts({ message, live }: { message: ChatMessage; live: boolean }) {
  const parts = message.parts;
  const lastStatus = parts.map((p) => p.type).lastIndexOf("status");
  const out: React.ReactNode[] = [];
  let sources: { title: string; url: string }[] = [];
  const flushSources = (k: string) => {
    if (sources.length) {
      out.push(
        <div key={k} className="sources">
          {sources.filter((s) => safeHref(s.url)).map((s) => <a key={s.url} href={safeHref(s.url)} target="_blank" rel="noreferrer noopener" title={hostOf(s.url)}>{s.title || hostOf(s.url)}</a>)}
        </div>,
      );
      sources = [];
    }
  };

  parts.forEach((p, i) => {
    if (p.type !== "source") flushSources(`s${i}`);
    if (p.type === "text") out.push(<Markdown key={i} text={p.text} />);
    else if (p.type === "status") {
      // Collapse repeated statuses: only show a status if it differs from the previous one.
      const prev = parts.slice(0, i).reverse().find((x) => x.type === "status");
      if (prev && prev.type === "status" && prev.label === p.label && i !== lastStatus) return;
      out.push(<div key={i} className={`status-line ${live && i === lastStatus ? "live" : ""}`}><span className="spark" />{p.label}{live && i === lastStatus ? "…" : ""}</div>);
    } else if (p.type === "source") sources.push({ title: p.title, url: p.url });
    else if (p.type === "proposal") out.push(<ProposalCard key={i} id={p.id} />);
    else if (p.type === "error") out.push(<div key={i} className="err">{p.message}</div>);
  });
  flushSources("s-end");
  if (live && parts.length === 0) out.push(<span key="t" className="typing"><i /><i /><i /></span>);
  return <>{out}</>;
}

export function Composer({ autoFocus = false, placeholder, glow = false, seed }: { autoFocus?: boolean; placeholder?: string; glow?: boolean; seed?: { text: string; n: number } }) {
  const send = useEmma((s) => s.send);
  const busy = useEmma((s) => s.busy);
  const health = useHealth();
  const [text, setText] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (seed?.text) {
      setText(seed.text);
      ta.current?.focus();
    }
  }, [seed]);

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  const submit = () => {
    if (!text.trim() || busy) return;
    void send(text);
    setText("");
  };

  return (
    <div className={`glass composer ${glow ? "glow" : ""}`}>
      <label htmlFor="emma-input" className="sr-only">Brief EMMA</label>
      <textarea
        id="emma-input"
        ref={ta}
        autoFocus={autoFocus}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder ?? "Brief EMMA… e.g. “Next month is gifting month, budget is 80k, we need corporate leads.”"}
        rows={2}
      />
      <div className="composer-bar">
        <span className="kbd">{health.connected === false ? "Not connected: add an API key" : "Enter to send · Shift+Enter for a new line"}</span>
        <span className="spacer" />
        <button className="btn ai" onClick={submit} disabled={busy || !text.trim()} aria-label="Send to EMMA">
          {busy ? "Working…" : "Send"} <IconSend />
        </button>
      </div>
    </div>
  );
}

export function QuickCommands({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="quick">
      {QUICK_COMMANDS.map((q) => (
        <button key={q.label} onClick={() => onPick(q.prompt)}><q.icon />{q.label}</button>
      ))}
    </div>
  );
}
