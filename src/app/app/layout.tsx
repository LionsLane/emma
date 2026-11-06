import type { Metadata } from "next";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "App", robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
