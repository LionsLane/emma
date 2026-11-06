// Derived numbers. Nothing on the dashboard is typed in by hand: every figure
// is computed from the workspace so it moves when the data moves.

import type { Campaign, CalendarEntry, EmailItem, Lead, LeadStage, Workspace } from "./types";

export const STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];

// Rough probability of closing at each stage, used for the weighted forecast.
export const STAGE_WEIGHT: Record<LeadStage, number> = {
  new: 0.05, contacted: 0.15, qualified: 0.35, proposal: 0.6, won: 1, lost: 0,
};

export const ctr = (c: Campaign) => (c.impressions ? c.clicks / c.impressions : 0);
export const cpc = (c: Campaign) => (c.clicks ? c.spent / c.clicks : 0);
export const cpa = (c: Campaign) => (c.conversions ? c.spent / c.conversions : 0);
export const roas = (c: Campaign) => (c.spent ? c.revenue / c.spent : 0);

export const openRate = (e: EmailItem) => (e.sent ? e.opens / e.sent : 0);
export const clickRate = (e: EmailItem) => (e.sent ? e.clicks / e.sent : 0);

export function leadTemp(l: Lead): "hot" | "warm" | "cold" {
  if (l.score >= 75) return "hot";
  if (l.score >= 50) return "warm";
  return "cold";
}

const DOSSIER_FIELDS: (keyof CalendarEntry)[] = [
  "date", "sector", "contentType", "platform", "angle", "linkedOffering", "objective", "kpi",
  "audienceSegment", "contentMix", "bestPractice", "themePillar", "owner", "draftDue", "reviewDate",
  "publishDate", "repurposingPlan",
];

export function dossierCompleteness(e: CalendarEntry): number {
  const filled = DOSSIER_FIELDS.filter((k) => String(e[k] ?? "").trim() !== "").length;
  return filled / DOSSIER_FIELDS.length;
}

function daysSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / 86_400_000;
}

export function summary(ws: Workspace) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const active = ws.campaigns.filter((c) => c.status !== "draft");
  const spend = active.reduce((s, c) => s + c.spent, 0);
  const revenue = active.reduce((s, c) => s + c.revenue, 0);
  const openLeads = ws.leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const pipeline = openLeads.reduce((s, l) => s + l.value, 0);
  const weighted = openLeads.reduce((s, l) => s + l.value * STAGE_WEIGHT[l.stage], 0);
  const sentEmails = ws.emails.filter((e) => e.sent > 0);
  const totalSent = sentEmails.reduce((s, e) => s + e.sent, 0);
  const totalOpens = sentEmails.reduce((s, e) => s + e.opens, 0);
  const published = ws.calendar.filter((e) => e.status === "published" || e.status === "scheduled").length;
  const newLeadsMonth = ws.leads.filter((l) => l.lastTouch.slice(0, 7) === thisMonth).length;

  // The three "AI performance" bars, each a plain, explainable ratio.
  const contentQuality = ws.calendar.length
    ? ws.calendar.reduce((s, e) => s + dossierCompleteness(e), 0) / ws.calendar.length
    : 0;
  const automations = ws.emails.filter((e) => e.kind === "automation");
  const automationEfficiency = automations.length
    ? automations.filter((e) => e.status === "running").length / automations.length
    : 0;
  const leadEngagement = openLeads.length
    ? openLeads.filter((l) => daysSince(l.lastTouch) <= 7).length / openLeads.length
    : 0;

  return {
    spend, revenue, roas: spend ? revenue / spend : 0,
    pipeline, weighted, openLeads: openLeads.length, newLeadsMonth,
    openRate: totalSent ? totalOpens / totalSent : 0,
    published,
    contentQuality, automationEfficiency, leadEngagement,
  };
}

export function complianceScore(ws: Workspace): number {
  if (!ws.compliance.length) return 0;
  const pts = ws.compliance.reduce((s, c) => s + (c.status === "ok" ? 1 : c.status === "attention" ? 0.5 : 0), 0);
  return pts / ws.compliance.length;
}

// ---- formatting

export function money(n: number, currency = "KES", compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    const a = Math.abs(n);
    const v = a >= 999_500 ? `${(n / 1_000_000).toFixed(a >= 9_950_000 ? 0 : 1)}M` : `${Math.round(n / 1000)}k`;
    return `${currency} ${v}`.trim();
  }
  return `${currency} ${Math.round(n).toLocaleString("en-KE")}`;
}

export const num = (n: number) => Math.round(n).toLocaleString("en-KE");
export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;

export function shortDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function relTime(isoDateTime: string): string {
  const mins = Math.round((Date.now() - new Date(isoDateTime).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
