"use client";

// Hand-built SVG charts. One y-axis, thin marks, rounded data-ends anchored to
// the baseline, a 2px gap between adjacent bars, recessive grid, a legend for
// two series, and a hover tooltip on every mark.

import { useState } from "react";

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * p;
}

// Bar with only the data-end (top) rounded, so it sits flat on the baseline.
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export interface GroupDatum { label: string; a: number; b: number }

export function GroupedBars({ data, aLabel, bLabel, format, height = 240 }: { data: GroupDatum[]; aLabel: string; bLabel: string; format: (n: number) => string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = height, padL = 56, padR = 8, padT = 12, padB = 28;
  const max = niceMax(Math.max(...data.flatMap((d) => [d.a, d.b])));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const groupW = (W - padL - padR) / data.length;
  const barW = Math.min(26, (groupW - 18) / 2);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const h = (v: number) => (H - padT - padB) * (v / max);

  return (
    <div className="chart">
      <div className="legend" style={{ marginBottom: 10 }}>
        <span><i style={{ background: "var(--chart-1)" }} />{aLabel}</span>
        <span><i style={{ background: "var(--chart-2)" }} />{bLabel}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${aLabel} and ${bLabel} by month`} onMouseLeave={() => setHover(null)}>
        <g className="grid">
          {ticks.map((t) => <line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />)}
        </g>
        <g className="axis">
          {ticks.map((t) => <text key={t} x={padL - 8} y={y(t) + 4} textAnchor="end">{format(t)}</text>)}
          {data.map((d, i) => <text key={d.label} x={padL + groupW * i + groupW / 2} y={H - 8} textAnchor="middle">{d.label}</text>)}
        </g>
        {data.map((d, i) => {
          const cx = padL + groupW * i + groupW / 2;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)}>
              <rect x={padL + groupW * i} y={padT} width={groupW} height={H - padT - padB} fill={hover === i ? "var(--chart-track)" : "transparent"} />
              <path d={barPath(cx - barW - 1, y(d.a), barW, h(d.a))} fill="var(--chart-1)" />
              <path d={barPath(cx + 1, y(d.b), barW, h(d.b))} fill="var(--chart-2)" />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${((padL + groupW * hover + groupW / 2) / W) * 100}%`, top: `${(y(Math.max(data[hover].a, data[hover].b)) / H) * 100}%` }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{data[hover].label}</div>
          <div className="r"><span className="legend"><i style={{ background: "var(--chart-1)" }} /></span>{aLabel}: <b className="mono">{format(data[hover].a)}</b></div>
          <div className="r"><span className="legend"><i style={{ background: "var(--chart-2)" }} /></span>{bLabel}: <b className="mono">{format(data[hover].b)}</b></div>
        </div>
      )}
      <table className="sr-only">
        <thead><tr><th>Month</th><th>{aLabel}</th><th>{bLabel}</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{format(d.a)}</td><td>{format(d.b)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export interface HBarRow { label: string; value: number; note?: string }

// Single series: no legend, the panel title names it; every row is direct-labelled.
export function HBars({ rows, format, max }: { rows: HBarRow[]; format: (n: number) => string; max?: number }) {
  const m = max ?? niceMax(Math.max(...rows.map((r) => r.value), 0));
  return (
    <div className="stack" style={{ gap: 12 }}>
      {rows.map((r) => (
        <div key={r.label} title={`${r.label}: ${format(r.value)}${r.note ? ` · ${r.note}` : ""}`}>
          <div className="meter-top" style={{ marginBottom: 5 }}>
            <span>{r.label}{r.note && <span className="faint small"> · {r.note}</span>}</span>
            <span>{format(r.value)}</span>
          </div>
          <div className="meter-track" style={{ height: 8 }}>
            <div style={{ width: `${m ? (r.value / m) * 100 : 0}%`, height: "100%", borderRadius: "0 4px 4px 0", background: "var(--chart-1)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, width = 120, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 3 - ((v - min) / span) * (height - 6)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={4} fill="var(--accent)" stroke="var(--surface-solid)" strokeWidth={2} />
    </svg>
  );
}
