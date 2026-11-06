"use client";

import { hostOf, safeHref } from "@/lib/safe";
import { useEmma } from "@/lib/store";
import { money, shortDate } from "@/lib/metrics";
import type { CalendarEntry, Campaign, EmailItem, Lead, Proposal, Task, Asset } from "@/lib/types";
import { IconAlert, IconCheck, IconClose } from "./icons";

const KIND: Record<Proposal["kind"], string> = {
  calendar: "Content calendar", campaign: "Ad campaign", leads: "Leads", email: "Email", tasks: "Tasks", asset: "Content library",
};

export function ProposalCard({ id }: { id: string }) {
  const p = useEmma((s) => s.proposals[id]);
  const approve = useEmma((s) => s.approve);
  const discard = useEmma((s) => s.discard);
  const currency = useEmma((s) => s.ws.profile.currency);
  if (!p) return null;
  const done = p.status !== "pending";

  return (
    <div className={`proposal ${done ? "done" : ""}`}>
      <div className="proposal-inner">
        <div className="proposal-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="k">EMMA proposes · {KIND[p.kind]} · {p.items.length} item{p.items.length === 1 ? "" : "s"}</div>
            <div className="ttl">{p.title}</div>
          </div>
          {p.status === "approved" && <span className="chip ok"><IconCheck />Approved</span>}
          {p.status === "discarded" && <span className="chip">Discarded</span>}
        </div>
        <p className="proposal-sum">{p.summary}</p>
        {p.reviewNote && (
          <div className="proposal-review"><IconAlert width={16} height={16} style={{ flex: "none", marginTop: 1 }} /><span><b>Check before it goes out:</b> {p.reviewNote}</span></div>
        )}
        <div className="proposal-items">
          {p.items.map((it, i) => <Item key={i} kind={p.kind} item={it} currency={currency} />)}
        </div>
        {!done && (
          <div className="proposal-actions">
            <button className="btn ai sm" onClick={() => approve(p.id)}><IconCheck />Approve &amp; add</button>
            <button className="btn ghost sm" onClick={() => discard(p.id)}><IconClose />Discard</button>
            <span className="small faint right">Nothing changes until you approve.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Copy({ text, label = "Show copy" }: { text?: string; label?: string }) {
  if (!text) return null;
  return <details><summary>{label}</summary><pre>{text}</pre></details>;
}

function Item({ kind, item, currency }: { kind: Proposal["kind"]; item: unknown; currency: string }) {
  switch (kind) {
    case "calendar": {
      const e = item as CalendarEntry;
      return (
        <div className="p-item">
          <div className="l1"><span className="chip">{shortDate(e.date)}</span><span className="chip accent">{e.platform}</span><b>{e.angle}</b></div>
          <div className="l2">{e.contentType} · {e.sector} · {e.objective} · KPI: {e.kpi}</div>
          <div className="l2">Draft {shortDate(e.draftDue)} → review {shortDate(e.reviewDate)} → publish {shortDate(e.publishDate)} · {e.themePillar}{e.campaign ? ` · ${e.campaign}` : ""}</div>
          <Copy text={e.copy} />
        </div>
      );
    }
    case "campaign": {
      const c = item as Campaign;
      return (
        <div className="p-item">
          <div className="l1"><span className="chip accent">{c.platform}</span><b>{c.name}</b><span className="mono small right">{money(c.budget, currency)}</span></div>
          <div className="l2">{c.objective} · {shortDate(c.startDate)} – {shortDate(c.endDate)}</div>
          <div className="l2">Audience: {c.audience}</div>
          <Copy text={[c.headline, c.body].filter(Boolean).join("\n\n")} label="Show ad copy" />
        </div>
      );
    }
    case "leads": {
      const l = item as Lead;
      return (
        <div className="p-item">
          <div className="l1"><b>{l.company}</b>{l.name && <span className="muted small">{l.name}{l.role ? `, ${l.role}` : ""}</span>}<span className="chip warn right">Unverified</span></div>
          <div className="l2">{[l.email, l.phone, l.social].filter(Boolean).join(" · ") || "No contact details found yet"}</div>
          {l.notes && <div className="l2">{l.notes}</div>}
          {safeHref(l.sourceUrl) && <div className="l2"><a className="link" href={safeHref(l.sourceUrl)} target="_blank" rel="noreferrer noopener">Source: {hostOf(l.sourceUrl!)}</a></div>}
        </div>
      );
    }
    case "email": {
      const e = item as EmailItem;
      return (
        <div className="p-item">
          <div className="l1"><span className="chip accent">{e.kind}</span><b>{e.name}</b></div>
          <div className="l2">To: {e.audience}{e.scheduledFor ? ` · ${shortDate(e.scheduledFor)}` : ""}</div>
          <div className="l2">Subject: {e.subject}</div>
          {e.body && <Copy text={e.body} label="Show email" />}
          {e.steps.length > 0 && <Copy text={e.steps.map((s, i) => `Step ${i + 1} · day ${s.delayDays}\nSubject: ${s.subject}\n\n${s.body}`).join("\n\n———\n\n")} label={`Show ${e.steps.length} steps`} />}
        </div>
      );
    }
    case "tasks": {
      const t = item as Task;
      return <div className="p-item"><div className="l1"><span className="chip">{shortDate(t.due)}</span><b>{t.title}</b><span className="muted small right">{t.owner}</span></div></div>;
    }
    case "asset": {
      const a = item as Asset;
      return (
        <div className="p-item">
          <div className="l1"><b>{a.title}</b>{a.platform && <span className="chip accent">{a.platform}</span>}</div>
          <Copy text={a.body} />
        </div>
      );
    }
  }
}
