// GET /l/<code>: a smart link. Records one click (people and bots kept apart, no raw IP stored)
// and redirects to the owner's destination with their UTM tags.
import { NextResponse } from "next/server";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CODE_RE, deviceOf, isBot, referrerHost, tagged, visitorId } from "@/lib/server/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const gone = () => new NextResponse(
  "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>Link not found · EMMA</title><body style=\"font:16px system-ui;background:#050914;color:#e8edf7;display:grid;place-items:center;min-height:100vh;margin:0\"><div style=\"text-align:center;padding:24px\"><h1 style=\"font-size:20px\">This link isn't active</h1><p style=\"color:#9aa7c2\">It may have been switched off by its owner.</p><p style=\"color:#9aa7c2;font-size:13px\">Report a harmful link: emmasecurity@lionslane.co.ke</p><a href=\"https://emma.lionslane.co.ke\" style=\"color:#7cc4ff\">EMMA by Lions Lane</a></div></body>",
  { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
);

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = raw.toLowerCase();
  if (!CLOUD || !CODE_RE.test(code)) return gone();
  const admin = supabaseAdmin();
  const { data: link } = await admin.from("smart_links").select("code,destination,utm_source,utm_medium,utm_campaign,utm_content,archived").eq("code", code).maybeSingle();
  if (!link || link.archived) return gone();

  let to: string;
  try { to = tagged(link.destination, { source: link.utm_source, medium: link.utm_medium, campaign: link.utm_campaign, content: link.utm_content }); }
  catch { return gone(); }

  const ua = req.headers.get("user-agent") ?? "";
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const country = (req.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase() || null;
  const bot = isBot(ua) || req.headers.get("purpose") === "prefetch" || req.headers.get("sec-purpose")?.includes("prefetch") === true;
  const { error } = await admin.from("link_clicks").insert({
    code, visitor: visitorId(ip, ua), referrer: referrerHost(req.headers.get("referer")), device: deviceOf(ua), country, is_bot: bot,
  });
  if (error) console.error("[emma] click insert failed", error.message);

  return NextResponse.redirect(to, { status: 302, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "strict-origin-when-cross-origin" } });
}
