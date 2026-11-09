// EMMA's tools. One read tool over the workspace snapshot the browser sends,
// and a set of propose_* tools that never write anything: they turn the
// model's output into Proposal cards the team approves in the UI.

import { z } from "zod";
import type { Proposal, Workspace } from "../types";

const s = z.string();
const opt = (d = "") => z.string().optional().default(d);

const reviewNote = z.string().optional().describe(
  "What a human must check before this goes out (claims, prices, dates, consent, legal). Omit if nothing needs checking.",
);

export const QueryInput = z.object({
  section: z.enum(["calendar", "campaigns", "leads", "emails", "library", "catalog", "partners", "tasks", "compliance", "history", "activity", "search", "overview"]),
  search: z.string().optional().describe("Optional case-insensitive text filter across all fields."),
  limit: z.number().int().min(1).max(60).optional(),
});

const CalendarItem = z.object({
  date: s.describe("Publish date, YYYY-MM-DD"),
  sector: s,
  contentType: s.describe("e.g. LinkedIn carousel, Reel, Case study blog, WhatsApp broadcast"),
  platform: z.enum(["LinkedIn", "Instagram", "Facebook", "TikTok", "X", "WhatsApp", "Email", "Blog", "YouTube", "Google Business"]),
  angle: s.describe("The specific hook or story, not a topic label"),
  featuredBusiness: opt(), website: opt(), keyContact: opt(), email: opt(), phone: opt(), socialHandle: opt(),
  linkedOffering: s.describe("Offering id from the client profile"),
  objective: s, kpi: s, audienceSegment: s,
  contentMix: opt("Inspire 50 / Educate 30 / Promote 20"),
  bestPractice: s.describe("One line of platform best practice for this format"),
  themePillar: s,
  owner: opt("Marketing lead"),
  draftDue: s.describe("YYYY-MM-DD, before reviewDate"),
  reviewDate: s.describe("YYYY-MM-DD, before publishDate"),
  publishDate: s.describe("YYYY-MM-DD, usually equal to date"),
  assetLink: opt(),
  repurposingPlan: s,
  campaign: opt(),
  copy: opt().describe("Draft post copy, ready for review"),
});

export const CalendarInput = z.object({
  title: s, summary: s, review_note: reviewNote,
  entries: z.array(CalendarItem).min(1).max(40),
});

const CampaignItem = z.object({
  name: s,
  platform: z.enum(["LinkedIn", "Meta", "Google", "Display", "TikTok"]),
  objective: s, audience: s.describe("Targeting in plain words"),
  offering: s.describe("Offering id"),
  budget: z.number().nonnegative().describe("Total budget in the client's currency"),
  startDate: s, endDate: s,
  headline: opt(), body: opt().describe("Primary ad copy"),
});

export const CampaignInput = z.object({
  title: s, summary: s, review_note: reviewNote,
  campaigns: z.array(CampaignItem).min(1).max(8),
});

const LeadItem = z.object({
  name: opt(), company: s, role: opt(),
  email: opt().describe("Only if found in a source. Never guess."),
  phone: opt().describe("Only if found in a source. Never guess."),
  social: opt(),
  source: opt("EMMA research"),
  value: z.number().nonnegative().optional().default(0).describe("Estimated deal value"),
  score: z.number().min(0).max(100).optional().default(40),
  notes: opt().describe("Why this business is worth contacting and the suggested first touch"),
  source_url: opt(),
});

export const LeadsInput = z.object({
  title: s, summary: s, review_note: reviewNote,
  leads: z.array(LeadItem).min(1).max(30),
});

export const EmailInput = z.object({
  title: s, summary: s, review_note: reviewNote,
  email: z.object({
    name: s,
    kind: z.enum(["broadcast", "automation"]),
    audience: s.describe("Must be an opted-in segment"),
    subject: s,
    body: opt().describe("Full body for a broadcast"),
    steps: z.array(z.object({ delayDays: z.number().int().min(0), subject: s, body: s })).optional().default([]),
    scheduledFor: opt().describe("YYYY-MM-DD for broadcasts"),
  }),
});

export const TasksInput = z.object({
  title: s, summary: s,
  tasks: z.array(z.object({ title: s, due: s.describe("YYYY-MM-DD"), owner: opt("Marketing lead"), area: opt("Marketing") })).min(1).max(30),
});

export const LibraryInput = z.object({
  title: s, summary: s, review_note: reviewNote,
  assets: z.array(z.object({ title: s, platform: opt(), tags: z.array(s).optional().default([]), body: s.describe("The finished copy") })).min(1).max(20),
});

function schema(zodSchema: z.ZodType): Record<string, unknown> {
  // io: "input" so fields with defaults stay optional for the model.
  const json = z.toJSONSchema(zodSchema, { io: "input" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

// eager_input_streaming streams large inputs (a 20-entry calendar) as they are
// generated; the server no longer validates them, so every input is parsed
// with the matching zod schema before use.
export const CLIENT_TOOLS = [
  {
    name: "query_workspace",
    description: "Read the client's workspace: calendar, campaigns (with spend and results), leads, emails, library, catalog (offerings with sales), partners, tasks, compliance checks, monthly history, recent activity, search (the latest website audit for SEO, AI Overviews, AI assistants and voice, plus AI-visibility checks), or an overview with counts. Use before planning or analysing.",
    input_schema: schema(QueryInput),
  },
  {
    name: "propose_calendar_entries",
    description: "Propose content calendar entries with the full dossier for each. Shown to the team as one card to approve. Use for any calendar, content plan or posting schedule.",
    input_schema: schema(CalendarInput),
    eager_input_streaming: true,
  },
  {
    name: "propose_campaign",
    description: "Propose one or more paid ad campaigns (LinkedIn, Meta, Google, Display, TikTok) with budget, dates, targeting and ad copy. Created as drafts after approval.",
    input_schema: schema(CampaignInput),
    eager_input_streaming: true,
  },
  {
    name: "propose_leads",
    description: "Propose new leads for the CRM, typically businesses found with web_search. Leads arrive unverified, without consent, at stage 'new'.",
    input_schema: schema(LeadsInput),
    eager_input_streaming: true,
  },
  {
    name: "propose_email",
    description: "Propose an email broadcast or an automated drip sequence (welcome, follow-up, re-engagement, reminders).",
    input_schema: schema(EmailInput),
    eager_input_streaming: true,
  },
  {
    name: "propose_tasks",
    description: "Propose tasks for the team with due dates and owners.",
    input_schema: schema(TasksInput),
  },
  {
    name: "save_to_library",
    description: "Save finished copy (blog drafts, captions, scripts, ad variations, repurposed content) to the content library.",
    input_schema: schema(LibraryInput),
    eager_input_streaming: true,
  },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  query_workspace: "Reading the workspace",
  propose_calendar_entries: "Building calendar entries",
  propose_campaign: "Drafting the campaign",
  propose_leads: "Compiling leads",
  propose_email: "Writing the email",
  propose_tasks: "Planning tasks",
  save_to_library: "Writing copy for the library",
};

// UUIDs so a proposal keeps the same id in the stream and in the database.
const pid = () => crypto.randomUUID();

export type ToolOutcome = { result: string; proposal?: Proposal; isError?: boolean };

export function runTool(name: string, input: unknown, ws: Workspace): ToolOutcome {
  const bad = (err: z.ZodError) => ({
    result: `Invalid input: ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}. Fix and call again.`,
    isError: true,
  });

  switch (name) {
    case "query_workspace": {
      const q = QueryInput.safeParse(input);
      if (!q.success) return bad(q.error);
      return { result: queryWorkspace(ws, q.data) };
    }
    case "propose_calendar_entries": {
      const q = CalendarInput.safeParse(input);
      if (!q.success) return bad(q.error);
      const items = q.data.entries.map((e) => ({ ...e, status: "drafting" as const }));
      return propose("calendar", q.data, items, `Proposed ${items.length} calendar entries.`);
    }
    case "propose_campaign": {
      const q = CampaignInput.safeParse(input);
      if (!q.success) return bad(q.error);
      const items = q.data.campaigns.map((c) => ({ ...c, status: "draft", spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }));
      return propose("campaign", q.data, items, `Proposed ${items.length} campaign(s) as drafts.`);
    }
    case "propose_leads": {
      const q = LeadsInput.safeParse(input);
      if (!q.success) return bad(q.error);
      const today = new Date().toISOString().slice(0, 10);
      const items = q.data.leads.map(({ source_url, ...l }) => ({
        ...l, sourceUrl: source_url, stage: "new", lastTouch: today, verified: false, consent: false,
      }));
      return propose("leads", q.data, items, `Proposed ${items.length} leads (unverified, no consent yet).`);
    }
    case "propose_email": {
      const q = EmailInput.safeParse(input);
      if (!q.success) return bad(q.error);
      const e = q.data.email;
      const item = { ...e, status: e.kind === "automation" ? "paused" : e.scheduledFor ? "scheduled" : "draft", sent: 0, opens: 0, clicks: 0 };
      return propose("email", q.data, [item], `Proposed the ${e.kind} "${e.name}".`);
    }
    case "propose_tasks": {
      const q = TasksInput.safeParse(input);
      if (!q.success) return bad(q.error);
      const items = q.data.tasks.map((t) => ({ ...t, done: false }));
      return propose("tasks", { ...q.data, review_note: undefined }, items, `Proposed ${items.length} tasks.`);
    }
    case "save_to_library": {
      const q = LibraryInput.safeParse(input);
      if (!q.success) return bad(q.error);
      const today = new Date().toISOString().slice(0, 10);
      const items = q.data.assets.map((a) => ({ ...a, type: "copy", updated: today, downloads: 0, owner: "EMMA" }));
      return propose("asset", q.data, items, `Proposed ${items.length} library item(s).`);
    }
    default:
      return { result: `Unknown tool ${name}.`, isError: true };
  }
}

function propose(
  kind: Proposal["kind"],
  data: { title: string; summary: string; review_note?: string },
  items: unknown[],
  ack: string,
): ToolOutcome {
  const proposal: Proposal = {
    id: pid(), kind, title: data.title, summary: data.summary, reviewNote: data.review_note, items, status: "pending",
  };
  return {
    proposal,
    result: `${ack} It is now on screen as a card for the team to approve or discard. Nothing is in the workspace until they approve.`,
  };
}

function queryWorkspace(ws: Workspace, q: z.infer<typeof QueryInput>): string {
  const limit = q.limit ?? 40;
  if (q.section === "overview") {
    return JSON.stringify({
      calendar: ws.calendar.length, campaigns: ws.campaigns.length, leads: ws.leads.length,
      emails: ws.emails.length, library: ws.library.length, openTasks: ws.tasks.filter((t) => !t.done).length,
      complianceIssues: ws.compliance.filter((c) => c.status !== "ok").map((c) => c.item),
      searchScore: ws.audits?.[0]?.scores.overall ?? null, aiVisibilityShare: ws.visibility?.[0]?.share ?? null,
    });
  }
  const source: unknown[] = {
    calendar: ws.calendar,
    campaigns: ws.campaigns,
    leads: ws.leads,
    emails: ws.emails,
    library: ws.library.map(({ body, ...a }) => ({ ...a, hasBody: Boolean(body) })),
    catalog: ws.profile.offerings,
    partners: ws.profile.partners,
    tasks: ws.tasks,
    compliance: ws.compliance,
    history: ws.history,
    activity: ws.activity,
    // Latest audit's open issues and scores, plus recent AI-visibility results (sources trimmed).
    search: [
      ...(ws.audits ?? []).slice(0, 2).map((a) => ({ kind: "audit", url: a.finalUrl, at: a.at, scores: a.scores, issues: a.checks.filter((c) => c.status !== "pass").map(({ pillar, label, status, detail, fix }) => ({ pillar, label, status, detail, fix })) })),
      ...(ws.visibility ?? []).slice(0, 2).map((v) => ({ kind: "visibility", at: v.at, share: v.share, summary: v.summary, queries: v.queries.map(({ query, mentioned, cited, competitors, note }) => ({ query, mentioned, cited, competitors, note })) })),
    ],
  }[q.section];
  const needle = q.search?.toLowerCase();
  const rows = needle ? source.filter((r) => JSON.stringify(r).toLowerCase().includes(needle)) : source;
  return JSON.stringify({ section: q.section, total: rows.length, rows: rows.slice(0, limit) });
}
