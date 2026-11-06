// Next 16 proxy: refreshes the Supabase session cookie on each request and
// keeps signed-out visitors out of the app. API routes authenticate themselves.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// The mobile app's web preview (Expo, another origin) calls the API with a
// Bearer token. Only listed origins get CORS, and never with cookies.
function corsOrigins(): string[] {
  const list = (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (process.env.NODE_ENV !== "production") list.push("http://localhost:8081", "http://127.0.0.1:8081");
  return list;
}

function withCors(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.headers.set("Access-Control-Max-Age", "600");
  res.headers.set("Vary", "Origin");
  return res;
}

export async function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const allowed = origin && corsOrigins().includes(origin);
    if (request.method === "OPTIONS") return allowed ? withCors(new NextResponse(null, { status: 204 }), origin) : new NextResponse(null, { status: 403 });
    return allowed ? withCors(NextResponse.next(), origin) : NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next(); // demo mode

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  if (path.startsWith("/app") && !signedIn) {
    const to = request.nextUrl.clone();
    to.pathname = "/signin";
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }
  if (path === "/signin" && signedIn) {
    const to = request.nextUrl.clone();
    to.pathname = "/app";
    to.search = "";
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/signin", "/api/:path*"],
};
