// Automations: IF-THEN rules that turn into suggestions a person approves. Nothing is sent or
// changed until someone taps Approve, and messages to people who haven't agreed to marketing are
// held back (Kenya Data Protection Act 2019), except replies to people already talking to you.

import { daysSince, inSegment } from "./audience";
import type { Automation, AutomationAction, AutomationTrigger, KeyDate, Lead, LeadStage, Workspace } from "./types";

export interface Suggestion {
  key: string; // automationId|targetId
  automationId: string;
  automationName: string;
  target: { kind: "lead"; lead: Lead } | { kind: "keyDate"; keyDate: KeyDate };
  action: AutomationAction;
  text: string; // personalised message or task title
  reason: string;
  link?: string; // wa.me / mailto / sms: opens the person's own app with the text filled in
}

const ACTIVE: LeadStage[] = ["contacted", "qualified", "proposal"]; // already in a conversation

export function firstName(n: string) { return (n.trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}'-]/gu, ""); }

export function fill(t: string, ctx: { lead?: Lead; keyDate?: KeyDate; business: string }): string {
  return t
    .replace(/\{first_name\}/g, ctx.lead ? firstName(ctx.lead.name) || "there" : "there")
    .replace(/\{name\}/g, ctx.lead?.name ?? "")
    .replace(/\{company\}/g, ctx.lead?.company ?? "")
    .replace(/\{business\}/g, ctx.business)
    .replace(/\{date_name\}/g, ctx.keyDate?.name ?? "")
    .replace(/\{date\}/g, ctx.keyDate?.date ?? "")
    .replace(/([^.])\.\.(?!\.)/g, "$1."); // "Jua Coffee Co.." → "Jua Coffee Co." (keeps "...")
}

function waNumber(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return `254${d.slice(1)}`;
  if (/^254[17]\d{8}$/.test(d)) return d;
  if (/^[17]\d{8}$/.test(d)) return `254${d}`;
  return d.length >= 10 && d.length <= 15 ? d : null;
}

export function actionLink(a: AutomationAction, text: string, lead?: Lead): string | undefined {
  if (a.kind !== "message" || !lead) return undefined;
  if (a.channel === "whatsapp") { const n = waNumber(lead.phone); return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : undefined; }
  if (a.channel === "sms") { const n = waNumber(lead.phone); return n ? `sms:+${n}?body=${encodeURIComponent(text)}` : undefined; }
  if (a.channel === "email" && /^\S+@\S+\.\S+$/.test(lead.email)) return `mailto:${lead.email}?subject=${encodeURIComponent("Following up")}&body=${encodeURIComponent(text)}`;
  return undefined;
}

function leadTriggered(t: AutomationTrigger, l: Lead, now: Date): string | null {
  switch (t.kind) {
    case "newLead": return l.stage === "new" ? "New lead" : null;
    case "stageQuiet": { const d = daysSince(l.lastTouch, now); return l.stage === t.stage && d >= t.days ? `${l.stage} and no contact for ${d} days` : null; }
    case "hotLead": return l.score >= t.score && l.stage !== "won" && l.stage !== "lost" ? `Score ${l.score}` : null;
    default: return null;
  }
}

export function evaluate(ws: Workspace, now = new Date()): { suggestions: Suggestion[]; heldForConsent: number } {
  const out: Suggestion[] = [];
  let held = 0;
  const business = ws.profile.name || "us";
  for (const a of ws.automations ?? []) {
    if (!a.enabled) continue;
    const seg = a.segmentId ? ws.segments?.find((s) => s.id === a.segmentId) : undefined;
    const cooled = (id: string) => { const f = a.fired[id]; return !f || daysSince(f, now) >= a.cooldownDays; };

    if (a.trigger.kind === "keyDate") {
      for (const k of ws.profile.keyDates) {
        const until = Math.round((new Date(`${k.date.slice(0, 10)}T00:00:00Z`).getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 86_400_000);
        if (Number.isNaN(until) || until < 0 || until > a.trigger.daysBefore || !cooled(k.id)) continue;
        const text = fill(a.action.kind === "task" ? a.action.title : a.action.kind === "message" ? a.action.text : "", { keyDate: k, business });
        out.push({ key: `${a.id}|${k.id}`, automationId: a.id, automationName: a.name, target: { kind: "keyDate", keyDate: k }, action: a.action, text, reason: `${k.name} is in ${until} day${until === 1 ? "" : "s"}` });
      }
      continue;
    }

    for (const l of ws.leads) {
      if (seg && !inSegment(l, seg, now)) continue;
      const why = leadTriggered(a.trigger, l, now);
      if (!why || !cooled(l.id)) continue;
      if (a.action.kind === "message" && !l.consent && !ACTIVE.includes(l.stage)) { held++; continue; }
      const text = fill(a.action.kind === "task" ? a.action.title : a.action.kind === "message" ? a.action.text : `Move ${l.name} to ${a.action.stage}`, { lead: l, business });
      out.push({ key: `${a.id}|${l.id}`, automationId: a.id, automationName: a.name, target: { kind: "lead", lead: l }, action: a.action, text, reason: why, link: actionLink(a.action, text, l) });
    }
  }
  return { suggestions: out.slice(0, 200), heldForConsent: held };
}

// Recipes: one tap to start, editable after.
export const RECIPES: { id: string; name: string; blurb: string; build: () => Omit<Automation, "id" | "fired" | "createdAt"> }[] = [
  { id: "welcome", name: "Welcome every new lead", blurb: "A friendly WhatsApp hello the day a lead comes in.", build: () => ({ name: "Welcome new leads", enabled: true, cooldownDays: 365, trigger: { kind: "newLead" }, action: { kind: "message", channel: "whatsapp", text: "Hi {first_name}, thanks for reaching out to {business}! How can we help you today?" } }) },
  { id: "nudge", name: "Nudge quiet conversations", blurb: "Follow up when a contacted lead goes quiet for 3 days.", build: () => ({ name: "Follow up after 3 quiet days", enabled: true, cooldownDays: 7, trigger: { kind: "stageQuiet", stage: "contacted", days: 3 }, action: { kind: "message", channel: "whatsapp", text: "Hi {first_name}, just checking in from {business}. Did you get a chance to look at what we discussed? Happy to answer any questions." } }) },
  { id: "proposal", name: "Chase sent proposals", blurb: "A call reminder 2 days after a proposal with no reply.", build: () => ({ name: "Call about open proposals", enabled: true, cooldownDays: 5, trigger: { kind: "stageQuiet", stage: "proposal", days: 2 }, action: { kind: "task", title: "Call {name} ({company}) about the proposal" } }) },
  { id: "hot", name: "Call hot leads today", blurb: "A task for every lead scoring 75 or more.", build: () => ({ name: "Call hot leads", enabled: true, cooldownDays: 7, trigger: { kind: "hotLead", score: 75 }, action: { kind: "task", title: "Call {name} today (hot lead)" } }) },
  { id: "winback", name: "Win back lost leads", blurb: "A gentle offer 30 days after a lead was lost (consented only).", build: () => ({ name: "Win back after 30 days", enabled: true, cooldownDays: 90, trigger: { kind: "stageQuiet", stage: "lost", days: 30 }, action: { kind: "message", channel: "whatsapp", text: "Hi {first_name}, it's {business}. We've got something new you might like. Can I share it with you?" } }) },
  { id: "dates", name: "Prepare for key dates", blurb: "A planning task 14 days before each key date in your profile.", build: () => ({ name: "Plan content for key dates", enabled: true, cooldownDays: 30, trigger: { kind: "keyDate", daysBefore: 14 }, action: { kind: "task", title: "Plan posts and offers for {date_name} ({date})" } }) },
];

export function describeTrigger(t: AutomationTrigger): string {
  switch (t.kind) {
    case "newLead": return "a new lead comes in";
    case "stageQuiet": return `a lead is "${t.stage}" with no contact for ${t.days} days`;
    case "hotLead": return `a lead scores ${t.score} or more`;
    case "keyDate": return `a key date is ${t.daysBefore} days away`;
  }
}

export function describeAction(a: AutomationAction): string {
  if (a.kind === "message") return `draft a ${a.channel === "whatsapp" ? "WhatsApp" : a.channel === "sms" ? "text" : "email"} message`;
  if (a.kind === "task") return "create a task";
  return `move the lead to "${a.stage}"`;
}
