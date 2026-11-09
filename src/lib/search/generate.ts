// Copy-paste fixes generated from the Business Profile (no AI, no cost). Every value comes from
// what the owner entered; empty fields are left out rather than invented.

import type { ClientProfile } from "@/lib/types";
import { AI_BOTS } from "./analyse";

const site = (p: ClientProfile) => {
  const w = p.website.trim();
  return w ? (/^https?:\/\//i.test(w) ? w : `https://${w}`).replace(/\/+$/, "") : "";
};

// "Mo-Fr 08:00-18:00, Sa 09:00-14:00" → schema.org openingHours strings.
const hoursList = (h?: string) => (h ?? "").split(/[,;\n]/).map((x) => x.trim()).filter((x) => /^[A-Za-z]{2}(-[A-Za-z]{2})?\s+\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(x));

export function localBusinessJsonLd(p: ClientProfile): string {
  const url = site(p);
  const city = p.location.split(",")[0].trim();
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: p.name,
    ...(p.tagline && { slogan: p.tagline }),
    ...(p.industry && { description: `${p.name}: ${p.industry}${city ? ` in ${city}` : ""}.${p.tagline ? ` ${p.tagline}` : ""}` }),
    ...(url && { url, "@id": `${url}/#business` }),
    ...(p.phone && { telephone: p.phone }),
    ...(p.email && { email: p.email }),
    ...((p.address || p.location) && {
      address: { "@type": "PostalAddress", ...(p.address && { streetAddress: p.address }), ...(city && { addressLocality: city }), addressCountry: "KE" },
    }),
    ...(city && { areaServed: city }),
    ...(hoursList(p.hours).length && { openingHours: hoursList(p.hours) }),
    ...((p.socials ?? []).filter(Boolean).length && { sameAs: (p.socials ?? []).filter(Boolean) }),
    ...(p.offerings.length && {
      makesOffer: p.offerings.slice(0, 10).map((o) => ({
        "@type": "Offer",
        itemOffered: { "@type": o.kind === "product" ? "Product" : "Service", name: o.name, ...(o.description && { description: o.description }) },
        ...(o.price > 0 && { price: o.price, priceCurrency: p.currency || "KES" }),
      })),
    }),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(node, null, 2).replace(/</g, "\\u003c")}\n</script>`;
}

export function faqJsonLd(p: ClientProfile): string {
  const faqs = (p.faqs ?? []).filter((f) => f.q.trim() && f.a.trim());
  if (!faqs.length) return "";
  const node = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q.trim(), acceptedAnswer: { "@type": "Answer", text: f.a.trim() } })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(node, null, 2).replace(/</g, "\\u003c")}\n</script>`;
}

export function llmsTxt(p: ClientProfile): string {
  const url = site(p);
  const city = p.location.split(",")[0].trim();
  const lines = [
    `# ${p.name}`,
    "",
    `> ${[p.industry && `${p.industry}${city ? ` in ${p.location}` : ""}`, p.tagline].filter(Boolean).join(". ") || p.name}.`,
    "",
  ];
  const contact = [p.phone && `Phone: ${p.phone}`, p.whatsapp && `WhatsApp: ${p.whatsapp}`, p.email && `Email: ${p.email}`, p.address && `Address: ${p.address}`, p.hours && `Hours: ${p.hours}`].filter(Boolean);
  if (contact.length) lines.push("## Contact", "", ...contact.map((c) => `- ${c}`), "");
  if (p.offerings.length) {
    lines.push("## What we offer", "");
    for (const o of p.offerings.slice(0, 15)) lines.push(`- ${o.name}${o.price > 0 ? ` (from ${p.currency || "KES"} ${o.price.toLocaleString("en-KE")})` : ""}${o.description ? `: ${o.description}` : ""}`);
    lines.push("");
  }
  if (p.sectors.length) lines.push("## Who we serve", "", `- ${p.sectors.join(", ")}`, "");
  if (url) lines.push("## Key pages", "", `- [Home](${url}/)`, `- [Contact](${url}/contact)`, "");
  const faqs = (p.faqs ?? []).filter((f) => f.q.trim() && f.a.trim());
  if (faqs.length) { lines.push("## Questions", ""); for (const f of faqs.slice(0, 10)) lines.push(`- **${f.q.trim()}** ${f.a.trim()}`); lines.push(""); }
  if ((p.socials ?? []).length) lines.push("## Elsewhere", "", ...(p.socials ?? []).filter(Boolean).map((s) => `- ${s}`), "");
  return lines.join("\n").trim() + "\n";
}

export function robotsFor(p: ClientProfile): string {
  const url = site(p) || "https://your-site.co.ke";
  return [
    "# Let AI assistants read and cite this site",
    ...AI_BOTS.flatMap((b) => [`User-agent: ${b}`, "Allow: /", ""]),
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${url}/sitemap.xml`,
  ].join("\n") + "\n";
}

export function metaSuggestions(p: ClientProfile): { title: string; description: string } {
  const city = p.location.split(",")[0].trim();
  const what = p.industry || p.offerings[0]?.name || "Business";
  const title = [`${what}${city ? ` in ${city}` : ""}`, p.name].filter(Boolean).join(" | ").slice(0, 60);
  const act = p.whatsapp ? "WhatsApp us" : p.phone ? "Call us" : "Visit us";
  const description = `${p.name}: ${what.toLowerCase()}${city ? ` in ${city}` : ""}${p.tagline ? `. ${p.tagline}` : ""}. ${act} today.`.replace(/\s+/g, " ").slice(0, 160);
  return { title, description };
}
