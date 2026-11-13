"use client";

// One store for the whole app, in two modes:
//  - cloud: signed-in user, workspace loaded from and saved to Supabase with
//    version checks; conversations, proposals and quotas live on the server.
//  - demo: no Supabase configured; the Jua Coffee demo lives in this browser.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { pushPart, type ChatMessage, type ChatPart } from "./chat";
import { applyProposal, KIND_LABEL } from "./proposals";
import { seedWorkspace, WORKSPACE_VERSION } from "./seed";
import { CLOUD } from "./supabase/env";
import { supabaseBrowser } from "./supabase/browser";
import type { AgentEvent, Automation, Broadcast, ClientProfile, JuryCase, Lead, JuryEvent, JuryRound, Proposal, SearchAudit, Segment, UsageTotals, VisibilityReport, Workspace } from "./types";
import type { Suggestion } from "./automations";
import { cleanTag } from "./audience";

export type { ChatMessage, ChatPart } from "./chat";

export interface JuryDraft { title: string; kind: string; context: string; pitch: string; audience: string; price: string }

export interface Account {
  user: { id: string; email: string | null; name: string; onboarded: boolean; staff: boolean };
  plan: { id: "free" | "pro" | "max" | "demo"; name: string; priceKES: number; model: string; periodEnd: string | null; provider: string };
  payments?: { mpesa: boolean; paystack: boolean; card: boolean };
  limits: { briefs: number; searches: number; jury: number; audits?: number; visibility?: number; workspaces: number; seats: number; leads: string };
  usage: { briefs: number; searches: number; jury: number; audits?: number; visibility?: number; costUSD: number };
  workspaces: { id: string; name: string; owner_id: string; updated_at: string }[];
}

export interface Toast { id: string; tone: "info" | "ok" | "warn" | "risk"; text: string }
export interface ConversationRow { id: string; title: string; updated_at: string }

type CollectionKey = "calendar" | "campaigns" | "leads" | "emails" | "library" | "tasks" | "compliance";
type SaveState = "idle" | "saving" | "saved" | "error";

interface EmmaState {
  mode: "cloud" | "demo";
  ready: boolean;
  account: Account | null;
  wsId: string | null;
  version: number;
  ws: Workspace;
  saveState: SaveState;

  chat: ChatMessage[];
  convId: string | null;
  conversations: ConversationRow[];
  apiHistory: unknown[]; // demo only: raw model turns, appended verbatim
  proposals: Record<string, Proposal>;
  busy: boolean;

  drawerOpen: boolean;
  paletteOpen: boolean;
  upgrade: { open: boolean; reason: string | null };
  toasts: Toast[];

  bootstrap: () => Promise<"ok" | "welcome" | "signin">;
  selectWorkspace: (id: string) => Promise<void>;
  refreshAccount: () => Promise<void>;
  signOut: () => Promise<void>;

  setDrawer: (open: boolean) => void;
  setPalette: (open: boolean) => void;
  openUpgrade: (reason?: string | null) => void;
  closeUpgrade: () => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;

  send: (text: string) => Promise<void>;
  newThread: () => void;
  openConversation: (id: string) => Promise<void>;
  approve: (id: string) => Promise<void>;
  discard: (id: string) => Promise<void>;

  updateProfile: (p: Partial<ClientProfile>) => void;
  patch: <K extends CollectionKey>(key: K, id: string, change: Partial<Workspace[K][number]>) => void;
  remove: (key: CollectionKey, id: string) => void;
  addActivity: (text: string, by: "emma" | "team") => void;
  saveAudit: (a: SearchAudit) => void;
  importLeads: (leads: Omit<Lead, "id">[]) => void;
  saveBroadcast: (b: Broadcast) => void;
  deleteBroadcast: (id: string) => void;
  markBroadcast: (id: string, leadId: string, state: "sent" | "skipped") => void;
  endBroadcast: (id: string) => void;
  saveSegment: (seg: Segment) => void;
  deleteSegment: (id: string) => void;
  saveAutomation: (a: Automation) => void;
  deleteAutomation: (id: string) => void;
  resolveSuggestion: (s: Suggestion, how: "approve" | "skip") => void;
  saveVisibility: (r: VisibilityReport) => void;
  resetWorkspace: () => void;
  importWorkspace: (ws: Workspace) => void;

  juryDraft: JuryDraft | null;
  juryBusy: string | null;
  setJuryDraft: (d: JuryDraft | null) => void;
  createCase: (c: Pick<JuryCase, "title" | "kind" | "context">) => string;
  updateCase: (id: string, change: Partial<Pick<JuryCase, "title" | "kind" | "context">>) => void;
  deleteCase: (id: string) => void;
  runRound: (caseId: string, round: Pick<JuryRound, "pitch" | "audience" | "price">) => Promise<string | null>;
  recordUsage: (u: UsageTotals) => void;
}

export const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

const DEMO_ACCOUNT: Account = {
  user: { id: "demo", email: null, name: "Demo", onboarded: true, staff: true },
  plan: { id: "demo", name: "Demo", priceKES: 0, model: "Claude Opus 5.5", periodEnd: null, provider: "none" },
  limits: { briefs: 999, searches: 999, jury: 99, workspaces: 1, seats: 1, leads: "Unlimited" },
  usage: { briefs: 0, searches: 0, jury: 0, costUSD: 0 },
  workspaces: [],
};

// Older documents may lack newer collections.
function normalise(ws: Workspace): Workspace {
  return { ...ws, juries: ws.juries ?? [], usage: ws.usage ?? [], activity: ws.activity ?? [], history: ws.history ?? [] };
}

async function readNdjson<T>(res: Response, onEvent: (ev: T) => void) {
  const reader = res.body!.getReader();
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
      if (line) onEvent(JSON.parse(line) as T);
    }
  }
}

async function postJson(url: string, body: unknown) {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let editSeq = 0;
let savedSeq = 0;
let saving: Promise<void> | null = null;

export const useEmma = create<EmmaState>()(
  persist(
    (set, get) => {
      // Every local edit goes through here. In cloud mode it schedules a save.
      const edit = (fn: (ws: Workspace) => Workspace) => {
        set((s) => ({ ws: fn(s.ws) }));
        if (get().mode === "cloud" && get().wsId) {
          editSeq += 1;
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = setTimeout(() => void flush(), 900);
        }
      };

      const flush = async (): Promise<void> => {
        if (saving) { await saving; }
        if (get().mode !== "cloud" || savedSeq === editSeq) return;
        const sb = supabaseBrowser();
        const { wsId, version, ws } = get();
        if (!sb || !wsId) return;
        const seqAtStart = editSeq;
        set({ saveState: "saving" });
        saving = (async () => {
          const { data, error } = await sb
            .from("workspaces")
            .update({ data: ws, name: (ws.profile.name || "Workspace").slice(0, 120), version: version + 1, updated_at: new Date().toISOString() })
            .eq("id", wsId).eq("version", version)
            .select("version").maybeSingle();
          if (error) {
            set({ saveState: "error" });
            get().toast("Couldn't save your last change. Check your connection.", "risk");
          } else if (!data) {
            // Someone else saved first: take theirs.
            await get().selectWorkspace(wsId);
            get().toast("This workspace was updated from another device. You're now seeing the latest.", "warn");
            savedSeq = editSeq;
          } else {
            set({ version: data.version, saveState: "saved" });
            savedSeq = seqAtStart;
          }
        })();
        await saving;
        saving = null;
        if (savedSeq !== editSeq) await flush();
      };

      return {
        mode: CLOUD ? "cloud" : "demo",
        ready: !CLOUD,
        account: CLOUD ? null : DEMO_ACCOUNT,
        wsId: null,
        version: 0,
        ws: seedWorkspace(),
        saveState: "idle",

        chat: [],
        convId: null,
        conversations: [],
        apiHistory: [],
        proposals: {},
        busy: false,

        drawerOpen: false,
        paletteOpen: false,
        upgrade: { open: false, reason: null },
        toasts: [],

        // ------------------------------------------------------------ session

        bootstrap: async () => {
          if (get().mode === "demo") { set({ ready: true }); return "ok"; }
          const res = await fetch("/api/account", { cache: "no-store" });
          if (res.status === 401) return "signin";
          if (!res.ok) { get().toast("Couldn't load your account. Refresh to try again.", "risk"); return "ok"; }
          const account = (await res.json()) as Account;
          set({ account });
          if (!account.workspaces.length) { set({ ready: true }); return "welcome"; }
          const remembered = get().wsId;
          const id = account.workspaces.some((w) => w.id === remembered) ? remembered! : account.workspaces[0].id;
          await get().selectWorkspace(id);
          return "ok";
        },

        selectWorkspace: async (id) => {
          const sb = supabaseBrowser();
          if (!sb) return;
          const [{ data: row }, { data: props }, { data: convs }] = await Promise.all([
            sb.from("workspaces").select("id,data,version").eq("id", id).maybeSingle(),
            sb.from("proposals").select("id,kind,title,summary,review_note,items,status").eq("workspace_id", id).order("created_at", { ascending: false }).limit(150),
            sb.from("conversations").select("id,title,updated_at").eq("workspace_id", id).order("updated_at", { ascending: false }).limit(30),
          ]);
          if (!row) { get().toast("That workspace isn't available.", "risk"); return; }
          const proposals: Record<string, Proposal> = {};
          for (const p of props ?? []) proposals[p.id] = { id: p.id, kind: p.kind, title: p.title, summary: p.summary, reviewNote: p.review_note ?? undefined, items: p.items, status: p.status };
          editSeq = savedSeq = 0;
          set({ wsId: row.id, version: row.version, ws: normalise(row.data as Workspace), proposals, conversations: convs ?? [], chat: [], convId: null, ready: true, saveState: "idle" });
          const latest = convs?.[0];
          if (latest) await get().openConversation(latest.id);
        },

        refreshAccount: async () => {
          if (get().mode === "demo") return;
          const res = await fetch("/api/account", { cache: "no-store" });
          if (res.ok) set({ account: (await res.json()) as Account });
        },

        signOut: async () => {
          await flush().catch(() => undefined);
          await supabaseBrowser()?.auth.signOut();
          set({ account: null, wsId: null, chat: [], convId: null, proposals: {}, conversations: [] });
          window.location.href = "/";
        },

        // ------------------------------------------------------------ UI

        setDrawer: (open) => set({ drawerOpen: open }),
        setPalette: (open) => set({ paletteOpen: open }),
        openUpgrade: (reason = null) => set({ upgrade: { open: true, reason } }),
        closeUpgrade: () => set({ upgrade: { open: false, reason: null } }),
        toast: (text, tone = "info") => {
          const id = uid("t");
          set((s) => ({ toasts: [...s.toasts.slice(-3), { id, tone, text }] }));
          setTimeout(() => get().dismissToast(id), tone === "risk" ? 8000 : 4500);
        },
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

        // ------------------------------------------------------------ EMMA

        newThread: () => set({ chat: [], apiHistory: [], convId: null }),

        openConversation: async (id) => {
          const sb = supabaseBrowser();
          if (!sb) return;
          const { data } = await sb.from("conversations").select("id,display").eq("id", id).maybeSingle();
          if (data) set({ convId: data.id, chat: (data.display as ChatMessage[]) ?? [] });
        },

        send: async (text) => {
          const trimmed = text.trim();
          if (!trimmed || get().busy) return;
          const now = new Date().toISOString();
          const userMsg: ChatMessage = { id: uid("m"), role: "user", parts: [{ type: "text", text: trimmed }], at: now };
          const emmaMsg: ChatMessage = { id: uid("m"), role: "emma", parts: [], at: now };
          set((s) => ({ busy: true, chat: [...s.chat, userMsg, emmaMsg] }));
          const add = (part: ChatPart) =>
            set((s) => ({ chat: s.chat.map((m) => (m.id === emmaMsg.id ? { ...m, parts: pushPart(m.parts, part) } : m)) }));

          try {
            const cloud = get().mode === "cloud";
            if (cloud) await flush(); // the server reads the saved workspace
            const res = cloud
              ? await postJson("/api/emma", { workspaceId: get().wsId, conversationId: get().convId ?? undefined, text: trimmed })
              : await postJson("/api/emma", { text: trimmed, history: get().apiHistory, workspace: get().ws });
            if (!res.ok || !res.body) {
              const err = (await res.json().catch(() => ({}))) as { error?: string; upgrade?: boolean };
              add({ type: "error", message: err.error ?? `Request failed (${res.status})` });
              if (res.status === 402 && err.upgrade) get().openUpgrade(err.error ?? null);
              return;
            }
            await readNdjson<AgentEvent>(res, (ev) => {
              if (ev.type === "text") add({ type: "text", text: ev.text });
              else if (ev.type === "status") add({ type: "status", label: ev.label });
              else if (ev.type === "source") add({ type: "source", title: ev.title, url: ev.url });
              else if (ev.type === "error") add({ type: "error", message: ev.message });
              else if (ev.type === "conversation") {
                const isNew = !get().conversations.some((c) => c.id === ev.id);
                set((s) => ({ convId: ev.id, conversations: isNew ? [{ id: ev.id, title: trimmed.slice(0, 80), updated_at: now }, ...s.conversations] : s.conversations }));
              } else if (ev.type === "proposal") {
                set((s) => ({ proposals: { ...s.proposals, [ev.proposal.id]: ev.proposal } }));
                add({ type: "proposal", id: ev.proposal.id });
              } else if (ev.type === "quota") {
                set((s) => (s.account ? { account: { ...s.account, usage: { ...s.account.usage, briefs: ev.briefsUsed } } } : {}));
              } else if (ev.type === "usage") get().recordUsage(ev.usage);
              else if (ev.type === "done" && !cloud) set((s) => ({ apiHistory: [...s.apiHistory, ...ev.messages] }));
            });
          } catch (e) {
            add({ type: "error", message: e instanceof Error && e.name !== "TypeError" ? e.message : "Connection lost. Try again." });
          } finally {
            set({ busy: false });
          }
        },

        approve: async (id) => {
          const p = get().proposals[id];
          if (!p || p.status !== "pending") return;
          if (get().mode === "demo") {
            const r = applyProposal(get().ws, p.kind, p.items);
            set({ ws: r.ws, proposals: { ...get().proposals, [id]: { ...p, status: "approved" } } });
            get().addActivity(`Approved: ${p.title} (${r.added} ${KIND_LABEL[p.kind]}).`, "team");
            get().toast(`Added ${r.added} ${KIND_LABEL[p.kind]}.`, "ok");
            return;
          }
          await flush();
          const res = await postJson(`/api/proposals/${id}`, { action: "approve" });
          const body = (await res.json().catch(() => ({}))) as { error?: string; data?: Workspace; version?: number; added?: number; skipped?: number };
          if (!res.ok) { get().toast(body.error ?? "Couldn't approve. Try again.", "risk"); return; }
          editSeq = savedSeq;
          set((s) => ({ ws: normalise(body.data!), version: body.version!, proposals: { ...s.proposals, [id]: { ...p, status: "approved" } } }));
          get().toast(`Added ${body.added} ${KIND_LABEL[p.kind]}${body.skipped ? `. ${body.skipped} skipped: you've reached your plan's lead limit` : ""}.`, body.skipped ? "warn" : "ok");
          if (body.skipped) get().openUpgrade(`You've reached the lead limit on your plan.`);
        },

        discard: async (id) => {
          const p = get().proposals[id];
          if (!p || p.status !== "pending") return;
          if (get().mode === "cloud") {
            const res = await postJson(`/api/proposals/${id}`, { action: "discard" });
            if (!res.ok) { get().toast("Couldn't discard. Try again.", "risk"); return; }
          }
          set((s) => ({ proposals: { ...s.proposals, [id]: { ...p, status: "discarded" } } }));
        },

        // ------------------------------------------------------------ workspace edits

        updateProfile: (p) => edit((ws) => ({ ...ws, profile: { ...ws.profile, ...p } })),
        saveAudit: (a) => edit((ws) => ({
          ...ws,
          audits: [a, ...(ws.audits ?? []).filter((x) => x.id !== a.id)].slice(0, 12),
          activity: [{ id: uid("ac"), at: a.at, by: "team" as const, text: `Site audit of ${a.finalUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}: ${a.scores.overall}/100` }, ...ws.activity].slice(0, 60),
        })),
        saveBroadcast: (b) => edit((ws) => ({
          ...ws,
          broadcasts: [b, ...(ws.broadcasts ?? []).filter((x) => x.id !== b.id)].slice(0, 30),
          activity: (ws.broadcasts ?? []).some((x) => x.id === b.id) ? ws.activity : [{ id: uid("ac"), at: new Date().toISOString(), by: "team" as const, text: `Broadcast "${b.name}" created for ${Object.keys(b.sends).length} people` }, ...ws.activity].slice(0, 60),
        })),
        deleteBroadcast: (id) => edit((ws) => ({ ...ws, broadcasts: (ws.broadcasts ?? []).filter((x) => x.id !== id) })),
        endBroadcast: (id) => edit((ws) => ({ ...ws, broadcasts: (ws.broadcasts ?? []).map((b) => (b.id === id ? { ...b, status: "done" as const } : b)) })),
        markBroadcast: (id, leadId, state) => edit((ws) => {
          const now = new Date().toISOString();
          const broadcasts = (ws.broadcasts ?? []).map((b) => {
            const cur = b.sends[leadId];
            if (b.id !== id || !cur || cur.state !== "queued") return b;
            const sends = { ...b.sends, [leadId]: { ...cur, state, at: now } };
            const left = Object.values(sends).some((x) => x.state === "queued");
            return { ...b, sends, status: left ? b.status : ("done" as const) };
          });
          // A sent message is a contact; a skip isn't.
          const leads = state === "sent" ? ws.leads.map((l) => (l.id === leadId ? { ...l, lastTouch: now.slice(0, 10) } : l)) : ws.leads;
          return { ...ws, broadcasts, leads };
        }),
        importLeads: (leads) => edit((ws) => ({
          ...ws,
          leads: [...leads.map((l) => ({ ...l, id: uid("ld") })), ...ws.leads],
          activity: [{ id: uid("ac"), at: new Date().toISOString(), by: "team" as const, text: `Imported ${leads.length} lead${leads.length === 1 ? "" : "s"} from a spreadsheet` }, ...ws.activity].slice(0, 60),
        })),
        saveSegment: (seg) => edit((ws) => ({ ...ws, segments: [seg, ...(ws.segments ?? []).filter((x) => x.id !== seg.id)].slice(0, 50) })),
        deleteSegment: (id) => edit((ws) => ({
          ...ws,
          segments: (ws.segments ?? []).filter((x) => x.id !== id),
          automations: (ws.automations ?? []).map((a) => (a.segmentId === id ? { ...a, segmentId: undefined } : a)),
        })),
        saveAutomation: (a) => edit((ws) => ({ ...ws, automations: [a, ...(ws.automations ?? []).filter((x) => x.id !== a.id)].slice(0, 50) })),
        deleteAutomation: (id) => edit((ws) => ({ ...ws, automations: (ws.automations ?? []).filter((x) => x.id !== id) })),
        resolveSuggestion: (sg, how) => edit((ws) => {
          const today = new Date().toISOString().slice(0, 10);
          const targetId = sg.target.kind === "lead" ? sg.target.lead.id : sg.target.keyDate.id;
          let next: Workspace = {
            ...ws,
            automations: (ws.automations ?? []).map((a) => (a.id === sg.automationId ? { ...a, fired: { ...a.fired, [targetId]: today } } : a)),
          };
          if (how === "skip") return next;
          const due = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
          const act = (text: string) => ({ id: uid("ac"), at: new Date().toISOString(), by: "team" as const, text });
          if (sg.action.kind === "task") {
            next = { ...next, tasks: [{ id: uid("tk"), title: sg.text.slice(0, 200), due, owner: "Team", done: false, area: "Automation" }, ...next.tasks], activity: [act(`Automation "${sg.automationName}": task added`), ...next.activity].slice(0, 60) };
          } else if (sg.target.kind === "lead") {
            const lead = sg.target.lead;
            const action = sg.action;
            if (action.kind === "tag") {
              const tag = cleanTag(action.tag);
              // Tagging isn't a contact, so the last-touch date stays as it was.
              next = {
                ...next,
                leads: next.leads.map((l) => (l.id === lead.id ? { ...l, tags: [...new Set([...(l.tags ?? []), tag])].slice(0, 10) } : l)),
                activity: [act(`Automation "${sg.automationName}": ${lead.name || lead.company} tagged "${tag}"`), ...next.activity].slice(0, 60),
              };
            } else {
              const stage = action.kind === "moveStage" ? action.stage : lead.stage === "new" ? "contacted" : lead.stage;
              next = {
                ...next,
                leads: next.leads.map((l) => (l.id === lead.id ? { ...l, stage, lastTouch: today } : l)),
                activity: [act(action.kind === "message" ? `Automation "${sg.automationName}": ${action.channel} message to ${lead.name}` : `Automation "${sg.automationName}": ${lead.name} moved to ${stage}`), ...next.activity].slice(0, 60),
              };
            }
          }
          return next;
        }),
        saveVisibility: (r) => edit((ws) => ({
          ...ws,
          visibility: [r, ...(ws.visibility ?? []).filter((x) => x.id !== r.id)].slice(0, 12),
          activity: [{ id: uid("ac"), at: r.at, by: "emma" as const, text: `AI-visibility check: ${r.business} found in ${r.share}% of AI searches` }, ...ws.activity].slice(0, 60),
        })),
        patch: (key, id, change) => edit((ws) => ({ ...ws, [key]: (ws[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...change } : x)) })),
        remove: (key, id) => edit((ws) => ({ ...ws, [key]: (ws[key] as { id: string }[]).filter((x) => x.id !== id) })),
        addActivity: (text, by) =>
          edit((ws) => ({ ...ws, activity: [{ id: uid("ac"), at: new Date().toISOString(), text, by }, ...ws.activity].slice(0, 60) })),
        resetWorkspace: () => set({ ws: seedWorkspace(), chat: [], apiHistory: [], proposals: {} }),
        importWorkspace: (ws) => {
          if (get().mode === "cloud") edit(() => normalise(ws));
          else set({ ws: normalise(ws), chat: [], apiHistory: [], proposals: {} });
        },

        // ------------------------------------------------------------ Pitch Jury

        juryDraft: null,
        juryBusy: null,
        setJuryDraft: (d) => set({ juryDraft: d }),
        createCase: (c) => {
          const id = uid("jury");
          edit((ws) => ({ ...ws, juries: [{ ...c, id, createdAt: new Date().toISOString(), rounds: [] }, ...ws.juries] }));
          return id;
        },
        updateCase: (id, change) => edit((ws) => ({ ...ws, juries: ws.juries.map((j) => (j.id === id ? { ...j, ...change } : j)) })),
        deleteCase: (id) => edit((ws) => ({ ...ws, juries: ws.juries.filter((j) => j.id !== id) })),

        recordUsage: (u) => {
          if (get().mode === "cloud") return; // the server meters cloud usage
          const month = new Date().toISOString().slice(0, 7);
          edit((ws) => {
            const usage = ws.usage ?? [];
            const cur = usage.find((m) => m.month === month) ?? { month, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0, requests: 0 };
            const next = { month, input: cur.input + u.input, output: cur.output + u.output, cacheRead: cur.cacheRead + u.cacheRead, cacheWrite: cur.cacheWrite + u.cacheWrite, searches: cur.searches + u.searches, requests: cur.requests + u.requests };
            return { ...ws, usage: [...usage.filter((m) => m.month !== month), next].sort((a, b) => a.month.localeCompare(b.month)) };
          });
        },

        runRound: async (caseId, round) => {
          const c = get().ws.juries.find((j) => j.id === caseId);
          if (!c || get().juryBusy) return "The jury is already sitting.";
          const roundId = uid("jr");
          const fresh: JuryRound = { id: roundId, at: new Date().toISOString(), ...round, verdicts: [] };
          const patchRound = (fn: (r: JuryRound) => JuryRound) =>
            set((s) => ({ ws: { ...s.ws, juries: s.ws.juries.map((j) => (j.id === caseId ? { ...j, rounds: j.rounds.map((r) => (r.id === roundId ? fn(r) : r)) } : j)) } }));
          let error: string | null = null;
          try {
            const res = await postJson("/api/jury", { case: { title: c.title, kind: c.kind, context: c.context }, round });
            if (!res.ok || !res.body) {
              const err = (await res.json().catch(() => ({}))) as { error?: string; upgrade?: boolean };
              if (res.status === 402 && err.upgrade) get().openUpgrade(err.error ?? null);
              return err.error ?? `Request failed (${res.status})`;
            }
            set((s) => ({ juryBusy: caseId, ws: { ...s.ws, juries: s.ws.juries.map((j) => (j.id === caseId ? { ...j, rounds: [...j.rounds, fresh] } : j)) } }));
            await readNdjson<JuryEvent>(res, (ev) => {
              if (ev.type === "juror") patchRound((r) => ({ ...r, verdicts: [...r.verdicts, ev.verdict] }));
              else if (ev.type === "foreperson") patchRound((r) => ({ ...r, summary: ev.summary, objections: ev.objections, revisedPitch: ev.revisedPitch, changes: ev.changes }));
              else if (ev.type === "usage") get().recordUsage(ev.usage);
              else if (ev.type === "error") error = ev.message;
            });
            const done = get().ws.juries.find((j) => j.id === caseId)?.rounds.find((r) => r.id === roundId);
            if (done) {
              const counted = done.verdicts.filter((v) => !v.error);
              get().addActivity(`Pitch Jury: "${c.title}" round ${c.rounds.length + 1} came back ${counted.filter((v) => v.verdict === "not_guilty").length} of ${counted.length} not guilty.`, "emma");
            }
          } catch (e) {
            error = e instanceof Error ? e.message : "Connection lost.";
          } finally {
            set({ juryBusy: null });
          }
          return error;
        },
      };
    },
    {
      name: CLOUD ? "emma-cloud" : "emma-demo",
      version: WORKSPACE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Cloud mode keeps only a UI preference in the browser; business data
      // stays in the database (and is cleared from memory on sign-out).
      partialize: (s) => (CLOUD ? { wsId: s.wsId } : { ws: s.ws, chat: s.chat, apiHistory: s.apiHistory, proposals: s.proposals }),
      migrate: (persisted, version) => {
        const p = persisted as Partial<EmmaState>;
        if (!CLOUD && version < WORKSPACE_VERSION) return { ...p, ws: seedWorkspace(), chat: [], apiHistory: [], proposals: {} } as EmmaState;
        if (p.ws) p.ws = normalise(p.ws);
        return p as EmmaState;
      },
    },
  ),
);

