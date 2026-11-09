import "server-only";
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import zlib from "node:zlib";

// Fetches a public web page for the site audit without letting a user aim EMMA's server at
// private networks (SSRF). The IP check runs inside the socket's DNS lookup, so the address
// we check is the address we connect to (no DNS-rebinding gap). Redirects are re-checked.

export const AUDIT_UA = "EMMA-SiteAudit/1.0 (+https://emma.lionslane.co.ke/legal/security)";
const MAX_BYTES = 2_500_000;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 4;

export class FetchBlocked extends Error {}

function ipv4Private(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}

export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return ipv4Private(ip);
  if (v === 6) {
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return ipv4Private(mapped[1]);
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(x) || x.startsWith("64:ff9b:") || x.startsWith("2001:db8");
  }
  return true; // not an IP at all: refuse
}

// Validates the user's address before any network use.
export function checkPublicUrl(raw: string): URL {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`); }
  catch { throw new FetchBlocked("That doesn't look like a web address."); }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new FetchBlocked("Only http and https addresses can be audited.");
  if (u.username || u.password) throw new FetchBlocked("Addresses with a login in them can't be audited.");
  if (u.port && u.port !== "80" && u.port !== "443") throw new FetchBlocked("Only standard web ports (80 and 443) can be audited.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) ? isPrivateAddress(host) : !host.includes(".") || /\.(local|internal|localhost|lan|home|corp)$/i.test(host) || host === "localhost")
    throw new FetchBlocked("That address isn't a public website.");
  u.hash = "";
  return u;
}

type LookupCb = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;
function safeLookup(hostname: string, options: { all?: boolean } | number, cb: LookupCb) {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return cb(err, "");
    const list = addresses as LookupAddress[];
    if (!list.length || list.some((a) => isPrivateAddress(a.address))) {
      const e = new Error("blocked private address") as NodeJS.ErrnoException;
      e.code = "EBLOCKED";
      return cb(e, "");
    }
    if (typeof options === "object" && options.all) return cb(null, list);
    cb(null, list[0].address, list[0].family);
  });
}

export interface FetchedPage { url: string; status: number; headers: Record<string, string>; body: string; bytes: number; ms: number }

function once(u: URL, accept: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.request(u, {
      method: "GET",
      lookup: safeLookup as unknown as typeof dnsLookup,
      headers: { "User-Agent": AUDIT_UA, Accept: accept, "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "en-KE,en;q=0.9" },
      timeout: TIMEOUT_MS,
    }, (res) => {
      const enc = String(res.headers["content-encoding"] ?? "").toLowerCase();
      const stream = enc === "gzip" ? res.pipe(zlib.createGunzip()) : enc === "deflate" ? res.pipe(zlib.createInflate()) : enc === "br" ? res.pipe(zlib.createBrotliDecompress()) : res;
      const chunks: Buffer[] = [];
      let size = 0;
      stream.on("data", (c: Buffer) => {
        size += c.length;
        if (size > MAX_BYTES) { req.destroy(); stream.destroy(); resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }); return; }
        chunks.push(c);
      });
      stream.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }));
      stream.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (e: NodeJS.ErrnoException) => reject(e.code === "EBLOCKED" ? new FetchBlocked("That address isn't a public website.") : e));
    req.end();
  });
}

export async function safeFetch(raw: string | URL, accept = "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5"): Promise<FetchedPage> {
  let u = typeof raw === "string" ? checkPublicUrl(raw) : raw;
  const t0 = Date.now();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const r = await once(u, accept);
    const loc = r.headers.location;
    if (r.status >= 300 && r.status < 400 && loc) {
      u = checkPublicUrl(new URL(loc, u).toString());
      continue;
    }
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(r.headers)) if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(", ") : String(v);
    return { url: u.toString(), status: r.status, headers, body: r.body.toString("utf8"), bytes: r.body.length, ms: Date.now() - t0 };
  }
  throw new FetchBlocked("That page redirects too many times.");
}
