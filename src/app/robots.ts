import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://emma.lionslane.co.ke").replace(/\/$/, "");

// Public pages are open to search engines and AI assistants; the signed-in app and the API are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/legal/", "/llms.txt"], disallow: ["/app", "/api/", "/auth/", "/signin/verify"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
