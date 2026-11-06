"use client";

import { useEmma } from "@/lib/store";
import { complianceScore, money, pct } from "@/lib/metrics";
import type { CheckStatus } from "@/lib/types";
import { Panel, Stat, StatusChip } from "@/components/ui";
import { GroupedBars, HBars } from "@/components/Charts";
import { IconShield } from "@/components/icons";

export default function RoiCompliance() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const cur = ws.profile.currency;
  const hist = ws.history;
  const spend = hist.reduce((s, h) => s + h.spend, 0);
  const revenue = hist.reduce((s, h) => s + h.revenue, 0);
  const leads = hist.reduce((s, h) => s + h.leads, 0);
  const roi = spend ? (revenue - spend) / spend : 0;
  const channels = ["LinkedIn", "Meta", "Google", "Display", "TikTok"]
    .map((p) => {
      const cs = ws.campaigns.filter((c) => c.platform === p && c.spent > 0);
      const s = cs.reduce((t, c) => t + c.spent, 0);
      const r = cs.reduce((t, c) => t + c.revenue, 0);
      return { label: p, value: s ? r / s : 0, note: `${money(s, cur, true)} spent` };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const score = complianceScore(ws);
  const monthLabel = (m: string) => new Date(`${m}-01`).toLocaleDateString("en-GB", { month: "short" });
  const ask = (p: string) => { setDrawer(true); void send(p); };

  return (
    <div className="stack">
      <div className="grid cols-4">
        <Stat label="Spend · 6 months" value={money(spend, cur, true)} />
        <Stat label="Revenue · 6 months" value={money(revenue, cur, true)} />
        <Stat label="Marketing ROI" value={pct(roi)} foot="(revenue − spend) ÷ spend" />
        <Stat label="Cost per lead" value={money(leads ? spend / leads : 0, cur)} foot={`${leads} leads`} />
      </div>

      <div className="grid cols-3">
        <Panel title="Spend vs revenue by month" className="span-2">
          <GroupedBars data={hist.map((h, i) => ({ label: monthLabel(h.month) + (i === hist.length - 1 ? " MTD" : ""), a: h.spend, b: h.revenue }))} aLabel="Spend" bLabel="Revenue" format={(n) => money(n, "", true).trim()} />
        </Panel>
        <Panel title="ROAS by channel">
          <HBars rows={channels} format={(n) => `${n.toFixed(1)}×`} />
          <button className="btn ai sm" style={{ marginTop: 16 }} onClick={() => ask("Where should next month's ad budget go? Use our ROAS by channel and campaign results, and give me a split in shillings.")}>Ask EMMA where to spend</button>
        </Panel>
      </div>

      <div className="row" style={{ marginTop: 22, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>Compliance</h2>
          <div className="small muted">{ws.profile.compliance.regime} · {ws.profile.compliance.regulator}</div>
        </div>
        <button className="btn ai sm" onClick={() => ask("Audit our compliance checks and our leads and email audiences against our data protection regime. What must we fix first, and propose tasks with owners.")}><IconShield />Audit with EMMA</button>
      </div>

      <div className="grid cols-4">
        <Stat label="Compliance score" value={pct(score)} foot="OK = 1, attention = ½, risk = 0" />
        <Stat label="At risk" value={ws.compliance.filter((c) => c.status === "risk").length} />
        <Stat label="Needs attention" value={ws.compliance.filter((c) => c.status === "attention").length} />
        <Stat label="Leads without consent" value={ws.leads.filter((l) => !l.consent).length} foot="One-to-one contact only" />
      </div>

      <Panel title="Checks">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Area</th><th>Requirement</th><th>Note</th><th>Status</th></tr></thead>
            <tbody>
              {[...ws.compliance].sort((a, b) => order(a.status) - order(b.status)).map((c) => (
                <tr key={c.id}>
                  <td className="small strong">{c.area}</td>
                  <td style={{ minWidth: 240 }}>{c.item}</td>
                  <td className="small muted" style={{ minWidth: 220 }}>{c.note}</td>
                  <td>
                    <div className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
                      <StatusChip status={c.status} />
                      <select className="select sm" value={c.status} onChange={(e) => patch("compliance", c.id, { status: e.target.value as CheckStatus })} aria-label={`Status for ${c.item}`}>
                        <option value="ok">ok</option><option value="attention">attention</option><option value="risk">risk</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small faint" style={{ margin: "12px 0 0" }}>EMMA tracks these checks; she isn&apos;t a lawyer. Have a qualified person confirm anything you act on.</p>
      </Panel>
    </div>
  );
}

const order = (s: CheckStatus) => ({ risk: 0, attention: 1, ok: 2 })[s];
