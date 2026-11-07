import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Consent } from "@/components/Consent";
import "./globals.css";
import "./site.css";

const unbounded = Unbounded({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-unbounded" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5180";

const description = "EMMA is an AI marketing assistant for small businesses in Kenya. Brief her in one sentence: she plans your posts, writes them in your voice and drafts the follow-up for every lead. You approve everything. Free to start, by Lions Lane.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "EMMA: AI Marketing Assistant for Small Businesses in Kenya", template: "%s · EMMA" },
  description,
  applicationName: "EMMA",
  authors: [{ name: "Lions Lane", url: "https://lionslane.co.ke" }],
  creator: "Lions Lane",
  publisher: "Lions Lane",
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website", url: "/", siteName: "EMMA by Lions Lane", locale: "en_KE",
    title: "EMMA: the marketing team that already knows your business",
    description: "Brief EMMA in one sentence. She plans your posts, writes them in your voice and follows up your leads. Free to start.",
  },
  twitter: { card: "summary_large_image", title: "EMMA by Lions Lane", description: "The AI marketing assistant for small businesses in Kenya. Free to start." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#050914", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        {/* Cookieless, anonymous page analytics (no consent banner needed). */}
        <Analytics />
        {/* Google Analytics loads only after the visitor allows it. */}
        <Consent />
      </body>
    </html>
  );
}
