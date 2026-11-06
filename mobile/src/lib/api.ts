// Calls the same API as the web app, authenticated with the user's access
// token (Bearer). The server verifies it and applies the same plan limits.
import { fetch as expoFetch } from "expo/fetch";
import { supabase } from "./supabase";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5180").replace(/\/$/, "");

async function token(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new Error("Please sign in again.");
  return t;
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await expoFetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${await token()}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

// Stream NDJSON events from /api/emma.
export async function streamBrief(body: { workspaceId: string; conversationId?: string; text: string }, onEvent: (ev: AgentEvent) => void) {
  const res = await expoFetch(`${API_URL}/api/emma`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) onEvent(JSON.parse(line) as AgentEvent);
    }
  }
}

export interface Proposal { id: string; kind: string; title: string; summary: string; reviewNote?: string; items: unknown[]; status: "pending" | "approved" | "discarded" }
export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "status"; label: string }
  | { type: "source"; title: string; url: string }
  | { type: "proposal"; proposal: Proposal }
  | { type: "conversation"; id: string }
  | { type: "quota"; briefsUsed: number; briefsLimit: number; plan: string }
  | { type: "usage" }
  | { type: "done" }
  | { type: "error"; message: string };

export interface Account {
  user: { id: string; email: string | null; name: string };
  plan: { id: string; name: string; priceKES: number; model: string; periodEnd: string | null; provider: string };
  limits: { briefs: number; searches: number; jury: number; workspaces: number; seats: number; leads: string };
  usage: { briefs: number; searches: number; jury: number; costUSD: number };
  workspaces: { id: string; name: string }[];
}

// Only render http(s) links that came from the model or the web.
export function safeUrl(raw?: string): string | null {
  if (!raw) return null;
  try { const u = new URL(raw); return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null; } catch { return null; }
}
