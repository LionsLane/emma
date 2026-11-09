// POST /api/search/audit { url, business?: { name, location } } → SearchAudit
// Fetches one public page (plus robots.txt, sitemap.xml, llms.txt) through safeFetch and scores
// it for SEO, AIO, GEO and AXO. No AI is used, so it costs nothing; it counts against auditsPerMonth.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isResponse, requireUser } from "@/lib/server/auth";
import { fail, json, publicError, readJson } from "@/lib/server/http";
import { quotaRefusal, recordUsage, resolvePlan, usageThisMonth } from "@/lib/server/quota";
import { FetchBlocked, checkPublicUrl, safeFetch } from "@/lib/server/safefetch";
import { analysePage } from "@/lib/search/analyse";
import type { SearchAudit } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  url: z.string().min(3).max(500),
  business: z.object({ name: z.string().max(120).optional(), location: z.string().max(120).optional() }).optional(),
});

const ZERO = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0 };

async function probe(base: URL, path: string, test: (body: string) => boolean): Promise<{ ok: boolean; body: string | null }> {
  try {
    const r = await safeFetch(new URL(path, base).toString(), "text/plain,application/xml,text/xml,*/*;q=0.5");
    const ok = r.status === 200 && test(r.body);
    return { ok, body: r.status === 200 ? r.body : null };
  } catch { return { ok: false, body: null }; }
}

export async function POST(req: Request) {
  // Local demo (no accounts): allowed only outside production, so the fetcher is never an open proxy.
  let userId: string | null = null;
  if (CLOUD) {
    const user = await requireUser(req);
    if (isResponse(user)) return user;
    userId = user.id;
  } else if (process.env.NODE_ENV === "production") {
    return fail(503, "Accounts aren't set up on this server yet.");
  }

  const raw = await readJson(req, 4_000);
  if (isResponse(raw)) return raw;
  const body = Body.safeParse(raw);
  if (!body.success) return fail(400, "Enter your website address, like mybusiness.co.ke.");

  let target: URL;
  try { target = checkPublicUrl(body.data.url); } catch (e) { return fail(400, e instanceof FetchBlocked ? e.message : "That doesn't look like a web address."); }

  const admin = userId ? supabaseAdmin() : null;
  if (admin && userId) {
    const refusal = quotaRefusal(await resolvePlan(admin, userId), await usageThisMonth(admin, userId), "audit");
    if (refusal) return fail(429, refusal, { upgrade: true });
  }

  try {
    const page = await safeFetch(target);
    const final = new URL(page.url);
    const origin = new URL(final.origin);
    const [robots, sitemap, llms] = await Promise.all([
      probe(origin, "/robots.txt", (b) => !/<html/i.test(b.slice(0, 500))),
      probe(origin, "/sitemap.xml", (b) => /<(urlset|sitemapindex)\b/i.test(b)),
      probe(origin, "/llms.txt", (b) => b.trim().length > 20 && !/<html/i.test(b.slice(0, 500))),
    ]);
    // A sitemap listed in robots.txt counts too.
    let sitemapOk = sitemap.ok;
    const listed = robots.body?.match(/^\s*sitemap:\s*(\S+)/im)?.[1];
    if (!sitemapOk && listed) sitemapOk = (await probe(origin, listed, (b) => /<(urlset|sitemapindex)\b/i.test(b))).ok;

    const { checks, facts, scores } = analysePage({
      url: page.url, status: page.status, ms: page.ms, bytes: page.bytes, html: page.body,
      robots: robots.ok ? robots.body : null, sitemapOk, llmsOk: llms.ok, business: body.data.business,
    });
    const audit: SearchAudit = { id: randomUUID(), url: target.toString(), finalUrl: page.url, at: new Date().toISOString(), status: page.status, ms: page.ms, bytes: page.bytes, scores, checks, facts };
    if (admin && userId) await recordUsage(admin, { userId, workspaceId: null, kind: "audit", model: "none", completed: true, tokens: ZERO });
    return json(200, audit);
  } catch (err) {
    if (err instanceof FetchBlocked) return fail(400, err.message);
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") return fail(400, "We couldn't find that website. Check the spelling.");
    if ((err as Error)?.message === "timeout" || code === "ECONNRESET" || code === "ECONNREFUSED") return fail(502, "That website didn't answer in time. Try again in a minute.");
    return fail(502, publicError(err, "We couldn't read that website. Check the address and try again."));
  }
}
