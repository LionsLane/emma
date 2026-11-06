import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./site.css";

const unbounded = Unbounded({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-unbounded" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5180";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "EMMA · The marketing team that already knows your business", template: "%s · EMMA" },
  description: "EMMA plans your month, writes your posts, ads and emails, and finds leads worth calling. You approve everything. From KES 0. A LionsLane product.",
  icons: { icon: "/icon.svg" },
  openGraph: { title: "EMMA by LionsLane", description: "The marketing team that already knows your business. From KES 0.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#050914", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        {/* Cookieless, anonymous page analytics (no consent banner needed). */}
        <Analytics />
      </body>
    </html>
  );
}
