import "server-only";

// Small helpers shared by every route handler.

export function json(status: number, body: object, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
}

export const fail = (status: number, error: string, extra: object = {}) => json(status, { error, ...extra });

// Read a JSON body with a hard size limit, rejecting non-JSON content types.
// (A text/plain POST from another site skips the CORS preflight; requiring
// application/json closes that cross-site request route.)
export async function readJson<T = unknown>(req: Request, maxBytes = 64_000): Promise<T | Response> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) return fail(415, "Send JSON.");
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) return fail(413, "Request too large.");
  const text = await req.text();
  if (text.length > maxBytes) return fail(413, "Request too large.");
  try {
    return JSON.parse(text) as T;
  } catch {
    return fail(400, "Bad request body.");
  }
}

// Cookie-authenticated requests must come from our own site.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin GETs and non-browser clients send none
  const allowed = new Set([new URL(req.url).origin]);
  if (process.env.NEXT_PUBLIC_APP_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
  return allowed.has(origin);
}

// Log the real error server-side; give the client something safe.
export function publicError(err: unknown, fallback = "Something went wrong. Try again."): string {
  console.error("[emma]", err instanceof Error ? `${err.name}: ${err.message}` : err);
  return fallback;
}
