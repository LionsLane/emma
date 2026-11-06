// GET /auth/callback?code=…&next=/app: finishes Google sign-in and email-link sign-in.
import { NextResponse } from "next/server";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseFromCookies } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const raw = url.searchParams.get("next") ?? "/app";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app"; // no open redirects
  if (!CLOUD || !code) return NextResponse.redirect(new URL("/signin?error=1", url.origin));
  const sb = await supabaseFromCookies();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(error ? "/signin?error=1" : next, url.origin));
}
