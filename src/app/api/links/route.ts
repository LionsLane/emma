// GET  /api/links?workspaceId=… → { links: LinkWithStats[], limit }
// POST /api/links { workspaceId, name, destination, channel?, utm?, abGroup?, variant? } → { link }
// Reads go through the user's RLS client (members only); creates need editor access and the
// plan's smartLinks allowance.
import { z } from "zod";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, json, readJson } from "@/lib/server/http";
import { CHANNELS, newCode } from "@/lib/server/links";
import { resolvePlan } from "@/lib/server/quota";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hostOf } from "@/lib/safe";

export const runtime = "nodejs";

const uuid = z.string().uuid();
const short = (n: number) => z.string().trim().max(n).optional().transform((v) => v || null);

const Create = z.object({
  workspaceId: uuid,
  name: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(4).max(2000),
  channel: z.enum(Object.keys(CHANNELS) as [keyof typeof CHANNELS, ...(keyof typeof CHANNELS)[]]).optional(),
  utm: z.object({ source: short(60), medium: short(60), campaign: short(80), content: short(80) }).optional(),
  abGroup: short(60),
});

function cleanDestination(raw: string): string | null {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password || !u.hostname.includes(".")) return null;
  const app = process.env.NEXT_PUBLIC_APP_URL ? hostOf(process.env.NEXT_PUBLIC_APP_URL) : "";
  if (app && u.hostname === app && u.pathname.startsWith("/l/")) return null; // no link-to-link loops
  return u.toString();
}

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const wsId = uuid.safeParse(new URL(req.url).searchParams.get("workspaceId"));
  if (!wsId.success) return fail(400, "Missing workspace.");

  const { data: links, error } = await user.db.from("smart_links")
    .select("code,name,destination,utm_source,utm_medium,utm_campaign,utm_content,ab_group,archived,created_at")
    .eq("workspace_id", wsId.data).order("created_at", { ascending: false }).limit(1000);
  if (error) return fail(500, "Couldn't load your links.");
  const codes = (links ?? []).map((l) => l.code);

  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const clicks: { code: string; at: string; visitor: string; referrer: string | null; device: string; country: string | null; is_bot: boolean }[] = [];
  for (let i = 0; i < codes.length; i += 200) {
    const { data } = await user.db.from("link_clicks").select("code,at,visitor,referrer,device,country,is_bot").in("code", codes.slice(i, i + 200)).gte("at", since).limit(20000);
    clicks.push(...(data ?? []));
  }

  const today = Date.now();
  const stats = new Map<string, { clicks: number; unique: number; bots: number; last7: number; daily: number[]; referrers: Record<string, number>; devices: Record<string, number>; countries: Record<string, number> }>();
  const seen = new Set<string>();
  for (const c of codes) stats.set(c, { clicks: 0, unique: 0, bots: 0, last7: 0, daily: Array(30).fill(0), referrers: {}, devices: {}, countries: {} });
  for (const k of clicks) {
    const s = stats.get(k.code)!;
    if (k.is_bot) { s.bots++; continue; }
    s.clicks++;
    const key = `${k.code}|${k.visitor}`;
    if (!seen.has(key)) { seen.add(key); s.unique++; }
    const age = Math.floor((today - new Date(k.at).getTime()) / 86_400_000);
    if (age < 7) s.last7++;
    if (age < 30) s.daily[29 - age]++;
    const r = k.referrer ?? "direct or app";
    s.referrers[r] = (s.referrers[r] ?? 0) + 1;
    s.devices[k.device] = (s.devices[k.device] ?? 0) + 1;
    if (k.country) s.countries[k.country] = (s.countries[k.country] ?? 0) + 1;
  }

  const state = await resolvePlan(supabaseAdmin(), user.id);
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
  return json(200, {
    limit: state.plan.smartLinks,
    base,
    links: (links ?? []).map((l) => ({ ...l, short: `${base}/l/${l.code}`, stats: stats.get(l.code) })),
  });
}

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (isResponse(user)) return user;
  const raw = await readJson(req, 6_000);
  if (isResponse(raw)) return raw;
  const body = Create.safeParse(raw);
  if (!body.success) return fail(400, "Give the link a name and a destination address.");
  const destination = cleanDestination(body.data.destination);
  if (!destination) return fail(400, "That destination isn't a valid web address.");

  const { data: role } = await user.db.from("workspace_members").select("role").eq("workspace_id", body.data.workspaceId).eq("user_id", user.id).maybeSingle();
  if (!role || role.role === "viewer") return fail(403, "Only owners and editors can create links.");

  const state = await resolvePlan(supabaseAdmin(), user.id);
  const { count } = await user.db.from("smart_links").select("code", { count: "exact", head: true }).eq("workspace_id", body.data.workspaceId).eq("archived", false);
  if ((count ?? 0) >= state.plan.smartLinks) return fail(402, `Your ${state.plan.name} plan includes ${state.plan.smartLinks} active links. Switch one off or upgrade.`, { upgrade: state.plan.id !== "max" });

  // Abuse brake: short links on our domain must not be mass-produced.
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count: recent } = await user.db.from("smart_links").select("code", { count: "exact", head: true }).eq("created_by", user.id).gte("created_at", hourAgo);
  if ((recent ?? 0) >= 20) return fail(429, "That's a lot of links in one hour. Try again later.");

  const preset = body.data.channel ? CHANNELS[body.data.channel] : null;
  const row = {
    workspace_id: body.data.workspaceId, created_by: user.id, name: body.data.name, destination,
    utm_source: body.data.utm?.source ?? preset?.source ?? null,
    utm_medium: body.data.utm?.medium ?? preset?.medium ?? null,
    utm_campaign: body.data.utm?.campaign ?? null,
    utm_content: body.data.utm?.content ?? null,
    ab_group: body.data.abGroup ?? null,
  };
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await user.db.from("smart_links").insert({ ...row, code: newCode() }).select("code,name,destination,utm_source,utm_medium,utm_campaign,utm_content,ab_group,archived,created_at").single();
    if (!error) return json(201, { link: data });
    if (error.code !== "23505") { console.error("[emma] link insert failed", error.message); return fail(500, "Couldn't create the link."); }
  }
  return fail(500, "Couldn't create the link. Try again.");
}
