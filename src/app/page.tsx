import Link from "next/link";
import { Orb } from "@/components/Orb";
import { IconCalendar, IconCheck, IconFolder, IconMail, IconMegaphone, IconShield, IconUsers } from "@/components/icons";
import { PLANS, PLAN_ORDER, formatKES } from "@/lib/plans";
import { COMPANY } from "@/lib/company";
import { SiteFooter, SiteNav } from "./site";

const STEPS = [
  { n: "1", t: "Tell EMMA about your business", d: "Three quick questions: what you sell, who buys, how you sound." },
  { n: "2", t: "Brief her in one sentence", d: "“December is gifting season, we need office orders.” That's enough." },
  { n: "3", t: "Approve, then post", d: "She plans, writes and finds leads. Nothing goes out until you say yes." },
];

const FEATURES = [
  { icon: IconCalendar, t: "A content calendar that fills itself", d: "Every post with its angle, copy, best time and platform." },
  { icon: IconUsers, t: "Leads worth calling", d: "A pipeline you can drag and drop, with the next message drafted." },
  { icon: IconMegaphone, t: "Campaigns and ad copy", d: "Budgets, audiences and ads for Meta, Google, TikTok and LinkedIn." },
  { icon: IconMail, t: "Email and WhatsApp follow-ups", d: "Sequences that bring back people who asked and went quiet." },
  { icon: IconFolder, t: "All your copy in one place", d: "Captions, scripts and blog posts, ready to reuse." },
  { icon: IconShield, t: "Built for the Kenya Data Protection Act", d: "Consent flags on every lead. Your data stays yours." },
];

const FAQ = [
  { q: "Do I need a card to start?", a: "No. Free is free, with 15 briefs a month. Pro and Max will be paid by M-Pesa or card; those payments open once our payment accounts are verified." },
  { q: "Does EMMA post for me?", a: "Not yet. EMMA plans and writes everything and you approve it, then you post. Direct posting is on the roadmap." },
  { q: "What's a brief?", a: "Any request to EMMA: a month's calendar, a campaign, a follow-up sequence, a list of businesses to call. One brief can produce a lot of work." },
  { q: "Is my business data safe?", a: "Your workspace is private to your account. We use it only to do your work, never to train AI models, and you can export or delete it at any time." },
  { q: "Can I cancel?", a: "Any time. M-Pesa plans simply run for the 30 days you paid for. Card plans stop renewing when you cancel." },
  { q: "Who's behind EMMA?", a: `${COMPANY.legalName}, a digital marketing agency in ${COMPANY.city}. EMMA is the product; LionsLane is the service.` },
];

// What search engines and AI assistants read about EMMA: the app, its plans, who makes it, the FAQ.
function jsonLd() {
  const site = (process.env.NEXT_PUBLIC_APP_URL ?? "https://emma.lionslane.co.ke").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://lionslane.co.ke/#org", name: "Lions Lane", url: "https://lionslane.co.ke/", logo: "https://lionslane.co.ke/assets/img/icon512.png" },
      { "@type": "WebSite", "@id": `${site}/#website`, url: `${site}/`, name: "EMMA", publisher: { "@id": "https://lionslane.co.ke/#org" }, inLanguage: "en-KE" },
      {
        "@type": "SoftwareApplication", "@id": `${site}/#app`, name: "EMMA", alternateName: "EMMA by Lions Lane", url: `${site}/`,
        applicationCategory: "BusinessApplication", operatingSystem: "Web",
        description: "An AI marketing assistant for small businesses in Kenya. It plans posts, writes them in the business's voice and drafts lead follow-ups; a person approves everything.",
        publisher: { "@id": "https://lionslane.co.ke/#org" }, inLanguage: "en-KE",
        offers: PLAN_ORDER.map((id) => ({ "@type": "Offer", name: `EMMA ${PLANS[id].name}`, price: String(PLANS[id].priceKES), priceCurrency: "KES" })),
      },
      { "@type": "FAQPage", "@id": `${site}/#faq`, mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

export default function Landing() {
  return (
    <div className="site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }} />
      <SiteNav />
      <main id="main">
        <section className="hero2">
          <div className="hero2-copy">
            <span className="chip ai">For Kenyan businesses that sell on WhatsApp and Instagram</span>
            <h1>The marketing team that <span className="ai-text">already knows your business.</span></h1>
            <p className="lead">EMMA plans your month, writes your posts, ads and emails, and finds leads worth calling. You approve everything.</p>
            <div className="row" style={{ gap: 12 }}>
              <Link href="/signin" className="btn ai lg">Start free</Link>
              <a href="#pricing" className="btn lg">See pricing</a>
            </div>
            <ul className="hero2-points">
              <li><IconCheck />Free forever plan</li>
              <li><IconCheck />Pay with M-Pesa</li>
              <li><IconCheck />Nothing posts without you</li>
            </ul>
          </div>
          <ProductPreview />
        </section>

        <section className="band" id="how">
          <h2 className="band-title">How it works</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.n} className="glass step">
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band">
          <h2 className="band-title">Everything a marketing team does</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.t} className="feature">
                <span className="feature-icon"><f.icon /></span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band compare-band">
          <div className="glass compare">
            <h2 className="band-title" style={{ textAlign: "left", margin: 0 }}>Why not just use a chat app?</h2>
            <div className="compare-grid">
              <div><b>A chat app</b><ul><li>Forgets your business every time</li><li>Gives you text to copy and paste</li><li>No calendar, no leads, no follow-up</li></ul></div>
              <div><b className="ai-text">EMMA</b><ul><li>Remembers your products, customers and calendar</li><li>Puts the work straight into your plan, for you to approve</li><li>Calendar, campaigns, leads and results in one place</li></ul></div>
            </div>
          </div>
        </section>

        <section className="band" id="pricing">
          <h2 className="band-title">Simple pricing</h2>
          <div className="plans site-plans">
            {PLAN_ORDER.map((id) => {
              const p = PLANS[id];
              return (
                <div key={id} className={`glass plan ${id === "pro" ? "featured" : ""}`}>
                  {id === "pro" && <span className="chip ai tag">Most popular</span>}
                  <div><div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div><div className="small muted">{p.blurb}</div></div>
                  <div className="price">{formatKES(p.priceKES)}<small>/ month</small></div>
                  <ul>{p.features.map((f) => <li key={f}><IconCheck />{f}</li>)}</ul>
                  <Link href="/signin" className={`btn ${id === "pro" ? "ai" : id === "max" ? "primary" : ""}`} style={{ marginTop: "auto" }}>{id === "free" ? "Start free" : `Choose ${p.name}`}</Link>
                </div>
              );
            })}
          </div>
          <p className="small faint" style={{ textAlign: "center", marginTop: 14 }}>Start free today. Pro and Max open for M-Pesa and card payments once our payment accounts are verified.</p>
        </section>

        <section className="band" id="faq">
          <h2 className="band-title">Questions</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q} className="glass">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="band final-cta">
          <Orb size={72} className="orb-float" />
          <h2>Your next month of marketing, planned in minutes.</h2>
          <Link href="/signin" className="btn ai lg">Start free</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// An illustration of the product (not a screenshot of a real customer).
function ProductPreview() {
  return (
    <div className="preview" aria-label="Illustration of EMMA turning a one-line brief into a content plan" role="img">
      <div className="glass preview-win">
        <div className="preview-bar"><i /><i /><i /><span>EMMA · Command Center</span></div>
        <div className="preview-body">
          <div className="pv-user">December is gifting season. We need office orders.</div>
          <div className="pv-emma">
            <Orb size={26} />
            <div className="stack" style={{ gap: 8, flex: 1 }}>
              <div className="pv-status"><span className="spark" />Reading your calendar</div>
              <div className="pv-text">Here&apos;s a three-week push aimed at office managers, with a gift-box offer and a follow-up for everyone who asks.</div>
              <div className="pv-card">
                <div className="small muted">EMMA proposes · Content calendar · 9 items</div>
                <b>Corporate gifting push</b>
                <div className="pv-rows">
                  <span><em>LinkedIn</em> Gift boxes for teams of 10 to 500</span>
                  <span><em>WhatsApp</em> Last order date reminder</span>
                  <span><em>Instagram</em> Behind the packing table</span>
                </div>
                <div className="row" style={{ gap: 8 }}><span className="btn ai sm">Approve &amp; add</span><span className="btn ghost sm">Discard</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="glass pv-float pv-f1"><IconCheck />Approved: 9 posts added</div>
      <div className="glass pv-float pv-f2"><IconUsers />4 hot leads to call</div>
    </div>
  );
}
