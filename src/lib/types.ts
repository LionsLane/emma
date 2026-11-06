// EMMA's workspace model. Everything a client deployment needs lives in one
// Workspace object: the six client inputs (profile) plus the operating data
// each of the nine surfaces reads and writes.

export type Id = string;

export type Platform =
  | "LinkedIn"
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "X"
  | "WhatsApp"
  | "Email"
  | "Blog"
  | "YouTube"
  | "Google Business";

export type AdPlatform = "LinkedIn" | "Meta" | "Google" | "Display" | "TikTok";

export interface Offering {
  id: Id;
  name: string;
  kind: string; // product, service, course, package...
  price: number;
  description: string;
  // Catalog performance (the "thing you're marketing is always in the room")
  customers: number;
  rating: number; // 0-5
  repeatRate: number; // 0-1, completion rate for courses, repeat purchase otherwise
  revenue: number;
}

export interface Partner {
  id: Id;
  name: string;
  sector: string;
  contact: string;
  email: string;
  phone: string;
  social: string;
  website: string;
  relationship: string;
}

export interface KeyDate {
  id: Id;
  name: string;
  date: string; // ISO date
  kind: "launch" | "event" | "season" | "holiday" | "deadline";
  note: string;
}

export interface Palette {
  primary: string;
  accent: string;
  aiFrom: string;
  aiTo: string;
}

export interface ClientProfile {
  name: string;
  tagline: string;
  industry: string;
  location: string;
  currency: string;
  website: string;
  demo: boolean;
  // The six inputs that turn EMMA into a specific company's assistant
  sectors: string[];
  offerings: Offering[];
  partners: Partner[];
  keyDates: KeyDate[];
  brand: {
    voice: string;
    pillars: string[];
    doSay: string[];
    dontSay: string[];
    palette: Palette;
  };
  compliance: {
    regime: string;
    regulator: string;
    notes: string;
  };
}

export type EntryStatus = "idea" | "drafting" | "in review" | "scheduled" | "published";

export interface CalendarEntry {
  id: Id;
  date: string;
  sector: string;
  contentType: string;
  platform: Platform;
  angle: string;
  featuredBusiness: string;
  website: string;
  keyContact: string;
  email: string;
  phone: string;
  socialHandle: string;
  linkedOffering: string; // offering id or name
  objective: string;
  kpi: string;
  audienceSegment: string;
  contentMix: string;
  bestPractice: string;
  themePillar: string;
  owner: string;
  draftDue: string;
  reviewDate: string;
  publishDate: string;
  assetLink: string;
  repurposingPlan: string;
  campaign: string;
  status: EntryStatus;
  copy?: string;
}

export type CampaignStatus = "draft" | "active" | "paused" | "ended";

export interface Campaign {
  id: Id;
  name: string;
  platform: AdPlatform;
  status: CampaignStatus;
  objective: string;
  audience: string;
  offering: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate: string;
  headline?: string;
  body?: string;
}

export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Lead {
  id: Id;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  social: string;
  source: string;
  stage: LeadStage;
  score: number; // 0-100
  value: number;
  lastTouch: string;
  notes: string;
  sourceUrl?: string;
  verified: boolean; // false = researched by EMMA, contact details still need a human check
  consent: boolean; // has opted in to marketing contact
}

export interface EmailStep {
  delayDays: number;
  subject: string;
  body: string;
}

export interface EmailItem {
  id: Id;
  name: string;
  kind: "broadcast" | "automation";
  status: "draft" | "scheduled" | "sent" | "running" | "paused";
  audience: string;
  subject: string;
  body: string;
  steps: EmailStep[];
  scheduledFor: string;
  sent: number;
  opens: number;
  clicks: number;
}

export type AssetType = "image" | "video" | "document" | "presentation" | "design" | "copy" | "template";

export interface Asset {
  id: Id;
  title: string;
  type: AssetType;
  tags: string[];
  updated: string;
  downloads: number;
  owner: string;
  body?: string;
  platform?: string;
}

export interface Task {
  id: Id;
  title: string;
  due: string;
  owner: string;
  done: boolean;
  area: string;
}

export interface Activity {
  id: Id;
  at: string; // ISO datetime
  text: string;
  by: "emma" | "team";
}

export type CheckStatus = "ok" | "attention" | "risk";

export interface ComplianceCheck {
  id: Id;
  area: string;
  item: string;
  status: CheckStatus;
  note: string;
}

export interface MonthPoint {
  month: string; // YYYY-MM
  spend: number;
  revenue: number;
  leads: number;
}

// ---- Pitch Jury: nine independent jurors put a pitch on trial.

export type JurorRole = "customer" | "skeptic" | "engineer" | "lawyer" | "competitor" | "investor" | "marketer" | "partner" | "cfo";

export interface JurorVerdict {
  role: JurorRole;
  verdict: "not_guilty" | "guilty";
  headline: string; // one line, in the juror's own voice
  reasoning: string;
  fix: string; // what would flip (or strengthen) the vote
  confidence: "low" | "medium" | "high";
  error?: string;
}

export interface JuryRound {
  id: Id;
  at: string;
  pitch: string;
  audience: string;
  price: string;
  verdicts: JurorVerdict[];
  summary?: string;
  objections?: string[];
  revisedPitch?: string;
  changes?: string[];
}

export interface JuryCase {
  id: Id;
  title: string;
  kind: string; // product, offer, campaign, ad, startup idea
  context: string; // who is pitching, where, under which rules
  createdAt: string;
  example?: boolean;
  rounds: JuryRound[];
}

// ---- AI usage, so the cost to serve each client is measured, not guessed.

export interface UsageTotals {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  searches: number;
  requests: number;
}

export interface UsageMonth extends UsageTotals {
  month: string; // YYYY-MM
}

export interface Workspace {
  version: number;
  profile: ClientProfile;
  calendar: CalendarEntry[];
  campaigns: Campaign[];
  leads: Lead[];
  emails: EmailItem[];
  library: Asset[];
  tasks: Task[];
  activity: Activity[];
  compliance: ComplianceCheck[];
  history: MonthPoint[];
  juries: JuryCase[];
  usage: UsageMonth[];
}

// ---- Proposals: EMMA never writes straight into the workspace. She proposes,
// a human approves. (Contract rule 10: an accelerator, not an autopilot.)

export type ProposalKind = "calendar" | "campaign" | "leads" | "email" | "tasks" | "asset";

export interface Proposal {
  id: Id;
  kind: ProposalKind;
  title: string;
  summary: string;
  reviewNote?: string;
  items: unknown[];
  status: "pending" | "approved" | "discarded";
}

// ---- Wire protocol between /api/emma and the browser (NDJSON, one event per line)

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "status"; label: string }
  | { type: "proposal"; proposal: Proposal }
  | { type: "source"; title: string; url: string }
  | { type: "usage"; usage: UsageTotals }
  | { type: "conversation"; id: string }
  | { type: "quota"; briefsUsed: number; briefsLimit: number; plan: string }
  | { type: "done"; messages: unknown[] }
  | { type: "error"; message: string };

export type JuryEvent =
  | { type: "juror"; verdict: JurorVerdict }
  | { type: "foreperson"; summary: string; objections: string[]; revisedPitch: string; changes: string[] }
  | { type: "usage"; usage: UsageTotals }
  | { type: "done" }
  | { type: "error"; message: string };
