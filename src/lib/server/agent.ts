import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { PERSONA, clientContext } from "@/lib/agent/prompt";
import { CLIENT_TOOLS, STATUS_LABEL, runTool } from "@/lib/agent/tools";
import type { Plan, Tokens } from "@/lib/plans";
import type { AgentEvent, Proposal, Workspace } from "@/lib/types";

const MAX_STEPS = 14;

export interface AgentRun {
  appended: Anthropic.Beta.BetaMessageParam[]; // assistant/tool turns produced this run
  proposals: Proposal[];
  tokens: Tokens;
  completed: boolean; // finished normally (counts toward the brief quota)
  refused: boolean;
}

// Model-specific request settings. Haiku 5.5 has no server-side refusal
// fallback, so it doesn't get the fallback beta.
export function modelSettings(model: Plan["model"]) {
  const base = { model, thinking: { type: "adaptive" as const }, output_config: { effort: "medium" as const } };
  if (model === "claude-haiku-5-5") return base;
  return { ...base, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };
}

export async function runAgent(opts: {
  model: Plan["model"];
  ws: Workspace;
  history: Anthropic.Beta.BetaMessageParam[]; // includes the new user turn last
  searchesLeft: number;
  signal: AbortSignal;
  emit: (ev: AgentEvent) => void;
}): Promise<AgentRun> {
  const client = new Anthropic();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const messages = [...opts.history];
  const run: AgentRun = { appended: [], proposals: [], tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0 }, completed: false, refused: false };
  const push = (m: Anthropic.Beta.BetaMessageParam) => { messages.push(m); run.appended.push(m); };

  const tools: Anthropic.Beta.BetaToolUnion[] = [...(CLIENT_TOOLS as unknown as Anthropic.Beta.BetaToolUnion[])];
  if (opts.searchesLeft > 0) {
    tools.push({
      // No user_location: the web search tool rejects country code KE. The client context already
      // tells EMMA the business's location, so she adds it to queries herself.
      type: "web_search_20260209", name: "web_search", max_uses: Math.min(5, opts.searchesLeft),
    } as Anthropic.Beta.BetaToolUnion);
  }

  let jsonRetries = 0;
  for (let step = 0; step < MAX_STEPS; step++) {
    const turn = client.beta.messages.stream(
      {
        ...modelSettings(opts.model),
        max_tokens: 32000,
        cache_control: { type: "ephemeral" },
        system: [
          { type: "text", text: PERSONA, cache_control: { type: "ephemeral" } },
          { type: "text", text: clientContext(opts.ws.profile, today) + (opts.searchesLeft > 0 ? "" : "\n\nWeb research isn't available on this plan; work from the workspace and say so if a brief needs fresh research.") },
        ],
        tools,
        messages,
      },
      { signal: opts.signal },
    );

    for await (const ev of turn) {
      if (ev.type === "content_block_start") {
        const b = ev.content_block;
        if (b.type === "tool_use") opts.emit({ type: "status", label: STATUS_LABEL[b.name] ?? "Working" });
        else if (b.type === "server_tool_use") opts.emit({ type: "status", label: "Searching the web" });
        else if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
          for (const r of b.content.slice(0, 3)) if (r.type === "web_search_result") opts.emit({ type: "source", title: r.title, url: r.url });
        }
      } else if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        opts.emit({ type: "text", text: ev.delta.text });
      }
    }

    let msg: Anthropic.Beta.BetaMessage;
    try {
      msg = await turn.finalMessage();
      jsonRetries = 0;
    } catch (err) {
      // Eager input streaming: unparseable tool JSON rejects here. Re-issue;
      // API errors propagate to the caller.
      if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err;
      continue;
    }
    run.tokens.input += msg.usage.input_tokens ?? 0;
    run.tokens.output += msg.usage.output_tokens ?? 0;
    run.tokens.cacheRead += msg.usage.cache_read_input_tokens ?? 0;
    run.tokens.cacheWrite += msg.usage.cache_creation_input_tokens ?? 0;
    run.tokens.searches += msg.usage.server_tool_use?.web_search_requests ?? 0;

    push({ role: "assistant", content: msg.content as Anthropic.Beta.BetaContentBlockParam[] });

    if (msg.stop_reason === "refusal") {
      run.refused = true;
      opts.emit({ type: "error", message: "EMMA can't help with that request. Try rephrasing it as a marketing brief." });
      return run;
    }
    if (msg.stop_reason === "pause_turn") continue;

    const toolUses = msg.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) {
      run.completed = true;
      return run;
    }

    const truncated = msg.stop_reason === "max_tokens";
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((t) => {
      if (truncated) return { type: "tool_result", tool_use_id: t.id, is_error: true, content: "Your tool input was cut off by the output limit. Split the work into smaller calls." };
      const out = runTool(t.name, t.input, opts.ws);
      if (out.proposal) {
        run.proposals.push(out.proposal);
        opts.emit({ type: "proposal", proposal: out.proposal });
      }
      return { type: "tool_result", tool_use_id: t.id, content: out.result, ...(out.isError ? { is_error: true } : {}) };
    });
    push({ role: "user", content: results });
  }
  // Ran out of steps: the history ends on tool results, which stays valid.
  opts.emit({ type: "text", text: "\n\nI've hit my step limit for one brief. Say \"continue\" and I'll pick up where I left off." });
  run.completed = true;
  return run;
}

export function describeAgentError(err: unknown): string {
  if (err instanceof Anthropic.RateLimitError) return "EMMA is busy right now. Give it a minute and try again.";
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the AI service. Check the connection and try again.";
  if (err instanceof Error && err.name === "AbortError") return "Stopped.";
  console.error("[emma] agent error", err instanceof Error ? `${err.name}: ${err.message}` : err);
  return "Something went wrong on our side. Try again in a moment.";
}
