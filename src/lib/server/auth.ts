import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CLOUD } from "@/lib/supabase/env";
import { supabaseFromCookies, supabaseFromToken } from "@/lib/supabase/server";
import { fail, sameOrigin } from "./http";

export interface AuthedUser {
  id: string;
  email: string | null;
  db: SupabaseClient; // user-scoped: RLS applies
  token: string | null; // bearer token (mobile), null for cookie sessions
}

// Verify who is calling. Mobile sends a bearer token; the web sends cookies.
// getClaims() verifies the JWT signature; we never trust getSession() or
// user_metadata for authorisation.
export async function requireUser(req: Request): Promise<AuthedUser | Response> {
  if (!CLOUD) return fail(503, "Accounts aren't set up on this server yet.");
  const header = req.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;

  const db = token ? supabaseFromToken(token) : await supabaseFromCookies();
  if (!token && !sameOrigin(req)) return fail(403, "Cross-site request blocked.");

  const { data, error } = await db.auth.getClaims(token ?? undefined);
  const sub = data?.claims?.sub;
  if (error || !sub) return fail(401, "Please sign in again.");
  return { id: sub, email: (data.claims.email as string | undefined) ?? null, db, token };
}

export const isResponse = (x: unknown): x is Response => x instanceof Response;
