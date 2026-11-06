"use client";

import { useRouter } from "next/navigation";
import { useEmma } from "@/lib/store";
import { money, num, pct } from "@/lib/metrics";
import { PageIntro, Panel } from "@/components/ui";
import { HBars } from "@/components/Charts";
import { IconGavel, IconMegaphone, IconStar } from "@/components/icons";

export default function Catalog() {
  const ws = useEmma((s) => s.ws);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const cur = ws.profile.currency;
  const offerings = [...ws.profile.offerings].sort((a, b) => b.revenue - a.revenue);
  const linked = (id: string) => ws.calendar.filter((e) => e.linkedOffering === id).length + ws.campaigns.filter((c) => c.offering === id).length;
  const ask = (p: string) => { setDrawer(true); void send(p); };
  const router = useRouter();
  const setJuryDraft = useEmma((s) => s.setJuryDraft);
  const putOnTrial = (o: (typeof offerings)[number]) => {
    setJuryDraft({
      title: o.name, kind: "Offer", context: "",
      pitch: `${o.name}: ${o.description} ${cur} ${o.price.toLocaleString("en-KE")}.`,
      audience: "", price: `${cur} ${o.price.toLocaleString("en-KE")}`,
    });
    router.push("/app/jury");
  };

  return (
    <div className="stack">
      <PageIntro title="Catalog" />

      <div className="tiles" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {offerings.map((o) => (
          <div key={o.id} className="glass panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="small muted" style={{ textTransform: "capitalize" }}>{o.kind}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o.name}</div>
              </div>
              <span className="mono small">{money(o.price, cur)}</span>
            </div>
            <div className="small" style={{ color: "var(--text-2)" }}>{o.description}</div>
            <div className="grid cols-2" style={{ gap: 10 }}>
              <div><div className="small muted">Customers</div><div className="mono">{num(o.customers)}</div></div>
              <div><div className="small muted">Rating</div><div className="mono row" style={{ gap: 4 }}><IconStar width={13} style={{ color: "var(--warn)" }} />{o.rating.toFixed(1)}</div></div>
              <div><div className="small muted">{o.kind === "course" ? "Completion" : "Repeat rate"}</div><div className="mono">{pct(o.repeatRate)}</div></div>
              <div><div className="small muted">Revenue</div><div className="mono">{money(o.revenue, cur, true)}</div></div>
            </div>
            <div className="row" style={{ marginTop: "auto" }}>
              <span className="small faint">{linked(o.id)} linked</span>
              <button className="btn sm right" onClick={() => putOnTrial(o)}><IconGavel />Put on trial</button>
              <button className="btn ai sm" onClick={() => ask(`Build a complete campaign for "${o.name}" (${o.id}): calendar entries across the funnel, one paid campaign, and an email. Use what we know about who buys it.`)}>
                <IconMegaphone />Campaign
              </button>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Revenue by offering">
        <HBars rows={offerings.map((o) => ({ label: o.name, value: o.revenue, note: `${num(o.customers)} customers` }))} format={(n) => money(n, cur, true)} />
      </Panel>
    </div>
  );
}
