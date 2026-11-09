// Search & AI audit: turns one fetched page (plus robots.txt, sitemap and llms.txt checks) into
// scored checks for four pillars. Pure functions, no AI and no network, so it is cheap and testable.
//   SEO  classic search (Google, Bing)
//   AIO  AI Overviews and answer boxes in Google
//   GEO  generative engines (ChatGPT, Claude, Perplexity, Gemini) finding and citing the business
//   AXO  assistants and voice: direct answers, local details, one-tap actions

import type { AuditCheck, AuditFacts, AuditStatus, Pillar } from "@/lib/types";

export const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"] as const;

export interface AnalyseInput {
  url: string; // final URL after redirects
  status: number;
  ms: number;
  bytes: number;
  html: string;
  robots: string | null; // robots.txt body, null if missing
  sitemapOk: boolean;
  llmsOk: boolean;
  business?: { name?: string; location?: string };
}

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
const clean = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) out[m[1].toLowerCase()] = decode(m[3] ?? m[4] ?? m[5] ?? "");
  return out;
}

function tags(html: string, name: string): Record<string, string>[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));
}

function inner(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "gi"))].map((m) => clean(m[1]));
}

// JSON-LD: every @type (including inside @graph), plus the nodes for deeper checks.
function jsonLd(html: string): { types: string[]; nodes: Record<string, unknown>[] } {
  const nodes: Record<string, unknown>[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (o["@type"]) nodes.push(o);
      if (o["@graph"]) walk(o["@graph"]);
      for (const k of Object.keys(o)) if (k !== "@graph" && typeof o[k] === "object") walk(o[k]);
    }
  };
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(m[1].trim())); } catch { /* invalid JSON-LD counts as missing */ }
  }
  const types = [...new Set(nodes.flatMap((n) => ([] as unknown[]).concat(n["@type"]).map(String)))];
  return { types, nodes };
}

// robots.txt: is each AI crawler allowed to fetch "/"? Uses the bot's own group, else "*".
export function aiBotAccess(robots: string | null): Record<string, "allowed" | "blocked"> {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let cur: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const line of (robots ?? "").split(/\r?\n/)) {
    const l = line.replace(/#.*$/, "").trim();
    const m = l.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase(), val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (cur && (key === "allow" || key === "disallow")) cur.rules.push({ allow: key === "allow", path: val });
    }
  }
  const out: Record<string, "allowed" | "blocked"> = {};
  for (const bot of AI_BOTS) {
    const g = groups.find((x) => x.agents.includes(bot.toLowerCase())) ?? groups.find((x) => x.agents.includes("*"));
    const blocksRoot = g?.rules.some((r) => !r.allow && r.path === "/") ?? false;
    const allowsRoot = g?.rules.some((r) => r.allow && r.path === "/") ?? false;
    out[bot] = blocksRoot && !allowsRoot ? "blocked" : "allowed";
  }
  return out;
}

const QUESTION = /^(how|what|why|when|where|which|who|can|do|does|is|are|should|will|nini|vipi|wapi|lini)\b|\?\s*$/i;

export function analysePage(i: AnalyseInput): { checks: AuditCheck[]; facts: AuditFacts; scores: Record<Pillar, number> & { overall: number } } {
  const html = i.html;
  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0] ?? html;
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
  const text = clean(body.match(/<body\b[\s\S]*<\/body>/i)?.[0] ?? body);
  const words = text ? text.split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
  const lower = text.toLowerCase();

  const metas = tags(head, "meta");
  const meta = (k: string) => metas.find((m) => (m.name ?? m.property ?? "").toLowerCase() === k)?.content?.trim() ?? "";
  const title = clean(head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = meta("description");
  const robotsMeta = meta("robots").toLowerCase();
  const links = tags(head, "link");
  const canonical = links.find((l) => (l.rel ?? "").toLowerCase().split(/\s+/).includes("canonical"))?.href ?? "";
  const lang = attrs(html.match(/<html\b[^>]*>/i)?.[0] ?? "").lang ?? "";
  const h1 = inner(body, "h1").filter(Boolean);
  const h2 = inner(body, "h2").filter(Boolean);
  const h3 = inner(body, "h3").filter(Boolean);
  const questions = [...h2, ...h3].filter((h) => QUESTION.test(h));
  const imgs = tags(body, "img");
  const imgsNoAlt = imgs.filter((x) => x.alt === undefined || x.alt.trim() === "").length;
  const anchors = tags(body, "a").map((a) => a.href ?? "").filter(Boolean);
  const host = (() => { try { return new URL(i.url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  let internal = 0, external = 0;
  for (const h of anchors) {
    if (/^(mailto:|tel:|#|javascript:)/i.test(h)) continue;
    try { const u = new URL(h, i.url); if (u.hostname.replace(/^www\./, "") === host) internal++; else external++; } catch { /* skip */ }
  }
  const tel = anchors.some((h) => /^tel:/i.test(h));
  const mail = anchors.some((h) => /^mailto:/i.test(h));
  const whatsapp = anchors.some((h) => /(wa\.me|api\.whatsapp\.com|whatsapp:\/\/)/i.test(h));
  const { types, nodes } = jsonLd(html);
  const typeSet = new Set(types.map((t) => t.toLowerCase()));
  const has = (...t: string[]) => t.some((x) => typeSet.has(x.toLowerCase()));
  const local = nodes.find((n) => ([] as unknown[]).concat(n["@type"]).map(String).some((t) => /localbusiness|store|restaurant|organization|professionalservice|hotel|dentist|medical|autorepair|bakery|cafe|shop/i.test(t)));
  const sameAs = nodes.some((n) => Array.isArray(n.sameAs) ? n.sameAs.length > 0 : typeof n.sameAs === "string");
  const hasAddress = nodes.some((n) => n.address !== undefined) || /\b(p\.?\s?o\.?\s?box|street|road|avenue|rd\.?|ave\.?|floor|plaza|house|nairobi|mombasa|kisumu|nakuru|eldoret)\b/i.test(text);
  const hours = nodes.some((n) => n.openingHours !== undefined || n.openingHoursSpecification !== undefined);
  const og = Boolean(meta("og:title") && meta("og:image"));
  const viewport = Boolean(meta("viewport"));
  const firstP = inner(body, "p").find((p) => p.length > 30) ?? "";
  const listsOrTables = /<(ul|ol|table)\b/i.test(body);
  const aiBots = aiBotAccess(i.robots);
  const blockedBots = Object.entries(aiBots).filter(([, v]) => v === "blocked").map(([k]) => k);
  const https = i.url.startsWith("https://");
  const name = (i.business?.name ?? "").trim();
  const city = (i.business?.location ?? "").split(",")[0].trim();

  const checks: AuditCheck[] = [];
  const add = (pillar: Pillar, id: string, label: string, status: AuditStatus, detail: string, fix: string | undefined, weight: number) =>
    checks.push({ id, pillar, label, status, detail, fix: status === "pass" ? undefined : fix, weight });

  // ---------------------------------------------------------------- SEO
  add("seo", "https", "Secure (HTTPS)", https ? "pass" : "fail", https ? "The page loads over HTTPS." : "The page loads over plain HTTP.", "Turn on HTTPS (free with most hosts and Cloudflare) and redirect http to https.", 3);
  add("seo", "status", "Page loads", i.status === 200 ? "pass" : "fail", `The server answered ${i.status}.`, "Make sure the page returns 200 OK, not an error or a login page.", 3);
  add("seo", "title", "Page title", !title ? "fail" : title.length < 25 || title.length > 65 ? "warn" : "pass", title ? `"${title.slice(0, 80)}" (${title.length} characters).` : "No <title>.", "Write a 30 to 60 character title: what you offer, where, and your name. Example: \"Bakery in Nakuru | Fresh bread daily | Mama Njeri\".", 3);
  add("seo", "description", "Meta description", !description ? "fail" : description.length < 70 || description.length > 165 ? "warn" : "pass", description ? `${description.length} characters.` : "No meta description.", "Add a 120 to 160 character description that says what you do, for whom, and the next step (call, WhatsApp, visit).", 2);
  add("seo", "h1", "One main heading", h1.length === 1 ? "pass" : h1.length === 0 ? "fail" : "warn", h1.length ? `${h1.length} H1 heading${h1.length > 1 ? "s" : ""}: "${h1[0].slice(0, 70)}".` : "No H1 heading.", "Use exactly one H1 that names your main service and town.", 2);
  add("seo", "noindex", "Allowed in search results", /noindex/.test(robotsMeta) ? "fail" : "pass", /noindex/.test(robotsMeta) ? "The page tells search engines not to list it (noindex)." : "No noindex tag.", "Remove the noindex robots tag so Google and Bing can list the page.", 3);
  add("seo", "viewport", "Phone friendly", viewport ? "pass" : "fail", viewport ? "Has a mobile viewport tag." : "No mobile viewport tag.", "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">. Most Kenyan visitors are on phones.", 2);
  add("seo", "canonical", "Canonical address", canonical ? "pass" : "warn", canonical ? `Points to ${canonical.slice(0, 80)}.` : "No canonical link.", "Add <link rel=\"canonical\"> with the page's preferred address to avoid duplicates.", 1);
  add("seo", "lang", "Language set", lang ? "pass" : "warn", lang ? `lang="${lang}".` : "No lang attribute on <html>.", "Add lang=\"en\" (or \"sw\") to the <html> tag.", 1);
  add("seo", "alt", "Image descriptions", imgs.length === 0 || imgsNoAlt / imgs.length <= 0.1 ? "pass" : imgsNoAlt / imgs.length <= 0.4 ? "warn" : "fail", imgs.length ? `${imgsNoAlt} of ${imgs.length} images have no alt text.` : "No images on the page.", "Give every image a short alt text that describes it (for Google Images and screen readers).", 1);
  add("seo", "sitemap", "Sitemap", i.sitemapOk ? "pass" : "warn", i.sitemapOk ? "sitemap.xml found." : "No sitemap.xml found at the site root.", "Publish /sitemap.xml and submit it in Google Search Console and Bing Webmaster Tools.", 2);
  add("seo", "content", "Enough words to rank", words >= 300 ? "pass" : words >= 120 ? "warn" : "fail", `${words.toLocaleString("en-KE")} words of readable text.`, "Aim for 300+ words explaining your services, prices or ranges, area served and why customers choose you.", 1);
  add("seo", "speed", "Page size and server response", i.bytes <= 1_500_000 && i.ms <= 3000 ? "pass" : i.bytes <= 3_000_000 && i.ms <= 6000 ? "warn" : "fail", `${Math.round(i.bytes / 1024)} KB of HTML; the server answered in ${(i.ms / 1000).toFixed(1)} s from EMMA's servers.`, "Keep the HTML small, use a fast host or CDN (Cloudflare is free) and cache pages. For full speed scores, run Google PageSpeed Insights.", 1);
  add("seo", "social", "Share preview", og ? "pass" : "warn", og ? "Has Open Graph title and image." : "Missing og:title or og:image.", "Add og:title, og:description and og:image so links look good on WhatsApp, Facebook and LinkedIn.", 1);

  // ---------------------------------------------------------------- AIO
  add("aio", "schema", "Structured data", types.length ? "pass" : "fail", types.length ? `Found: ${types.slice(0, 8).join(", ")}.` : "No JSON-LD structured data.", "Add JSON-LD (EMMA can generate it below) so Google understands who you are and what you sell.", 3);
  add("aio", "entity", "Business described in schema", local ? "pass" : "fail", local ? `A ${String(([] as unknown[]).concat(local["@type"])[0])} block is present.` : "No Organization or LocalBusiness schema.", "Add LocalBusiness (or Organization) JSON-LD with name, address, phone, hours and logo.", 3);
  add("aio", "faq", "Questions answered on the page", has("FAQPage") || questions.length >= 3 ? "pass" : questions.length ? "warn" : "fail", has("FAQPage") ? "FAQPage schema found." : `${questions.length} question-style headings.`, "Add an FAQ section with the 5 questions customers ask most (price, delivery, hours, location, payment).", 2);
  add("aio", "structure", "Clear section headings", h2.length >= 2 ? "pass" : h2.length === 1 ? "warn" : "fail", `${h2.length} H2 and ${h3.length} H3 headings.`, "Break the page into sections with H2 headings (Services, Prices, Location, FAQ).", 1);
  add("aio", "lead", "A direct opening answer", firstP.length >= 40 && firstP.length <= 320 ? "pass" : firstP ? "warn" : "fail", firstP ? `First paragraph is ${firstP.length} characters.` : "No opening paragraph found.", "Open with 1 to 2 sentences that answer \"what is this business and who is it for\". AI Overviews quote these.", 1);
  add("aio", "scannable", "Lists or tables", listsOrTables ? "pass" : "warn", listsOrTables ? "Uses lists or tables." : "No lists or tables.", "Use bullet lists for services and a table for prices or packages; answer engines lift them directly.", 1);

  // ---------------------------------------------------------------- GEO
  add("geo", "aibots", "AI crawlers allowed", blockedBots.length === 0 ? "pass" : blockedBots.length <= 2 ? "warn" : "fail", blockedBots.length ? `robots.txt blocks ${blockedBots.join(", ")}.` : i.robots === null ? "No robots.txt, so AI crawlers are allowed." : "robots.txt allows the main AI crawlers.", "Allow GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended in robots.txt so AI assistants can read and cite you.", 3);
  add("geo", "llms", "llms.txt guide for AI", i.llmsOk ? "pass" : "warn", i.llmsOk ? "llms.txt found." : "No /llms.txt.", "Publish /llms.txt: a short plain-text summary of the business and its key pages (EMMA can write it below).", 2);
  add("geo", "name", "Business name is clear", !name ? "warn" : (title + " " + h1.join(" ")).toLowerCase().includes(name.toLowerCase()) ? "pass" : lower.includes(name.toLowerCase()) ? "warn" : "fail", name ? `"${name}" ${(title + h1.join(" ")).toLowerCase().includes(name.toLowerCase()) ? "is in the title or H1" : lower.includes(name.toLowerCase()) ? "appears in the text but not the title or H1" : "doesn't appear on the page"}.` : "Add the business name in Business Profile to check this.", "Put the exact business name in the title and H1 so AI models connect the page to the business.", 2);
  add("geo", "sameas", "Linked profiles (sameAs)", sameAs ? "pass" : "warn", sameAs ? "Schema links to other profiles." : "No sameAs links in schema.", "List your Google Business Profile, Facebook, Instagram, LinkedIn and TikTok in the schema's sameAs.", 1);
  const contactParts: [boolean, string][] = [[tel, "phone link"], [whatsapp, "WhatsApp link"], [mail, "email link"], [hasAddress, "address"]];
  const listed = (parts: [boolean, string][]) => {
    const found = parts.filter(([ok]) => ok).map(([, n]) => n), missing = parts.filter(([ok]) => !ok).map(([, n]) => n);
    return [found.length && `Found: ${found.join(", ")}.`, missing.length && `Missing: ${missing.join(", ")}.`].filter(Boolean).join(" ");
  };
  add("geo", "contact", "Contact details on the page", (tel || mail || whatsapp) && hasAddress ? "pass" : tel || mail || whatsapp || hasAddress ? "warn" : "fail", listed(contactParts), "Show phone, WhatsApp, email and a physical address as text, the same as on your Google Business Profile.", 2);
  add("geo", "rendered", "Readable without JavaScript", words >= 120 ? "pass" : words >= 40 ? "warn" : "fail", `${words} words are in the page HTML itself.`, "Most AI crawlers don't run JavaScript. Render the main text on the server (or as static HTML).", 3);

  // ---------------------------------------------------------------- AXO
  add("axo", "faqschema", "FAQ schema for assistants", has("FAQPage", "QAPage") ? "pass" : "warn", has("FAQPage", "QAPage") ? "FAQPage or QAPage schema found." : "No FAQPage schema.", "Mark up your FAQ with FAQPage JSON-LD (EMMA can generate it below).", 2);
  add("axo", "questions", "Written the way people ask", questions.length >= 3 ? "pass" : questions.length ? "warn" : "fail", `${questions.length} headings are phrased as questions.`, "Phrase some headings as questions people say out loud: \"How much does delivery cost in Nairobi?\".", 1);
  add("axo", "local", "Local details for \"near me\"", local && hours && hasAddress ? "pass" : hasAddress || hours ? "warn" : "fail", listed([[hasAddress, "address"], [hours, "opening hours in schema"], [Boolean(local), "business schema"]]), "Add your address and opening hours to the page and to LocalBusiness schema.", 2);
  add("axo", "actions", "One-tap actions", [tel, whatsapp, mail].filter(Boolean).length >= 2 ? "pass" : tel || whatsapp || mail ? "warn" : "fail", listed([[tel, "tap to call"], [whatsapp, "WhatsApp"], [mail, "email"]]), "Add tel: and wa.me links so assistants and phone users can act immediately.", 2);
  add("axo", "place", "Says where you serve", !city ? "warn" : lower.includes(city.toLowerCase()) ? "pass" : "fail", city ? `"${city}" ${lower.includes(city.toLowerCase()) ? "is" : "isn't"} mentioned on the page.` : "Add your location in Business Profile to check this.", "Name your town and the areas you serve in the text (e.g. \"Delivery across Nairobi: Westlands, Kilimani, CBD\").", 2);

  const credit = (s: AuditStatus) => (s === "pass" ? 1 : s === "warn" ? 0.5 : 0);
  const score = (p: Pillar) => {
    const cs = checks.filter((c) => c.pillar === p);
    const total = cs.reduce((a, c) => a + c.weight, 0);
    return total ? Math.round((cs.reduce((a, c) => a + c.weight * credit(c.status), 0) / total) * 100) : 0;
  };
  const s = { seo: score("seo"), aio: score("aio"), geo: score("geo"), axo: score("axo") };
  const scores = { ...s, overall: Math.round((s.seo + s.aio + s.geo + s.axo) / 4) };

  const facts: AuditFacts = {
    title, description, h1: h1.slice(0, 5), words, lang, schemaTypes: types.slice(0, 20), images: imgs.length, imagesNoAlt: imgsNoAlt,
    internalLinks: internal, externalLinks: external, aiBots, hasSitemap: i.sitemapOk, hasLlms: i.llmsOk, https,
  };
  return { checks, facts, scores };
}
