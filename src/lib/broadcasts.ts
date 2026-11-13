// Broadcasts: one message, in up to five versions, to an audience. A person sends each message
// by tapping through a queue (EMMA never sends by herself), only leads who agreed to marketing
// are included, and a hold-out group gets nothing so the effect can be measured.

import { e164Digits, resolveAudience } from "./audience";
import { actionLink, firstName } from "./automations";
import type { Broadcast, BroadcastSend, BroadcastVariant, Lead, LeadStage, Workspace } from "./types";

export const MAX_VARIANTS = 5;
export const LABELS = ["A", "B", "C", "D", "E"];

// FNV-1a: a small, stable hash so the same lead always lands in the same group.
export function fnv(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

export function assign(broadcastId: string, leadId: string, variants: BroadcastVariant[], holdoutPct: number): string {
  const h = fnv(`${broadcastId}|${leadId}`);
  if (h % 100 < holdoutPct) return "holdout";
  return variants[Math.floor(h / 100) % variants.length].id;
}

export function reachable(l: Lead, channel: Broadcast["channel"]): boolean {
  return channel === "email" ? /^\S+@\S+\.\S+$/.test((l.email ?? "").trim()) : Boolean(e164Digits(l.phone ?? ""));
}

// Who would receive it: in the audience, agreed to marketing, and reachable on this channel.
export function audiencePreview(ws: Workspace, audience: string, channel: Broadcast["channel"]) {
  const { name, leads } = resolveAudience(ws.leads, audience, ws.segments ?? []);
  const consented = leads.filter((l) => l.consent);
  const eligible = consented.filter((l) => reachable(l, channel));
  return { name, eligible, noConsent: leads.length - consented.length, noContact: consented.length - eligible.length };
}

export function buildSends(id: string, eligible: Lead[], variants: BroadcastVariant[], holdoutPct: number, at: string): Record<string, BroadcastSend> {
  const sends: Record<string, BroadcastSend> = {};
  for (const l of eligible) {
    const v = assign(id, l.id, variants, holdoutPct);
    sends[l.id] = { v, at, state: v === "holdout" ? "holdout" : "queued", stageAt: l.stage };
  }
  return sends;
}

export function render(b: Broadcast, v: BroadcastVariant, lead: Lead, business: string): string {
  const link = v.short ?? b.destination ?? "";
  return v.text
    .replace(/\{first_name\}/g, firstName(lead.name) || "there")
    .replace(/\{name\}/g, lead.name)
    .replace(/\{company\}/g, lead.company)
    .replace(/\{business\}/g, business)
    .replace(/\{link\}/g, link)
    .replace(/([^.])\.\.(?!\.)/g, "$1.")
    .trim();
}

export function sendLink(b: Broadcast, text: string, lead: Lead): string | undefined {
  return actionLink({ kind: "message", channel: b.channel, text }, text, lead);
}

const RANK: Record<LeadStage, number> = { lost: -1, new: 0, contacted: 1, qualified: 2, proposal: 3, won: 4 };
const progressed = (now: LeadStage, then: LeadStage) => RANK[now] > RANK[then] && now !== "lost";

export interface VariantReport { id: string; label: string; assigned: number; sent: number; skipped: number; queued: number; clicks: number | null; people: number | null; rate: number | null }
export interface BroadcastReport {
  variants: VariantReport[];
  queued: number; sent: number; skipped: number;
  messaged: { size: number; progressed: number };
  holdout: { size: number; progressed: number };
  winner: string | null; // variant label, or null when it's too early or there's nothing to compare
  verdict: string;
}

export function report(b: Broadcast, leads: Lead[], linkStats: Record<string, { clicks: number; unique: number }> | null): BroadcastReport {
  const byId = new Map(leads.map((l) => [l.id, l]));
  const entries = Object.entries(b.sends);
  const variants: VariantReport[] = b.variants.map((v) => {
    const mine = entries.filter(([, s]) => s.v === v.id);
    const sent = mine.filter(([, s]) => s.state === "sent").length;
    const st = v.linkCode && linkStats ? linkStats[v.linkCode] ?? { clicks: 0, unique: 0 } : null;
    return {
      id: v.id, label: v.label, assigned: mine.length, sent, skipped: mine.filter(([, s]) => s.state === "skipped").length,
      queued: mine.filter(([, s]) => s.state === "queued").length,
      clicks: st ? st.clicks : null, people: st ? st.unique : null, rate: st && sent > 0 ? Math.min(1, st.unique / sent) : null,
    };
  });
  const moved = (state: BroadcastSend["state"]) => {
    const group = entries.filter(([, s]) => s.state === state);
    return { size: group.length, progressed: group.filter(([id, s]) => { const l = byId.get(id); return l ? progressed(l.stage, s.stageAt) : false; }).length };
  };
  const sent = variants.reduce((a, v) => a + v.sent, 0);
  const tracked = variants.filter((v) => v.people !== null); // has a tracked link (even with no clicks yet)
  let winner: string | null = null;
  let verdict = "";
  if (sent === 0) verdict = "Nothing sent yet. Work through the queue below.";
  else if (variants.length < 2) verdict = tracked.length ? `${Math.round((tracked[0].rate ?? 0) * 100)}% of people who got it opened the link.` : "Add a link next time to see how many people open it.";
  else if (!tracked.length) verdict = "No tracked link, so the versions can't be compared on clicks.";
  else if (variants.some((v) => v.sent < 20)) verdict = "Too early: send each version to at least 20 people before comparing.";
  else {
    const ranked = [...tracked].sort((x, y) => (y.rate ?? 0) - (x.rate ?? 0));
    const [top, next] = ranked;
    if ((top.people ?? 0) - (next?.people ?? 0) >= 5 && (top.rate ?? 0) >= (next?.rate ?? 0) * 1.25) { winner = top.label; verdict = `Version ${top.label} is winning: ${Math.round((top.rate ?? 0) * 100)}% opened the link, against ${Math.round((next?.rate ?? 0) * 100)}%.`; }
    else verdict = "Too close to call. Keep sending, or try versions that differ more.";
  }
  return { variants, queued: variants.reduce((a, v) => a + v.queued, 0), sent, skipped: variants.reduce((a, v) => a + v.skipped, 0), messaged: moved("sent"), holdout: moved("holdout"), winner, verdict };
}
