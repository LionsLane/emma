// POST /api/emma — brief EMMA.
//
// Cloud mode (Supabase configured): the client sends only { workspaceId,
// conversationId?, text }. The server authenticates, loads the workspace and
// the conversation history itself, checks plan and quota, takes the
// one-run-at-a-time lock, runs the agent with the plan's model, and persists
// history, proposals, transcript and usage. Nothing the client sends about the
// workspace, the history, the model or the plan is trusted.
//
// Demo mode (no Supabase, never in production): browser-only workspace, with
// strict validation of what the browser sends.

import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { pushPart, type ChatMessage, type ChatPart } from "@/lib/chat";
import { PLANS } from "@/lib/plans";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { describeAgentError, runAgent } from "@/lib/server/agent";
import { fail, readJson } from "@/lib/server/http";
import { acquireRun, quotaRefusal, recordUsage, releaseRun, resolvePlan, usageThisMonth } from "@/lib/server/quota";
import { isWithinAllowance, loadWorkspace } from "@/lib/server/workspace";
import type { AgentEvent, Workspace } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const NDJSON = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" };

const CloudBody = z.object({
  workspaceId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  text: z.string().trim().min(1).max(4000),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return fail(503, "EMMA isn't connected yet. The server needs an Anthropic API key.");
  return CLOUD ? cloud(req) : demo(req);
}

async function cloud(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const raw = await readJson(req, 16_000);
  if (isResponse(raw)) return raw;
  const parsed = CloudBody.safeParse(raw);
  if (!parsed.success) return fail(400, "Write a brief (up to 4,000 characters).");
  const { workspaceId, conversationId, text } = parsed.data;

  const admin = supabaseAdmin();
  const ws = await loadWorkspace(user.db, user.id, workspaceId);
  if (!ws) return fail(404, "Workspace not found.");
  if (ws.role === "viewer") return fail(403, "Viewers can read but not brief EMMA. Ask the owner for editor access.");

  const state = await resolvePlan(admin, user.id);
  const usage = await usageThisMonth(admin, user.id);
  const refusal = quotaRefusal(state, usage, "brief");
  if (refusal) return fail(402, refusal, { upgrade: state.plan.id !== "max" });
  if (ws.ownerId === user.id && !(await isWithinAllowance(admin, user.id, ws.id, state.plan.workspaces))) {
    return fail(402, `Your ${state.plan.name} plan includes ${state.plan.workspaces} workspace${state.plan.workspaces === 1 ? "" : "s"}. This one is read-only until you upgrade.`, { upgrade: true });
  }

  // Conversation: existing (must belong to this workspace) or new.
  let convId = conversationId ?? null;
  let history: Anthropic.Beta.BetaMessageParam[] = [];
  let nextSeq = 0;
  let display: ChatMessage[] = [];
  if (convId) {
    const { data: conv } = await admin.from("conversations").select("id,workspace_id,display").eq("id", convId).maybeSingle();
    if (!conv || conv.workspace_id !== ws.id) return fail(404, "Conversation not found.");
    display = (conv.display as ChatMessage[]) ?? [];
    const { data: rows } = await admin.from("messages").select("seq,role,content").eq("conversation_id", convId).order("seq", { ascending: true });
    history = (rows ?? []).map((r) => ({ role: r.role, content: r.content }) as Anthropic.Beta.BetaMessageParam);
    nextSeq = rows?.length ? rows[rows.length - 1].seq + 1 : 0;
  }

  const runId = await acquireRun(admin, user.id, "brief");
  if (!runId) return fail(429, "EMMA is still working on your last brief. Give her a moment.");

  if (!convId) {
    const { data: conv, error } = await admin.from("conversations").insert({ workspace_id: ws.id, user_id: user.id, title: text.slice(0, 80) }).select("id").single();
    if (error || !conv) {
      await releaseRun(admin, runId);
      return fail(500, "Couldn't start a conversation. Try again.");
    }
    convId = conv.id as string;
  }

  const userTurn: Anthropic.Beta.BetaMessageParam = { role: "user", content: text };
  const now = () => new Date().toISOString();
  const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text }], at: now() };
  let emmaParts: ChatPart[] = [];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (ev: AgentEvent) => {
        if (ev.type === "text") emmaParts = pushPart(emmaParts, { type: "text", text: ev.text });
        else if (ev.type === "status") emmaParts = pushPart(emmaParts, { type: "status", label: ev.label });
        else if (ev.type === "source") emmaParts = pushPart(emmaParts, { type: "source", title: ev.title, url: ev.url });
        else if (ev.type === "proposal") emmaParts = pushPart(emmaParts, { type: "proposal", id: ev.proposal.id });
        else if (ev.type === "error") emmaParts = pushPart(emmaParts, { type: "error", message: ev.message });
        try { controller.enqueue(enc.encode(JSON.stringify(ev) + "\n")); } catch { /* client went away */ }
      };
      emit({ type: "conversation", id: convId! });

      let tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0 };
      let completed = false;
      try {
        const run = await runAgent({
          model: state.plan.model, ws: ws.data, history: [...history, userTurn],
          searchesLeft: Math.max(0, state.plan.searchesPerMonth - usage.searches), signal: req.signal, emit,
        });
        tokens = run.tokens;
        completed = run.completed && !run.refused;

        // Persist: history (append-only), proposals, transcript.
        const rows = [userTurn, ...run.appended].map((m, i) => ({ conversation_id: convId, seq: nextSeq + i, role: m.role, content: m.content }));
        const { error: mErr } = await admin.from("messages").insert(rows);
        if (mErr) console.error("[emma] messages insert failed", mErr.message);
        if (run.proposals.length) {
          const { error: pErr } = await admin.from("proposals").insert(run.proposals.map((p) => ({
            id: p.id, workspace_id: ws.id, conversation_id: convId, kind: p.kind, title: p.title.slice(0, 300),
            summary: p.summary.slice(0, 2000), review_note: p.reviewNote?.slice(0, 2000) ?? null, items: p.items,
          })));
          if (pErr) console.error("[emma] proposals insert failed", pErr.message);
        }
        emit({ type: "quota", briefsUsed: usage.briefs + (completed ? 1 : 0), briefsLimit: state.plan.briefsPerMonth, plan: state.plan.id });
        emit({ type: "done", messages: [] });
      } catch (err) {
        emit({ type: "error", message: describeAgentError(err) });
      } finally {
        const emmaMsg: ChatMessage = { id: crypto.randomUUID(), role: "emma", parts: emmaParts, at: now() };
        await admin.from("conversations").update({ display: [...display, userMsg, emmaMsg].slice(-200), updated_at: now() }).eq("id", convId);
        await recordUsage(admin, { userId: user.id, workspaceId: ws.id, kind: "brief", model: state.plan.model, completed, tokens });
        await releaseRun(admin, runId);
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });
  return new Response(stream, { headers: NDJSON });
}

// ---------------------------------------------------------------- demo mode

const Block = z.object({ type: z.string() }).passthrough();
const DemoBody = z.object({
  text: z.string().trim().min(1).max(4000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.union([z.string().max(20000), z.array(Block).max(60)]) })).max(80),
  workspace: z.object({ profile: z.object({ name: z.string() }).passthrough() }).passthrough(),
});

async function demo(req: Request) {
  // A browser-only demo must never be an open, credit-spending endpoint in production.
  if (process.env.NODE_ENV === "production") return fail(503, "Accounts aren't set up on this server yet.");
  const raw = await readJson(req, 600_000);
  if (isResponse(raw)) return raw;
  const parsed = DemoBody.safeParse(raw);
  if (!parsed.success) return fail(400, "Bad request.");
  const { text, history, workspace } = parsed.data;
  // Only plain user/assistant turns are accepted: no system-role messages can be smuggled in.
  const userTurn: Anthropic.Beta.BetaMessageParam = { role: "user", content: text };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (ev: AgentEvent) => { try { controller.enqueue(enc.encode(JSON.stringify(ev) + "\n")); } catch { /* gone */ } };
      try {
        const run = await runAgent({
          model: PLANS.max.model, ws: workspace as unknown as Workspace,
          history: [...(history as Anthropic.Beta.BetaMessageParam[]), userTurn], searchesLeft: 5, signal: req.signal, emit,
        });
        emit({ type: "usage", usage: { ...run.tokens, requests: 1 } });
        emit({ type: "done", messages: [userTurn, ...run.appended] });
      } catch (err) {
        emit({ type: "error", message: describeAgentError(err) });
      } finally {
        try { controller.close(); } catch { /* closed */ }
      }
    },
  });
  return new Response(stream, { headers: NDJSON });
}
