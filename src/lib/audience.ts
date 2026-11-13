// Audiences: rule-based segments over leads. Pure functions; the same rules drive the Audiences
// screen, automations, broadcasts and exports.

import type { Lead, Segment, SegmentField, SegmentOp, SegmentRule } from "./types";

export const FIELD_LABEL: Record<SegmentField, string> = {
  stage: "Stage", source: "Source", score: "Score", value: "Deal value", consent: "Agreed to marketing",
  verified: "Contact checked", lastTouchDays: "Days since last contact", text: "Any text",
  tag: "Tag", company: "Company", role: "Role", hasPhone: "Has a phone number", hasEmail: "Has an email",
};

export const OPS_FOR: Record<SegmentField, SegmentOp[]> = {
  stage: ["is", "isNot"], source: ["is", "isNot", "contains"], score: ["gte", "lte"], value: ["gte", "lte"],
  consent: ["is"], verified: ["is"], lastTouchDays: ["gte", "lte"], text: ["contains"],
  tag: ["is", "isNot"], company: ["contains", "is"], role: ["contains", "is"], hasPhone: ["is"], hasEmail: ["is"],
};

export const OP_LABEL: Record<SegmentOp, string> = { is: "is", isNot: "is not", gte: "at least", lte: "at most", contains: "contains" };
export const YES_NO_FIELDS: SegmentField[] = ["consent", "verified", "hasPhone", "hasEmail"];
export const NUMBER_FIELDS: SegmentField[] = ["score", "value", "lastTouchDays"];

export function daysSince(isoDate: string, now = new Date()): number {
  const t = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.max(0, Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - t) / 86_400_000));
}

export const cleanTag = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 30);
export const hasTag = (l: Lead, tag: string) => (l.tags ?? []).some((t) => cleanTag(t) === cleanTag(tag));

export function ruleMatches(l: Lead, r: SegmentRule, now = new Date()): boolean {
  const n = Number(r.value);
  const v = r.value.trim().toLowerCase();
  const text = (s: string | undefined) => (s ?? "").toLowerCase();
  switch (r.field) {
    case "stage": return r.op === "is" ? l.stage === r.value : l.stage !== r.value;
    case "source": return r.op === "is" ? text(l.source) === v : r.op === "isNot" ? text(l.source) !== v : text(l.source).includes(v);
    case "score": return r.op === "gte" ? l.score >= n : l.score <= n;
    case "value": return r.op === "gte" ? l.value >= n : l.value <= n;
    case "consent": return l.consent === (r.value === "true");
    case "verified": return l.verified === (r.value === "true");
    case "lastTouchDays": { const d = daysSince(l.lastTouch, now); return r.op === "gte" ? d >= n : d <= n; }
    case "text": return v === "" || [l.name, l.company, l.role, l.notes, l.source, ...(l.tags ?? [])].join(" ").toLowerCase().includes(v);
    case "tag": return v === "" ? true : r.op === "isNot" ? !hasTag(l, v) : hasTag(l, v);
    case "company": return r.op === "is" ? text(l.company) === v : text(l.company).includes(v);
    case "role": return r.op === "is" ? text(l.role) === v : text(l.role).includes(v);
    case "hasPhone": return Boolean(l.phone?.replace(/\D/g, "")) === (r.value === "true");
    case "hasEmail": return /^\S+@\S+\.\S+$/.test(l.email ?? "") === (r.value === "true");
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

// ---- Smart audiences: worked out from recency (days since contact) and value, and always up to
// date. Plain rules, shown to the owner; no machine learning is claimed.

export interface SmartSegment { id: string; name: string; how: string; test: (l: Lead, ctx: { highValue: number; now: Date }) => boolean }

const isOpen = (l: Lead) => l.stage !== "won" && l.stage !== "lost";

export const SMART_SEGMENTS: SmartSegment[] = [
  { id: "loyal", name: "Loyal customers", how: "Won, and in touch within the last 60 days", test: (l, c) => l.stage === "won" && daysSince(l.lastTouch, c.now) <= 60 },
  { id: "hibernating", name: "Hibernating customers", how: "Won, but no contact for more than 60 days", test: (l, c) => l.stage === "won" && daysSince(l.lastTouch, c.now) > 60 },
  { id: "atrisk", name: "High value, at risk", how: "Open deals in your top third by value with no contact for 10 days or more", test: (l, c) => isOpen(l) && l.value > 0 && l.value >= c.highValue && daysSince(l.lastTouch, c.now) >= 10 },
  { id: "closing", name: "Ready to close", how: "Qualified or proposal stage, score 70 or more, contacted in the last 7 days", test: (l, c) => (l.stage === "qualified" || l.stage === "proposal") && l.score >= 70 && daysSince(l.lastTouch, c.now) <= 7 },
  { id: "fresh", name: "New this week", how: "New leads from the last 7 days", test: (l, c) => l.stage === "new" && daysSince(l.lastTouch, c.now) <= 7 },
];

export function smartContext(leads: Lead[], now = new Date()) {
  const values = leads.filter((l) => isOpen(l) && l.value > 0).map((l) => l.value).sort((a, b) => a - b);
  // Top third: the value at the 2/3 mark of open deals (Infinity when there are none).
  const highValue = values.length ? values[Math.min(values.length - 1, Math.floor((values.length * 2) / 3))] : Number.POSITIVE_INFINITY;
  return { highValue, now };
}

export function smartMembers(leads: Lead[], s: SmartSegment, now = new Date()): Lead[] {
  const ctx = smartContext(leads, now);
  return leads.filter((l) => s.test(l, ctx));
}

// Resolves an audience reference used by broadcasts: "" = everyone, a Segment id, or "smart:<id>".
export function resolveAudience(leads: Lead[], ref: string, segments: Segment[], now = new Date()): { name: string; leads: Lead[] } {
  if (!ref) return { name: "Everyone", leads };
  if (ref.startsWith("smart:")) {
    const s = SMART_SEGMENTS.find((x) => x.id === ref.slice(6));
    return s ? { name: s.name, leads: smartMembers(leads, s, now) } : { name: "Unknown audience", leads: [] };
  }
  const seg = segments.find((x) => x.id === ref);
  return seg ? { name: seg.name, leads: members(leads, seg, now) } : { name: "Deleted audience", leads: [] };
}

const esc = (x: string | number | boolean) => { const s = String(x ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

// CSV for consented contacts only (Kenya Data Protection Act: marketing needs consent).
export function toCsv(leads: Lead[]): string {
  const head = ["name", "company", "role", "email", "phone", "stage", "score", "value", "source", "last_touch", "tags"];
  const rows = leads.filter((l) => l.consent).map((l) => [l.name, l.company, l.role, l.email, l.phone, l.stage, l.score, l.value, l.source, l.lastTouch, (l.tags ?? []).join("; ")].map(esc).join(","));
  return [head.join(","), ...rows].join("\n") + "\n";
}

// Phone digits with country code (Kenyan local numbers get 254). Null when it can't be a phone.
export function e164Digits(phone: string): string | null {
  const d = (phone ?? "").replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return `254${d.slice(1)}`;
  if (/^[17]\d{8}$/.test(d)) return `254${d}`;
  return d.length >= 10 && d.length <= 15 ? d : null;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Customer-list files for ad platforms. Contacts are SHA-256 hashed in the browser, so the plain
// emails and numbers never leave the device; only consented leads are included.
//   meta:   email (lowercase, trimmed) and phone (digits with country code) → Meta "Customer list"
//   google: email (lowercase, trimmed) and phone (E.164 with +)            → Google "Customer Match"
export async function hashedAudienceCsv(leads: Lead[], platform: "meta" | "google"): Promise<{ csv: string; count: number }> {
  const rows: string[] = [];
  for (const l of leads.filter((x) => x.consent)) {
    const rawEmail = (l.email ?? "").trim().toLowerCase();
    const email = /^\S+@\S+\.\S+$/.test(rawEmail) ? rawEmail : "";
    const digits = e164Digits(l.phone ?? "");
    if (!email && !digits) continue;
    const phone = digits ? (platform === "google" ? `+${digits}` : digits) : "";
    rows.push([email ? await sha256Hex(email) : "", phone ? await sha256Hex(phone) : ""].join(","));
  }
  return { csv: [platform === "google" ? "Email,Phone" : "email,phone", ...rows].join("\n") + "\n", count: rows.length };
}

// ---- Lead import from a spreadsheet (CSV).

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  const src = text.replace(/^﻿/, "");
  const semi = !src.includes(","); // files saved with ";" as the separator (common in some Excel locales)
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || (semi && ch === ";")) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ["name", "full name", "fullname", "contact", "contact name", "customer", "customer name", "first name"],
  company: ["company", "business", "organisation", "organization", "business name", "company name"],
  role: ["role", "title", "job title", "position"],
  email: ["email", "e-mail", "email address", "mail"],
  phone: ["phone", "mobile", "phone number", "whatsapp", "tel", "telephone", "cell", "number"],
  stage: ["stage", "status"],
  source: ["source", "channel", "lead source", "where from"],
  value: ["value", "amount", "deal value", "deal", "worth"],
  score: ["score"],
  consent: ["consent", "opt in", "opt-in", "optin", "marketing consent", "agreed"],
  tags: ["tags", "tag", "labels", "label", "group", "groups"],
  notes: ["notes", "note", "comment", "comments"],
};

export interface ImportResult { leads: Omit<Lead, "id">[]; skipped: number; duplicates: number; columns: string[] }

export function leadsFromCsv(text: string, existing: Lead[], today = new Date().toISOString().slice(0, 10)): ImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { leads: [], skipped: 0, duplicates: 0, columns: [] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col: Record<string, number> = {};
  for (const [field, names] of Object.entries(COLUMN_ALIASES)) { const i = header.findIndex((h) => names.includes(h)); if (i >= 0) col[field] = i; }
  const get = (r: string[], f: string) => (col[f] === undefined ? "" : (r[col[f]] ?? "").trim());
  const key = (email: string, phone: string) => [email.toLowerCase(), e164Digits(phone) ?? ""].filter(Boolean);
  const seen = new Set(existing.flatMap((l) => key(l.email ?? "", l.phone ?? "")));
  const stages = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const out: Omit<Lead, "id">[] = [];
  let skipped = 0, duplicates = 0;
  for (const r of rows.slice(1, 2001)) {
    const name = get(r, "name").slice(0, 120), company = get(r, "company").slice(0, 120);
    const email = get(r, "email").slice(0, 160), phone = get(r, "phone").slice(0, 30);
    if (!name && !company && !email && !phone) { skipped++; continue; }
    const keys = key(/^\S+@\S+\.\S+$/.test(email) ? email : "", phone);
    if (keys.some((k) => seen.has(k))) { duplicates++; continue; }
    keys.forEach((k) => seen.add(k));
    const stage = get(r, "stage").toLowerCase();
    const num = (f: string, max: number) => Math.max(0, Math.min(max, Math.round(Number(get(r, f).replace(/[^\d.]/g, "")) || 0)));
    out.push({
      name, company, role: get(r, "role").slice(0, 80), email: /^\S+@\S+\.\S+$/.test(email) ? email : "", phone, social: "",
      source: get(r, "source").slice(0, 60) || "Imported", stage: (stages.includes(stage) ? stage : "new") as Lead["stage"],
      score: col.score === undefined ? 50 : num("score", 100), value: num("value", 1_000_000_000), lastTouch: today, notes: get(r, "notes").slice(0, 1000),
      tags: [...new Set(get(r, "tags").split(/[;|]/).map(cleanTag).filter(Boolean))].slice(0, 10),
      verified: true, consent: /^(yes|y|true|1|agreed|opted in)$/i.test(get(r, "consent")),
    });
  }
  return { leads: out, skipped, duplicates, columns: Object.keys(col) };
}
