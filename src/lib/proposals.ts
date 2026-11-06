// Applying an approved proposal to the workspace. Pure, so the server (cloud
// mode) and the browser (demo mode) behave identically.

import type { Asset, CalendarEntry, Campaign, EmailItem, Lead, ProposalKind, Task, Workspace } from "./types";

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export function applyProposal(ws: Workspace, kind: ProposalKind, rawItems: unknown[], leadsCap = Number.POSITIVE_INFINITY): { ws: Workspace; added: number; skipped: number } {
  const items = rawItems.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null);
  const withIds = <T,>(prefix: string, list = items) => list.map((it) => ({ ...it, id: rid(prefix) }) as unknown as T);
  switch (kind) {
    case "calendar":
      return { ws: { ...ws, calendar: [...ws.calendar, ...withIds<CalendarEntry>("c")].sort((a, b) => a.date.localeCompare(b.date)) }, added: items.length, skipped: 0 };
    case "campaign":
      return { ws: { ...ws, campaigns: [...withIds<Campaign>("cmp"), ...ws.campaigns] }, added: items.length, skipped: 0 };
    case "leads": {
      const room = Math.max(0, leadsCap - ws.leads.length);
      const take = items.slice(0, room);
      return { ws: { ...ws, leads: [...withIds<Lead>("l", take), ...ws.leads] }, added: take.length, skipped: items.length - take.length };
    }
    case "email":
      return { ws: { ...ws, emails: [...withIds<EmailItem>("e"), ...ws.emails] }, added: items.length, skipped: 0 };
    case "tasks":
      return { ws: { ...ws, tasks: [...withIds<Task>("t"), ...ws.tasks] }, added: items.length, skipped: 0 };
    case "asset":
      return { ws: { ...ws, library: [...withIds<Asset>("a"), ...ws.library] }, added: items.length, skipped: 0 };
  }
}

export const KIND_LABEL: Record<ProposalKind, string> = {
  calendar: "calendar entries", campaign: "campaign", leads: "leads", email: "email", tasks: "tasks", asset: "library items",
};
