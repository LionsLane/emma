// Links that come from the model or the web are untrusted. Only http(s) URLs
// are rendered as links; anything else (javascript:, data:, junk) is dropped.
export function safeHref(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function hostOf(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw.slice(0, 40);
  }
}

// Kenyan phone → 2547XXXXXXXX / 2541XXXXXXXX, or null.
export function normaliseKenyanPhone(raw: string): string | null {
  const d = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const m = /^(?:254|0)?([17]\d{8})$/.exec(d);
  return m ? `254${m[1]}` : null;
}

// Links EMMA builds for an approved follow-up: WhatsApp click-to-chat, SMS or email only.
export function safeActionHref(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const v = raw.trim();
  if (/^https:\/\/wa\.me\/\d{8,15}(\?text=[^\s]*)?$/.test(v)) return v;
  if (/^sms:\+\d{8,15}(\?body=[^\s]*)?$/.test(v)) return v;
  if (/^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+(\?[^\s]*)?$/.test(v)) return v;
  return undefined;
}
