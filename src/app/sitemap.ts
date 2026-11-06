import type { MetadataRoute } from "next";
import { DOCS, UPDATED } from "./legal/content";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://emma.lionslane.co.ke").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const legalDate = new Date(UPDATED);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signin`, changeFrequency: "yearly", priority: 0.3 },
    ...Object.keys(DOCS).map((slug) => ({ url: `${base}/legal/${slug}`, lastModified: legalDate, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
