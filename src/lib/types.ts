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
  // Optional contact and search details (Search & AI uses them for schema, llms.txt and checks)
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  hours?: string; // e.g. "Mo-Fr 08:00-18:00, Sa 09:00-14:00"
  socials?: string[]; // profile URLs: Google Business Profile, Facebook, Instagram, TikTok, LinkedIn
  faqs?: { q: string; a: string }[];
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

// ---- Search & AI (SEO, AIO, GEO, AXO). Audits are measured facts about a public page;
// visibility reports record what AI search said, with its sources.

export type Pillar = "seo" | "aio" | "geo" | "axo";
export type AuditStatus = "pass" | "warn" | "fail";

export interface AuditCheck {
  id: string;
  pillar: Pillar;
  label: string;
  status: AuditStatus;
  detail: string; // what we measured
  fix?: string; // what to do about it
  weight: number; // 1 to 3
}

export interface AuditFacts {
  title: string;
  description: string;
  h1: string[];
  words: number;
  lang: string;
  schemaTypes: string[];
  images: number;
  imagesNoAlt: number;
  internalLinks: number;
  externalLinks: number;
  aiBots: Record<string, "allowed" | "blocked">;
  hasSitemap: boolean;
  hasLlms: boolean;
  https: boolean;
}

export interface SearchAudit {
  id: Id;
  url: string;
  finalUrl: string;
  at: string;
  status: number;
  ms: number;
  bytes: number;
  scores: Record<Pillar, number> & { overall: number };
  checks: AuditCheck[];
  facts: AuditFacts;
}

export interface VisibilityQuery {
  query: string;
  mentioned: boolean; // the business is named in the answer
  cited: boolean; // the business's own site is one of the sources
  competitors: string[];
  sources: { title: string; url: string }[];
  note: string;
}

export interface VisibilityReport {
  id: Id;
  at: string;
  business: string;
  queries: VisibilityQuery[];
  share: number; // 0 to 100: share of queries where the business is mentioned or cited
  summary: string;
}

// ---- Audiences and Automations. Segments filter leads; automations suggest actions for a person
// to approve (EMMA never sends on her own). Each automation remembers who it already covered.

export type SegmentField = "stage" | "source" | "score" | "value" | "consent" | "verified" | "lastTouchDays" | "text";
export type SegmentOp = "is" | "isNot" | "gte" | "lte" | "contains";
export interface SegmentRule { field: SegmentField; op: SegmentOp; value: string }
export interface Segment { id: Id; name: string; match: "all" | "any"; rules: SegmentRule[]; createdAt: string }

export type AutomationTrigger =
  | { kind: "newLead" }
  | { kind: "stageQuiet"; stage: LeadStage; days: number } // in this stage, no contact for N days
  | { kind: "hotLead"; score: number }
  | { kind: "keyDate"; daysBefore: number };
export type AutomationAction =
  | { kind: "message"; channel: "whatsapp" | "email" | "sms"; text: string }
  | { kind: "task"; title: string }
  | { kind: "moveStage"; stage: LeadStage };
export interface Automation {
  id: Id;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  action: AutomationAction;
  segmentId?: Id; // only leads in this audience
  cooldownDays: number; // frequency cap per lead (or per key date)
  fired: Record<string, string>; // lead or key-date id → ISO date last approved or skipped
  createdAt: string;
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
  audits?: SearchAudit[]; // newest first, last 12 kept
  visibility?: VisibilityReport[]; // newest first, last 12 kept
  segments?: Segment[];
  automations?: Automation[];
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
