// The nine jurors. Each judges the pitch alone, from one seat, so nobody
// anchors on anybody else. "Not guilty" means the pitch survives that seat.

import type { JurorRole, JurorVerdict, UsageTotals } from "./types";

export interface Juror {
  role: JurorRole;
  name: string;
  pass: string; // what a not-guilty vote means from this seat
  lens: string; // the brief the juror is given
}

export const JURORS: Juror[] = [
  {
    role: "customer", name: "First customer", pass: "Would pay for it today",
    lens: "You are the exact buyer this pitch targets, with a real budget and real alternatives. Would you pay for this today, at this price? Judge clarity of the offer, relevance to your situation, price and risk.",
  },
  {
    role: "skeptic", name: "The skeptic", pass: "Would switch from what they use now",
    lens: "You are a price-sensitive buyer who has seen every pitch. You already use something free or cheap that sort of does this. Would you switch? Name the alternative you'd compare against.",
  },
  {
    role: "engineer", name: "The engineer", pass: "It can be delivered as promised",
    lens: "You are the engineer or operator who has to deliver every promise in this pitch. Flag any claim that overstates what can be built or delivered, at this price, reliably.",
  },
  {
    role: "lawyer", name: "The lawyer", pass: "Nothing here gets them fined or sued",
    lens: "You are a commercial lawyer in the pitcher's market. Look for regulatory exposure (consumer protection, data protection, advertising claims, sector licensing), unenforceable guarantees and contract risk.",
  },
  {
    role: "competitor", name: "The competitor", pass: "Can't easily copy or undercut it",
    lens: "You are the strongest existing competitor or substitute. How would you copy, undercut or bundle this? Only vote not guilty if the pitch shows a wedge you can't cheaply match.",
  },
  {
    role: "investor", name: "The investor", pass: "Would back it",
    lens: "You are an investor or owner deciding whether to put money behind this. Judge market, unit economics (price versus cost to serve), distribution and defensibility.",
  },
  {
    role: "marketer", name: "The marketer", pass: "Knows exactly how to sell it",
    lens: "You are a growth marketer who has to sell this. Can a stranger understand who it's for, what it does and why now in five seconds? Is there a channel that reaches buyers affordably?",
  },
  {
    role: "partner", name: "The partner", pass: "Would put their name on it",
    lens: "You are a channel partner, referrer or reseller whose reputation is on the line if you recommend this. Would you put your name on it?",
  },
  {
    role: "cfo", name: "The CFO", pass: "Would sign the invoice",
    lens: "You are the person who approves the spend. Is the price justified by a measurable return? Is the downside capped? Would you sign the invoice?",
  },
];

export const jurorByRole = Object.fromEntries(JURORS.map((j) => [j.role, j])) as Record<JurorRole, Juror>;

export function tally(verdicts: JurorVerdict[]) {
  const counted = verdicts.filter((v) => !v.error);
  const notGuilty = counted.filter((v) => v.verdict === "not_guilty").length;
  return { notGuilty, guilty: counted.length - notGuilty, total: counted.length };
}

export function verdictLine(notGuilty: number, total: number): string {
  if (total === 0) return "Awaiting the jury";
  if (notGuilty === total && total === JURORS.length) return "Acquitted. Ship it.";
  if (notGuilty >= total - 2) return "Close. Win over the holdouts.";
  if (notGuilty * 2 > total) return "Split jury. The objections are the brief.";
  return "Guilty. Back to the drawing board.";
}

// Opus 5.5 list prices (USD per million tokens; web search per request). An
// estimate only: a fallback model may serve some requests at its own rates.
const RATES = { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5, search: 0.01 };

export function usageCostUSD(u: UsageTotals): number {
  return (
    (u.input * RATES.input + u.output * RATES.output + u.cacheRead * RATES.cacheRead + u.cacheWrite * RATES.cacheWrite) / 1_000_000 +
    u.searches * RATES.search
  );
}

export const emptyUsage = (): UsageTotals => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0, requests: 0 });
