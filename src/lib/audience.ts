// Audiences: rule-based segments over leads. Pure functions; the same rules drive the Audiences
// screen, automations and exports.

import type { Lead, Segment, SegmentField, SegmentOp, SegmentRule } from "./types";

export const FIELD_LABEL: Record<SegmentField, string> = {
  stage: "Stage", source: "Source", score: "Score", value: "Deal value", consent: "Agreed to marketing",
  verified: "Contact checked", lastTouchDays: "Days since last contact", text: "Any text",
};

export const OPS_FOR: Record<SegmentField, SegmentOp[]> = {
  stage: ["is", "isNot"], source: ["is", "isNot", "contains"], score: ["gte", "lte"], value: ["gte", "lte"],
  consent: ["is"], verified: ["is"], lastTouchDays: ["gte", "lte"], text: ["contains"],
};

export const OP_LABEL: Record<SegmentOp, string> = { is: "is", isNot: "is not", gte: "at least", lte: "at most", contains: "contains" };

export function daysSince(isoDate: string, now = new Date()): number {
  const t = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.max(0, Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - t) / 86_400_000));
}

export function ruleMatches(l: Lead, r: SegmentRule, now = new Date()): boolean {
  const n = Number(r.value);
  const v = r.value.trim().toLowerCase();
  switch (r.field) {
    case "stage": return r.op === "is" ? l.stage === r.value : l.stage !== r.value;
    case "source": {
      const s = (l.source ?? "").toLowerCase();
      return r.op === "is" ? s === v : r.op === "isNot" ? s !== v : s.includes(v);
    }
    case "score": return r.op === "gte" ? l.score >= n : l.score <= n;
    case "value": return r.op === "gte" ? l.value >= n : l.value <= n;
    case "consent": return l.consent === (r.value === "true");
    case "verified": return l.verified === (r.value === "true");
    case "lastTouchDays": { const d = daysSince(l.lastTouch, now); return r.op === "gte" ? d >= n : d <= n; }
    case "text": return v === "" || [l.name, l.company, l.role, l.notes, l.source].join(" ").toLowerCase().includes(v);
  }
}

export function inSegment(l: Lead, s: Segment, now = new Date()): boolean {
  if (!s.rules.length) return true;
  return s.match === "all" ? s.rules.every((r) => ruleMatches(l, r, now)) : s.rules.some((r) => ruleMatches(l, r, now));
}

export function members(leads: Lead[], s: Segment, now = new Date()): Lead[] {
  return leads.filter((l) => inSegment(l, s, now));
}

// Ready-made audiences most small businesses need on day one.
export const STARTER_SEGMENTS: Omit<Segment, "id" | "createdAt">[] = [
  { name: "Hot leads", match: "all", rules: [{ field: "score", op: "gte", value: "75" }, { field: "stage", op: "isNot", value: "won" }, { field: "stage", op: "isNot", value: "lost" }] },
  { name: "Gone quiet (14+ days)", match: "all", rules: [{ field: "lastTouchDays", op: "gte", value: "14" }, { field: "stage", op: "isNot", value: "won" }, { field: "stage", op: "isNot", value: "lost" }] },
  { name: "Can market to (consented)", match: "all", rules: [{ field: "consent", op: "is", value: "true" }] },
  { name: "Lost, worth a win-back", match: "all", rules: [{ field: "stage", op: "is", value: "lost" }, { field: "consent", op: "is", value: "true" }] },
  { name: "Customers (won)", match: "all", rules: [{ field: "stage", op: "is", value: "won" }] },
];

// CSV for consented contacts only (Kenya Data Protection Act: marketing needs consent).
export function toCsv(leads: Lead[]): string {
  const esc = (x: string | number | boolean) => { const s = String(x ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const head = ["name", "company", "role", "email", "phone", "stage", "score", "value", "source", "last_touch"];
  const rows = leads.filter((l) => l.consent).map((l) => [l.name, l.company, l.role, l.email, l.phone, l.stage, l.score, l.value, l.source, l.lastTouch].map(esc).join(","));
  return [head.join(","), ...rows].join("\n") + "\n";
}
