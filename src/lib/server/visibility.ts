import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { modelSettings } from "./agent";
import type { Plan, Tokens } from "@/lib/plans";
import type { VisibilityQuery, VisibilityReport } from "@/lib/types";

// AI-visibility check: EMMA runs each query through web search the way a customer would, then
// reports which businesses an AI answer would name. "cited" is decided from the real search
// results (the business's own domain among the sources), never from the model's claim;
// "mentioned" requires the business name to appear in what the model reported.

export interface VisibilityInput { name: string; website: string; location: string; queries: string[] }

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();
const hostOf = (u: string) => { try { return new URL(/^https?:/i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };

export function defaultQueries(p: { name: string; industry: string; location: string; offerings: { name: string }[] }): string[] {
  const city = p.location.split(",")[0].trim() || "Kenya";
  const what = (p.industry || p.offerings[0]?.name || "business").toLowerCase();
  const out = [`best ${what} in ${city}`, p.offerings[0]?.name ? `${p.offerings[0].name} ${city}` : `${what} near me ${city}`, `${p.name} ${city} reviews`];
  return [...new Set(out.map((q) => q.replace(/\s+/g, " ").trim()))].slice(0, 3);
}

const PROMPT = (i: VisibilityInput) => `You are checking how visible a small business is in AI search, for its owner.

Business: ${i.name}
Website: ${i.website || "(none)"}
Location: ${i.location || "Kenya"}

For EACH query below, run exactly one web search using the query text as written (add nothing), as a customer in Kenya would.
Then report, from the search results only, which businesses a helpful AI answer would recommend, in order. Do not invent businesses. Include ${i.name} in "businesses" only if the results actually recommend it.

Rules for tips and the summary: only state what the search results show. Never claim ${i.name} lacks something (a Google Business Profile, reviews, a page, schema) just because it didn't appear in these results; it may exist but not rank. Phrase such advice as "make sure" or "strengthen", for example "make sure your Google Business Profile uses the exact name ${i.name}".

Queries:
${i.queries.map((q, n) => `${n + 1}. ${q}`).join("\n")}

After the searches, reply with ONLY one JSON object, no prose, in this exact shape:
{"queries":[{"query":"<the query>","businesses":["<business names in the order an answer would list them, max 8>"],"answer":"<one or two sentences a customer would read>","note":"<one short, practical tip for ${i.name} to appear for this query>"}],"summary":"<two sentences on ${i.name}'s overall AI visibility and the single most useful next step>"}`;

export async function runVisibility(input: VisibilityInput, model: Plan["model"], maxSearches: number, signal: AbortSignal): Promise<{ report: VisibilityReport; tokens: Tokens; completed: boolean }> {
  const client = new Anthropic();
  const tokens: Tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0 };
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: PROMPT(input) }];
  const searches = new Map<string, { title: string; url: string }[]>(); // search query → results
  const order: string[] = [];
  let finalText = "";

  for (let step = 0; step < 4; step++) {
    const msg = await client.beta.messages.create({
      ...modelSettings(model),
      max_tokens: 6000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: Math.max(1, Math.min(maxSearches, input.queries.length)) } as Anthropic.Beta.BetaToolUnion],
      messages,
    }, { signal });
    tokens.input += msg.usage.input_tokens ?? 0;
    tokens.output += msg.usage.output_tokens ?? 0;
    tokens.cacheRead += msg.usage.cache_read_input_tokens ?? 0;
    tokens.cacheWrite += msg.usage.cache_creation_input_tokens ?? 0;
    tokens.searches += msg.usage.server_tool_use?.web_search_requests ?? 0;

    const queryById = new Map<string, string>();
    for (const b of msg.content) {
      if (b.type === "server_tool_use" && b.name === "web_search") queryById.set(b.id, String((b.input as { query?: string })?.query ?? ""));
      if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        const q = queryById.get(b.tool_use_id) ?? "";
        const list = b.content.filter((r): r is Anthropic.Beta.BetaWebSearchResultBlock => r.type === "web_search_result").slice(0, 8).map((r) => ({ title: r.title, url: r.url }));
        searches.set(q, list);
        order.push(q);
      }
      if (b.type === "text") finalText += b.text;
    }
    if (msg.stop_reason === "refusal") throw new Error("refused");
    if (msg.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: msg.content as Anthropic.Beta.BetaContentBlockParam[] });
    finalText = "";
  }

  let parsed: { queries?: { query?: string; businesses?: string[]; answer?: string; note?: string }[]; summary?: string } = {};
  const m = finalText.match(/\{[\s\S]*\}/);
  if (m) { try { parsed = JSON.parse(m[0]); } catch { parsed = {}; } }

  const site = hostOf(input.website);
  const name = norm(input.name);
  // Same business if one name contains the other (ignoring very short names, which match too much).
  const same = (b: string) => { const x = norm(b); return x.length >= 3 && name.length >= 3 && (x.includes(name) || name.includes(x)); };
  const pickResults = (q: string, idx: number) => searches.get(q) ?? [...searches.entries()].find(([k]) => norm(k) === norm(q))?.[1] ?? searches.get(order[idx] ?? "") ?? [];

  const queries: VisibilityQuery[] = input.queries.map((q, idx) => {
    const r = parsed.queries?.find((x) => norm(x.query ?? "") === norm(q)) ?? parsed.queries?.[idx] ?? {};
    const sources = pickResults(q, idx);
    const businesses = (r.businesses ?? []).map(String).filter(Boolean).slice(0, 8);
    // Only the ranked list counts: the answer text may say "X doesn't appear", which names X without recommending it.
    const mentioned = businesses.some(same);
    const cited = Boolean(site) && sources.some((s) => hostOf(s.url) === site || hostOf(s.url).endsWith(`.${site}`));
    return {
      query: q, mentioned, cited,
      competitors: businesses.filter((b) => !same(b)).slice(0, 5),
      sources, note: String(r.note ?? "").slice(0, 300),
    };
  });
  const share = queries.length ? Math.round((queries.filter((q) => q.mentioned || q.cited).length / queries.length) * 100) : 0;
  const completed = Boolean(parsed.queries?.length);
  return {
    report: { id: randomUUID(), at: new Date().toISOString(), business: input.name, queries, share, summary: String(parsed.summary ?? (completed ? "" : "The check didn't finish. Try again.")).slice(0, 600) },
    tokens, completed,
  };
}
