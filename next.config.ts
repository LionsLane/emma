import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Content Security Policy. Inline scripts/styles are allowed because Next's
// hydration and React style props need them; everything else is locked to our
// own origin and Supabase. frame-ancestors 'none' stops clickjacking (a hidden
// frame tricking someone into pressing "Approve"). Google's sign-in button
// (accounts.google.com/gsi) loads a script, a style sheet and a frame.
const gsi = "https://accounts.google.com/gsi/";
// Google Analytics (only after consent, see src/components/Consent.tsx).
const ga = "https://www.googletagmanager.com";
const gaConnect = "https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${gsi}client ${ga}${dev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  `style-src 'self' 'unsafe-inline' ${gsi}style`,
  `frame-src ${gsi}`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${gsi} ${gaConnect}${supabase ? ` ${supabase} ${supabase.replace(/^https/, "wss")}` : ""}${dev ? " ws: http://localhost:*" : ""}`,
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
