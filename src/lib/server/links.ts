import "server-only";
import { createHash, randomInt } from "node:crypto";

// Smart links: short codes, UTM tagging, bot and device detection, and a privacy-safe visitor id.

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o/1/l: easy to read off a poster
export function newCode(len = 7): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

export const CODE_RE = /^[a-z0-9]{6,10}$/;

// Adds UTM tags the owner set, without overwriting tags already in the destination.
export function tagged(destination: string, utm: { source?: string | null; medium?: string | null; campaign?: string | null; content?: string | null }): string {
  const u = new URL(destination);
  const pairs: [string, string | null | undefined][] = [["utm_source", utm.source], ["utm_medium", utm.medium], ["utm_campaign", utm.campaign], ["utm_content", utm.content]];
  for (const [k, v] of pairs) if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
  return u.toString();
}

// Link previews (WhatsApp, Facebook, Slack), crawlers and monitors: counted separately, not as people.
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|twitterbot|linkedinbot|embedly|skype|curl|wget|python-requests|httpclient|headless|lighthouse|pingdom|uptime|monitor/i;
export function isBot(ua: string): boolean { return !ua || BOT_RE.test(ua); }

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" | "other" {
  if (/ipad|tablet|kindle|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
  if (/mobi|iphone|ipod|android|kaios|opera mini/i.test(ua)) return "mobile";
  if (/windows|macintosh|x11|linux|cros/i.test(ua)) return "desktop";
  return "other";
}

// Same person, same day → same id; different days → unrelated ids. Not reversible without the secret.
export function visitorId(ip: string, ua: string, day = new Date().toISOString().slice(0, 10)): string {
  const secret = process.env.LINK_HASH_SECRET ?? "";
  return createHash("sha256").update(`${secret}|${day}|${ip}|${ua}`).digest("hex").slice(0, 32);
}

export function referrerHost(ref: string | null): string | null {
  if (!ref) return null;
  try { return new URL(ref).hostname.replace(/^www\./, "").slice(0, 120); } catch { return null; }
}

// Channel presets: one tap sets source and medium the way analytics tools expect.
export const CHANNELS = {
  whatsapp: { source: "whatsapp", medium: "social" },
  instagram: { source: "instagram", medium: "social" },
  facebook: { source: "facebook", medium: "social" },
  tiktok: { source: "tiktok", medium: "social" },
  x: { source: "x", medium: "social" },
  linkedin: { source: "linkedin", medium: "social" },
  email: { source: "newsletter", medium: "email" },
  sms: { source: "sms", medium: "sms" },
  poster: { source: "poster", medium: "qr" },
  ads: { source: "ads", medium: "cpc" },
} as const;
