// Plans: the single source of truth for price, model and limits.
// Tune the numbers from real usage (usage_events) — see docs/PRD.md §4.

export type PlanId = "free" | "pro" | "max";

export interface Plan {
  id: PlanId;
  name: string;
  priceKES: number; // per month
  model: "claude-haiku-5-5" | "claude-sonnet-5-5" | "claude-opus-5-5";
  modelLabel: string;
  briefsPerMonth: number;
  searchesPerMonth: number; // 0 = no web research
  juryPerMonth: number; // 0 = no Pitch Jury
  auditsPerMonth: number; // Search & AI site audits (no AI cost)
  visibilityPerMonth: number; // AI-visibility checks (AI + web search); 0 = not on this plan
  smartLinks: number; // tracked short links per workspace (no AI cost)
  workspaces: number;
  seats: number;
  leads: number; // Infinity = unlimited
  costCapUSD: number; // hard monthly AI-cost ceiling per user
  blurb: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free", name: "Free", priceKES: 0,
    model: "claude-haiku-5-5", modelLabel: "Claude Haiku 5.5",
    briefsPerMonth: 15, searchesPerMonth: 0, juryPerMonth: 0, auditsPerMonth: 5, visibilityPerMonth: 0, smartLinks: 10, workspaces: 1, seats: 1, leads: 50, costCapUSD: 0.15,
    blurb: "Try EMMA on your business. No card needed.",
    features: ["15 briefs a month", "Content calendar, leads, email and library", "5 website audits for Google and AI search", "10 smart links with QR codes", "Audiences, automations and broadcasts", "50 leads", "Approve everything before it goes out"],
  },
  pro: {
    id: "pro", name: "Pro", priceKES: 500,
    model: "claude-sonnet-5-5", modelLabel: "Claude Sonnet 5.5",
    briefsPerMonth: 30, searchesPerMonth: 15, juryPerMonth: 0, auditsPerMonth: 30, visibilityPerMonth: 4, smartLinks: 100, workspaces: 1, seats: 1, leads: 1000, costCapUSD: 1.9,
    blurb: "For owners who market every week.",
    features: ["30 briefs a month on a smarter model", "Web research: trends and prospects", "30 website audits, 4 AI-visibility checks", "100 smart links, A/B tests", "1,000 leads", "Campaign planning and ad copy"],
  },
  max: {
    id: "max", name: "Max", priceKES: 1500,
    model: "claude-opus-5-5", modelLabel: "Claude Opus 5.5",
    briefsPerMonth: 35, searchesPerMonth: 40, juryPerMonth: 4, auditsPerMonth: 100, visibilityPerMonth: 12, smartLinks: 1000, workspaces: 3, seats: 3, leads: Number.POSITIVE_INFINITY, costCapUSD: 5.8,
    blurb: "Our best thinking, for growing teams and multiple brands.",
    features: ["35 briefs a month on our best model", "40 web searches", "100 website audits, 12 AI-visibility checks", "1,000 smart links", "3 brands, 3 team seats", "Pitch Jury: test offers before you spend", "Unlimited leads"],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "max"];

// Token prices (USD per million) per model, plus web search per request.
// Haiku 5.5's rates double past 100K-token prompts; EMMA's prompts stay well under.
export const MODEL_RATES: Record<Plan["model"], { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
};
export const SEARCH_USD = 0.01;

export interface Tokens { input: number; output: number; cacheRead: number; cacheWrite: number; searches: number }

export function costUSD(model: string, t: Tokens): number {
  const r = MODEL_RATES[model as Plan["model"]] ?? MODEL_RATES["claude-opus-5-5"];
  return (t.input * r.input + t.output * r.output + t.cacheRead * r.cacheRead + t.cacheWrite * r.cacheWrite) / 1_000_000 + t.searches * SEARCH_USD;
}

export const formatKES = (n: number) => (n === 0 ? "KES 0" : `KES ${n.toLocaleString("en-KE")}`);
export const limitLabel = (n: number) => (Number.isFinite(n) ? n.toLocaleString("en-KE") : "Unlimited");
