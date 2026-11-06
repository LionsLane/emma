// GET /auth/confirm?token_hash=…&type=email&next=/app — the link in EMMA's sign-in and sign-up emails.
// The server verifies the one-time token itself, so the link works in any browser or mail app
// (the PKCE link in Supabase's default template only works in the browser that asked for it).
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseFromCookies } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["email", "magiclink", "signup", "invite", "recovery", "email_change"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const raw = url.searchParams.get("next") ?? "/app";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app"; // no open redirects
  if (!CLOUD || !tokenHash || !type || !TYPES.includes(type)) return NextResponse.redirect(new URL("/signin?error=1", url.origin));
  const sb = await supabaseFromCookies();
  const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type });
  return NextResponse.redirect(new URL(error ? "/signin?error=1" : next, url.origin));
}
