"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Orb } from "@/components/Orb";
import { IconCheck } from "@/components/icons";
import { useEmma } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabase/browser";

const CUSTOMERS = ["Walk-in customers", "Young professionals", "Families", "Students", "Offices and companies", "Hotels and restaurants", "Online shoppers", "Tourists"];
const CHANNELS = ["WhatsApp", "Instagram", "Facebook", "TikTok", "LinkedIn", "Website", "Google Business"];
const VIBES = [
  { id: "warm", label: "Warm and local", voice: "Warm, friendly and local. Short sentences, everyday words, proud of where we're from." },
  { id: "pro", label: "Professional", voice: "Clear, confident and professional. Specific about results, never stiff." },
  { id: "playful", label: "Playful", voice: "Playful and upbeat, with a light sense of humour. Never rude, never slangy enough to confuse." },
  { id: "premium", label: "Premium", voice: "Calm, refined and premium. Few words, quality over hype." },
];

export default function Welcome() {
  const router = useRouter();
  const mode = useEmma((s) => s.mode);
  const bootstrap = useEmma((s) => s.bootstrap);
  const send = useEmma((s) => s.send);
  const toast = useEmma((s) => s.toast);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [what, setWhat] = useState("");
  const [location, setLocation] = useState("Nairobi, Kenya");
  const [customers, setCustomers] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>(["WhatsApp", "Instagram"]);
  const [vibe, setVibe] = useState("warm");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (mode === "demo") router.replace("/app"); }, [mode, router]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const canNext = step === 0 ? name.trim().length > 1 && what.trim().length > 2 : step === 1 ? customers.length > 0 && channels.length > 0 : true;

  const finish = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        profile: {
          industry: `${what.trim()} (sells on ${channels.join(", ")})`,
          location: location.trim(),
          sectors: customers,
          voice: VIBES.find((v) => v.id === vibe)?.voice,
        },
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Couldn't set up your workspace. Try again.");
      setBusy(false);
      return;
    }
    const sb = supabaseBrowser();
    const { data: claims } = await sb!.auth.getClaims();
    if (claims?.claims?.sub) await sb!.from("profiles").update({ onboarded: true }).eq("id", claims.claims.sub);
    await bootstrap();
    router.replace("/app");
    toast("You're set up. EMMA is drafting your starter plan.", "ok");
    void send(
      `I've just joined. Build me a two-week starter content calendar for ${name.trim()} on ${channels.join(", ")}. ` +
        `We sell ${what.trim()} to ${customers.join(", ").toLowerCase()} in ${location.trim()}. Mix the angles, write the copy for each post, and keep it realistic for a small team.`,
    );
  };

  return (
    <main className="auth" style={{ alignItems: "center" }}>
      <div className="onboard glass">
        <div className="row" style={{ gap: 12 }}>
          <Orb size={40} busy={busy} />
          <div style={{ flex: 1 }}>
            <div className="small muted">Step {step + 1} of 3</div>
            <div className="dots" aria-hidden="true" style={{ marginTop: 6 }}>{[0, 1, 2].map((i) => <i key={i} className={i <= step ? "ng" : ""} />)}</div>
          </div>
        </div>

        {step === 0 && (
          <section className="stack" style={{ gap: 14 }}>
            <h1 className="auth-title">Tell me about your business</h1>
            <div className="field"><label htmlFor="bn">Business name</label><input id="bn" className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Amani Beauty Lounge" /></div>
            <div className="field"><label htmlFor="bw">What do you sell?</label><input id="bw" className="input" value={what} onChange={(e) => setWhat(e.target.value)} maxLength={150} placeholder="e.g. hair, nails and bridal make-up" /></div>
            <div className="field"><label htmlFor="bl">Where?</label><input id="bl" className="input" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} /></div>
          </section>
        )}

        {step === 1 && (
          <section className="stack" style={{ gap: 16 }}>
            <h1 className="auth-title">Who buys, and where do you sell?</h1>
            <fieldset className="choice"><legend>Your customers</legend>
              <div className="quick">{CUSTOMERS.map((c) => <button type="button" key={c} aria-pressed={customers.includes(c)} className={customers.includes(c) ? "picked" : ""} onClick={() => toggle(customers, setCustomers, c)}>{customers.includes(c) && <IconCheck />}{c}</button>)}</div>
            </fieldset>
            <fieldset className="choice"><legend>Where you sell</legend>
              <div className="quick">{CHANNELS.map((c) => <button type="button" key={c} aria-pressed={channels.includes(c)} className={channels.includes(c) ? "picked" : ""} onClick={() => toggle(channels, setChannels, c)}>{channels.includes(c) && <IconCheck />}{c}</button>)}</div>
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section className="stack" style={{ gap: 14 }}>
            <h1 className="auth-title">How should you sound?</h1>
            <div className="vibes" role="radiogroup" aria-label="Brand voice">
              {VIBES.map((v) => (
                <button type="button" key={v.id} role="radio" aria-checked={vibe === v.id} className={`glass vibe ${vibe === v.id ? "on" : ""}`} onClick={() => setVibe(v.id)}>
                  <b>{v.label}</b><span>{v.voice}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {error && <div className="err" role="alert">{error}</div>}
        <div className="row">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)} disabled={busy}>Back</button>}
          <span className="spacer" style={{ flex: 1 }} />
          {step < 2
            ? <button className="btn primary" onClick={() => setStep(step + 1)} disabled={!canNext}>Continue</button>
            : <button className="btn ai" onClick={finish} disabled={busy}>{busy ? "Setting up…" : "Build my plan"}</button>}
        </div>
      </div>
    </main>
  );
}
