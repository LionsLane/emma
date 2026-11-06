// Validate an imported workspace file before it replaces anything.
import { z } from "zod";
import type { Workspace } from "./types";

const arr = z.array(z.record(z.string(), z.unknown())).max(20_000);
const Schema = z.object({
  profile: z.object({
    name: z.string().min(1).max(120),
    brand: z.object({ palette: z.object({ primary: z.string(), accent: z.string(), aiFrom: z.string(), aiTo: z.string() }).passthrough() }).passthrough(),
  }).passthrough(),
  calendar: arr, campaigns: arr, leads: arr, emails: arr, library: arr, tasks: arr, compliance: arr,
  history: arr.optional(), activity: arr.optional(), juries: arr.optional(), usage: arr.optional(),
}).passthrough();

export const MAX_IMPORT_BYTES = 3_000_000;

export function parseWorkspaceImport(text: string): { ok: true; ws: Workspace } | { ok: false; error: string } {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: "That file is too large to import." };
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return { ok: false, error: "That isn't a valid workspace file." }; }
  const r = Schema.safeParse(raw);
  if (!r.success) return { ok: false, error: "That file isn't an EMMA workspace export." };
  const hex = /^#[0-9a-f]{6}$/i;
  const pal = r.data.profile.brand.palette;
  if (![pal.primary, pal.accent, pal.aiFrom, pal.aiTo].every((c) => hex.test(c))) return { ok: false, error: "The file's colour palette is invalid." };
  return { ok: true, ws: r.data as unknown as Workspace };
}
