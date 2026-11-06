"use client";

import { useState } from "react";
import { useEmma } from "@/lib/store";
import { cpa, cpc, ctr, money, num, pct, roas, shortDate } from "@/lib/metrics";
import type { AdPlatform, CampaignStatus } from "@/lib/types";
import { Dossier, PageIntro, Panel, Sheet, Stat } from "@/components/ui";
import { IconBolt, IconPause, IconPlay, IconTrash } from "@/components/icons";

const PLATFORMS: AdPlatform[] = ["LinkedIn", "Meta", "Google", "Display", "TikTok"];

export default function Campaigns() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const remove = useEmma((s) => s.remove);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const addActivity = useEmma((s) => s.addActivity);
  const [openId, setOpenId] = useState<string | null>(null);
  const cur = ws.profile.currency;
  const open = ws.campaigns.find((c) => c.id === openId) ?? null;
  const live = ws.campaigns.filter((c) => c.status !== "draft");
  const totals = live.reduce((t, c) => ({ budget: t.budget + c.budget, spent: t.spent + c.spent, conv: t.conv + c.conversions, rev: t.rev + c.revenue }), { budget: 0, spent: 0, conv: 0, rev: 0 });
  const offeringName = (id: string) => ws.profile.offerings.find((o) => o.id === id)?.name ?? id;

  const setStatus = (id: string, status: CampaignStatus, name: string) => {
    patch("campaigns", id, { status });
    addActivity(`${status === "paused" ? "Paused" : "Resumed"} campaign "${name}".`, "team");
  };

  const ask = (prompt: string) => { setOpenId(null); setDrawer(true); void send(prompt); };

  return (
    <div className="stack">
      <PageIntro
        title="Campaign Manager"
        right={<button className="btn ai sm" onClick={() => ask("Review all our campaigns. Which should we scale, fix or stop, and why? Propose any new campaign you'd run instead.")}><IconBolt />Optimise with EMMA</button>}
      />

      <div className="grid cols-4">
        <Stat label="Budget (live + ended)" value={money(totals.budget, cur, true)} foot={`${pct(totals.budget ? totals.spent / totals.budget : 0)} spent`} />
        <Stat label="Spent" value={money(totals.spent, cur, true)} />
        <Stat label="Conversions" value={num(totals.conv)} foot={`${money(totals.conv ? totals.spent / totals.conv : 0, cur)} per conversion`} />
        <Stat label="ROAS" value={`${(totals.spent ? totals.rev / totals.spent : 0).toFixed(1)}×`} foot={`${money(totals.rev, cur, true)} revenue`} />
      </div>

      <Panel title="All campaigns" hint={`${ws.campaigns.length} total`}>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Campaign</th><th>Status</th><th className="num">Budget</th><th className="num">Spent</th><th className="num">Impr.</th><th className="num">Clicks</th><th className="num">CTR</th><th className="num">CPC</th><th className="num">Conv.</th><th className="num">ROAS</th><th /></tr></thead>
            <tbody>
              {PLATFORMS.flatMap((p) => ws.campaigns.filter((c) => c.platform === p)).map((c) => (
                <tr key={c.id} className="click" onClick={() => setOpenId(c.id)}>
                  <td style={{ minWidth: 220 }}><div className="strong">{c.name}</div><div className="sub">{c.platform} · {c.objective}</div></td>
                  <td><span className={`chip ${c.status === "active" ? "ok" : c.status === "paused" ? "warn" : ""}`}>{c.status}</span></td>
                  <td className="num">{money(c.budget, cur, true)}</td>
                  <td className="num">{money(c.spent, cur, true)}</td>
                  <td className="num">{num(c.impressions)}</td>
                  <td className="num">{num(c.clicks)}</td>
                  <td className="num">{pct(ctr(c), 2)}</td>
                  <td className="num">{c.clicks ? money(cpc(c), cur) : "—"}</td>
                  <td className="num">{num(c.conversions)}</td>
                  <td className="num" style={{ color: roas(c) >= 3 ? "var(--ok)" : roas(c) > 0 && roas(c) < 1.5 ? "var(--risk)" : undefined }}>{c.spent ? `${roas(c).toFixed(1)}×` : "—"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {c.status === "active" && <button className="btn ghost sm" onClick={() => setStatus(c.id, "paused", c.name)} aria-label={`Pause ${c.name}`}><IconPause /></button>}
                    {(c.status === "paused" || c.status === "draft") && <button className="btn ghost sm" onClick={() => setStatus(c.id, "active", c.name)} aria-label={`Activate ${c.name}`}><IconPlay /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small faint" style={{ margin: "12px 0 0" }}>Figures are as recorded in this workspace. Connect ad accounts to sync them live (on the roadmap).</p>
      </Panel>

      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} kicker={open ? `${open.platform} campaign` : ""} title={open?.name ?? ""}
        foot={open && (
          <div className="row">
            <button className="btn ai sm" onClick={() => ask(`Inspect the campaign "${open.name}" (id ${open.id}). Diagnose its performance and propose concrete fixes, including new ad copy if it would help.`)}><IconBolt />Ask EMMA to diagnose</button>
            <button className="btn ghost sm danger right" onClick={() => { remove("campaigns", open.id); setOpenId(null); }}><IconTrash />Delete</button>
          </div>
        )}
      >
        {open && (
          <div className="stack">
            <div className="grid cols-2">
              <Stat label="CPA" value={open.conversions ? money(cpa(open), cur) : "—"} />
              <Stat label="ROAS" value={open.spent ? `${roas(open).toFixed(1)}×` : "—"} />
            </div>
            <Dossier rows={[
              ["Status", open.status], ["Objective", open.objective], ["Audience", open.audience], ["Offering", offeringName(open.offering)],
              ["Dates", `${shortDate(open.startDate)} – ${shortDate(open.endDate)}`], ["Budget", money(open.budget, cur)], ["Spent", money(open.spent, cur)],
              ["Impressions", num(open.impressions)], ["Clicks", num(open.clicks)], ["CTR", pct(ctr(open), 2)], ["Conversions", num(open.conversions)],
              ["Revenue", money(open.revenue, cur)], ["Headline", open.headline ?? ""], ["Ad copy", open.body ? <span style={{ whiteSpace: "pre-wrap" }}>{open.body}</span> : ""],
            ]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
