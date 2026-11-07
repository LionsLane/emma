// GET /auth/callback?code=…&next=/app: finishes Google sign-in and email-link sign-in.
// If the provider or Supabase reports an error, it arrives as ?error=…&error_description=…;
// we log it and pass a short, safe code to the sign-in page.
import { NextResponse } from "next/server";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseFromCookies } from "@/lib/supabase/server";

const back = (origin: string, code: string) => NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(code)}`, origin));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("next") ?? "/app";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app"; // no open redirects
  const providerError = url.searchParams.get("error");
  if (providerError) {
    console.error("[emma] oauth callback error", providerError, url.searchParams.get("error_code"), url.searchParams.get("error_description"));
    return back(url.origin, "oauth");
  }
  const code = url.searchParams.get("code");
  if (!CLOUD || !code) return back(url.origin, "oauth");
  const sb = await supabaseFromCookies();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[emma] oauth exchange failed", error.code ?? "", error.message);
    return back(url.origin, error.message.toLowerCase().includes("verifier") ? "browser" : "oauth");
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
