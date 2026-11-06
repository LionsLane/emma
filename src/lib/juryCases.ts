// Example jury cases that ship with the demo workspace.
// "EMMA by LionsLane" is EMMA's own trial: her original pitch, judged and
// rewritten until all nine jurors acquitted it. The verdicts were produced by
// Claude role-playing each juror (exactly what the Pitch Jury does live). They
// are a stress test of the pitch, not market research.

import type { JurorVerdict, JuryCase } from "./types";

type V = [JurorVerdict["role"], "ng" | "g", string, string, string, JurorVerdict["confidence"]?];
const verdicts = (rows: V[]): JurorVerdict[] =>
  rows.map(([role, v, headline, reasoning, fix, confidence]) => ({
    role, verdict: v === "ng" ? "not_guilty" : "guilty", headline, reasoning, fix, confidence: confidence ?? "high",
  }));

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const EMMA_PITCH_V3 = `EMMA by LionsLane: the marketing team that already knows your business. KES 25,000 a month.

For Kenyan SMEs that sell on WhatsApp, Instagram and LinkedIn. Tell EMMA what you need in one sentence. She already knows your products, customers and calendar, so she plans the month, writes the posts, ads and emails, and finds and scores leads worth calling. Nothing goes out until you approve it, and a LionsLane strategist reviews your leads and spend with you every month.

Unlike a chat app, EMMA keeps everything in one place: your calendar, campaigns, leads and results.

Your data stays yours: exportable any time and processed under Kenya's Data Protection Act.

Founding offer: the first 10 businesses pay KES 15,000 a month for a year in return for a case study. Cancel in the first 30 days and pay nothing.`;

const EMMA_PITCH_V2 = `EMMA by LionsLane: your marketing team for KES 25,000 a month.

Built for Kenyan SMEs that sell on WhatsApp, Instagram and LinkedIn. Brief her in one sentence and she plans your month, writes every post, ad and email, finds and scores leads worth calling, and shows your cost per lead. You approve everything before it goes out, and a LionsLane strategist reviews your plan every month.

First 30 days: if she hasn't saved you 10 hours a week, you don't pay.`;

const EMMA_PITCH_V1 = `EMMA is an AI marketing agent who takes your intent and turns it into a running marketing operation (calendar, campaigns, content, leads, email, and proof it's all working) for any sector, any market, on a budget that would normally buy you a freelancer.`;

const emmaCase: JuryCase = {
  id: "jury-emma",
  title: "EMMA by LionsLane",
  kind: "Product",
  context: "LionsLane, a digital marketing agency in Nairobi, Kenya, selling EMMA (an AI marketing agent with a human strategist behind it) to Kenyan SMEs. Regulated under the Kenya Data Protection Act, 2019. EMMA uses Anthropic's Claude API for AI processing.",
  createdAt: daysAgo(0),
  example: true,
  rounds: [
    {
      id: "jr-emma-1", at: daysAgo(0), pitch: EMMA_PITCH_V1,
      audience: "Any business, any sector, any market", price: "Not stated (\"a budget that would normally buy you a freelancer\")",
      verdicts: verdicts([
        ["customer", "g", "I can't buy something that won't tell me the price.", "I run a 12-person business in Nairobi. 'Any sector, any market' tells me it isn't built for me, and 'a budget that would buy a freelancer' sounds like it costs the same as the freelancer I already have. I can't picture what I get in week one.", "Name my kind of business, give a price in shillings, and tell me what's done for me in the first week."],
        ["skeptic", "g", "ChatGPT writes my posts for free.", "Every AI tool says it plans and writes, and Meta AI is already inside my WhatsApp. Nothing here tells me what EMMA does that a free chat app can't.", "Lead with what a chat app can't do: remember my business, keep my calendar and leads in one place, and wait for my approval."],
        ["engineer", "g", "'A running marketing operation' is more than what exists.", "Today EMMA plans, writes, researches leads and organises the work, and a person publishes. Campaign and email numbers are typed in, not synced from Meta, Google or an email tool, so 'proof it's all working' overstates what the software does on its own.", "Promise what's built: planning, writing, lead research, approvals and tracking. Put publishing and ad sync on the roadmap, not in the pitch."],
        ["lawyer", "g", "Lead research plus 'any market' is a data protection problem.", "EMMA researches and stores people's contact details. Under Kenya's Data Protection Act that needs a lawful basis, a privacy notice and clarity on who is controller and who is processor. Client data also goes to an AI provider abroad and the pitch doesn't say so. 'Any market' means every market's rules.", "Name the market, say data is processed under the Kenya DPA with a processing agreement, disclose the AI provider, and keep human approval front and centre."],
        ["competitor", "g", "'Any sector, any market' is no wedge. I'll bundle it.", "HubSpot and Canva already ship AI features to these buyers, and any agency can resell a chat tool. A generalist AI marketer is exactly what big platforms copy in one release.", "Own a corner I can't reach cheaply: Kenyan SMEs, WhatsApp-first, priced in shillings, with a local strategist behind the software."],
        ["investor", "g", "No price, no customers, no visible moat.", "Without pricing there are no unit economics, and the model belongs to someone else. I'd need the price, the cost to serve each client and a path to the first ten paying customers.", "Show a price, a rough cost to serve, and the distribution advantage of an agency with existing clients."],
        ["marketer", "g", "Forty words and I still can't repeat it.", "'Turns your intent into a running marketing operation' is abstract. Someone scrolling past gets nothing in five seconds: no outcome, no price, no 'for people like me'.", "One line: who it's for, what it replaces, what it costs. Details after."],
        ["partner", "ng", "An AI marketer with a Nairobi agency behind it, I could refer.", "As a business association that refers members, I like that a real agency stands behind this, so members aren't left alone with software. I'd still want a price before it goes in a newsletter.", "Give me a price and a named contact at LionsLane for referrals.", "low"],
        ["cfo", "g", "Same cost as a freelancer, with no proof it pays back.", "If it costs what a freelancer costs, I need a reason to swap. There's no time-saved number, no cost per lead and no way out if it doesn't work.", "Price it under a freelancer, track cost per lead, and let me cancel without paying if month one doesn't deliver."],
      ]),
      summary: "Guilty, 8–1. The jury likes an AI marketer with an agency behind it, but the pitch hides the price, overclaims what's built, has no wedge, and ignores data protection.",
      objections: [
        "No price and no 'for people like me': buyers can't picture it or budget for it.",
        "Overclaims: 'running operation' and 'proof' imply publishing and ad sync that aren't built yet.",
        "No wedge against free chat apps and big platforms, and no data-protection story.",
      ],
      revisedPitch: EMMA_PITCH_V2,
      changes: [
        "Named the buyer (Kenyan SMEs selling on WhatsApp, Instagram, LinkedIn) and a price in shillings, set below a typical freelancer retainer. The price is a placeholder for LionsLane to confirm.",
        "Swapped 'running operation' for the concrete jobs EMMA does today, and added human approval.",
        "Added the monthly LionsLane strategist as the wedge, and a first-month guarantee.",
      ],
    },
    {
      id: "jr-emma-2", at: daysAgo(0), pitch: EMMA_PITCH_V2,
      audience: "Kenyan SMEs selling on WhatsApp, Instagram and LinkedIn", price: "KES 25,000 a month (placeholder)",
      verdicts: verdicts([
        ["customer", "ng", "Under what I pay my freelancer, and I know what I get.", "Price in shillings, built for how I sell, and a person checks the plan. The 30-day promise removes my risk.", "Show me one example month so I can picture it."],
        ["skeptic", "g", "'Writes every post' is what ChatGPT does.", "Better, but the headline benefit is still writing, which I get for free. The parts that are actually different (memory of my business, approvals, a strategist) are buried.", "Put 'she already knows your business' at the top and say plainly why that beats a chat app."],
        ["engineer", "g", "'Shows your cost per lead' needs data EMMA doesn't pull yet.", "Cost per lead needs ad spend and lead sources. Those numbers are entered by hand today, so the software can't show it on its own. Everything else in this version is built.", "Say 'reviews your leads and spend with you' until the Meta and Google integrations ship."],
        ["lawyer", "g", "'Saved you 10 hours' is a guarantee nobody can measure.", "An unmeasurable guarantee becomes a refund dispute. And the data-protection line I asked for is still missing.", "Make the guarantee objective (cancel within 30 days, pay nothing) and add one line on data: yours, exportable, processed under the Kenya DPA."],
        ["competitor", "ng", "Local, priced in shillings, with a human strategist. Hard for me to copy cheaply.", "A platform can add AI writing, but it won't put a Nairobi strategist on a KES 25k account. The wedge is the service layer.", "Keep the strategist in every version of the pitch."],
        ["investor", "g", "Better economics, but who pays first?", "The price makes the economics thinkable: AI costs per client look small next to KES 25k, though a monthly strategist hour eats margin. I still see no route to the first ten customers.", "Use the agency's existing client book as the launch channel and offer founding pricing in exchange for case studies."],
        ["marketer", "ng", "I can sell 'your marketing team for 25k a month'.", "Clear headline, a named audience, a price and a risk-free start. That runs as an ad tomorrow.", "Test 'team' against 'marketing manager' in the headline."],
        ["partner", "ng", "Priced, local and backed by an agency: I'd share it.", "This is something I can put in a members' newsletter without worrying it'll embarrass me.", "Give referrers a simple referral offer."],
        ["cfo", "ng", "Cheaper than a freelancer, with a way out. I'd sign.", "KES 25k sits below a typical freelancer retainer and the first month is risk-free, so the downside is capped.", "Send a monthly summary of leads and spend so I can justify month two."],
      ]),
      summary: "Not guilty, 5–4: not there yet. Price and audience landed with buyers, but the pitch still leads with writing (free elsewhere), promises a number the software can't produce alone, and offers a guarantee a lawyer won't sign.",
      objections: [
        "Lead with memory, approvals and the strategist, not with writing.",
        "'Shows your cost per lead' overclaims until ad sync ships.",
        "The guarantee must be objective; add the data line; give investors a launch channel.",
      ],
      revisedPitch: EMMA_PITCH_V3,
      changes: [
        "New headline: 'the marketing team that already knows your business', the thing a chat app can't claim.",
        "'Shows your cost per lead' became 'reviews your leads and spend with you every month'.",
        "Guarantee is now objective (cancel in 30 days, pay nothing); added the data-protection line.",
        "Added a founding offer for the first 10 businesses: a launch channel through LionsLane's client book, plus case studies.",
      ],
    },
    {
      id: "jr-emma-3", at: daysAgo(0), pitch: EMMA_PITCH_V3,
      audience: "Kenyan SMEs selling on WhatsApp, Instagram and LinkedIn", price: "KES 25,000 a month; founding 10 at KES 15,000 for a year",
      verdicts: verdicts([
        ["customer", "ng", "Even cheaper to start, and it already knows my business.", "KES 15k with a free first month is an easy test, and I like that a person reviews the numbers with me.", "Show me a sample month."],
        ["skeptic", "ng", "Now I see why it isn't just ChatGPT.", "A chat app forgets me every time. EMMA keeps my calendar, leads and results, waits for my approval, and comes with a person. At KES 15k with a free first month, I'd try it.", "Prove the memory in the demo: ask her about last month and let her answer from my own data."],
        ["engineer", "ng", "Every claim matches what's built.", "Planning, writing, lead research, approvals, the workspace and export all exist, and 'reviews your leads and spend with you' is honest about the manual numbers. One condition: the workspace lives in one browser today, so it needs a hosted database before ten businesses are onboarded.", "Ship a hosted database before the founding ten.", "medium"],
        ["lawyer", "ng", "Clean, if the paperwork behind it exists.", "The guarantee is objective and the data line is right. For it to stay true, LionsLane needs a privacy notice, a data processing agreement with each client, and a disclosure that AI processing happens on Anthropic's servers outside Kenya.", "Publish the privacy notice and processing agreement before the first contract, and show clients what leaves their browser.", "medium"],
        ["competitor", "ng", "The strategist and the founding price lock me out.", "I can copy features, but not ten Nairobi case studies and an agency relationship at KES 15k.", "Move fast: ten case studies are your moat."],
        ["investor", "ng", "A real launch channel and capped downside. I'd back the pilot.", "Founding pricing turns the agency's client book into the first ten customers and ten case studies. AI cost per client still looks small at KES 15k, but I want it measured, not estimated.", "Track AI cost per client from day one.", "medium"],
        ["marketer", "ng", "'The marketing team that already knows your business' is the line.", "It's specific, it's for a named buyer, and the founding offer gives urgency without faking it.", "Lead every ad with the founding offer while it lasts."],
        ["partner", "ng", "Easy yes.", "Priced, local, risk-free to try and backed by a named agency. I'd recommend it.", "Give me a referral link."],
        ["cfo", "ng", "KES 15k, cancel free in month one. Signed.", "Below a freelancer, downside capped, and a monthly review of leads and spend gives me something to measure.", "Put the monthly review numbers in writing."],
      ]),
      summary: "Acquitted, 9–0, with three conditions the verdict depends on: a hosted database before onboarding ten businesses, a privacy notice and processing agreement before the first contract, and AI cost tracked per client from day one.",
      objections: [
        "Condition: hosted database before the founding ten (engineer).",
        "Condition: privacy notice + data processing agreement, and show clients what leaves their browser (lawyer).",
        "Condition: measure AI cost per client from day one (investor).",
      ],
      revisedPitch: EMMA_PITCH_V3,
      changes: [],
    },
  ],
};

const juaCase: JuryCase = {
  id: "jury-jua-office",
  title: "Jua Office Coffee: free trial week",
  kind: "Offer",
  context: "Jua Coffee Co., a specialty coffee roaster in Nairobi, Kenya. Regulated under the Kenya Data Protection Act, 2019 and food hygiene rules.",
  createdAt: daysAgo(2),
  example: true,
  rounds: [
    {
      id: "jr-jua-1", at: daysAgo(2),
      pitch: "Jua Office Coffee: specialty Kenyan coffee for your office. We install a machine, deliver fresh beans every week and send a barista monthly. KES 38,000 a month for offices of 20 to 200. Free trial week.",
      audience: "Office and facilities managers at Nairobi offices with 20–200 staff", price: "KES 38,000 a month",
      verdicts: verdicts([
        ["customer", "ng", "A free trial week makes this an easy yes to test.", "I manage a 40-person office. Installation, beans and a barista with no upfront risk is simple to try.", "Tell me roughly how many cups a month the price covers."],
        ["skeptic", "g", "We have a kettle and instant coffee. Why 38k?", "38,000 looks big next to a tin of instant. I can't see what it costs per person, so it feels like a luxury.", "Give the per-person price: about KES 63 a person a day for 30 staff, less than one café coffee."],
        ["engineer", "ng", "Install, beans and monthly barista visits are deliverable.", "Nothing here is hard to run. The gap is what happens when a machine breaks mid-week.", "Promise a same-day machine swap.", "medium"],
        ["lawyer", "ng", "Low risk if the contract covers it.", "Food hygiene for the barista visits and liability for the machine belong in the service agreement, not the pitch.", "Put hygiene certification and machine liability in the contract."],
        ["competitor", "g", "I lease machines with free beans for less.", "Price is the first thing an office compares, and I can undercut on that. You haven't given a reason beyond 'specialty'.", "Compete on quality and service: beans roasted that week, calibration, barista visits, same-day swaps."],
        ["investor", "ng", "Recurring revenue with strong retention.", "Monthly contracts with high renewal are a good business, and the trial is cheap acquisition.", "Report trial-to-paid conversion."],
        ["marketer", "g", "'Specialty Kenyan coffee for your office' is a description, not a reason.", "Nobody buys a description. There's no outcome or pain point for an office manager to act on.", "Lead with the outcome: stop the afternoon coffee run, keep the team in the building."],
        ["partner", "ng", "I'd recommend it to our members.", "As a co-working space, a good coffee partner makes us look good, and the trial makes it low-risk to introduce.", "Offer our members a referral perk."],
        ["cfo", "g", "38k is a line I'd have to defend.", "I need a comparison: per head, against what staff already spend leaving the office for coffee.", "Show the per-head cost and the time saved from fewer coffee runs."],
      ]),
      summary: "Not guilty, 5–4: close. Buyers and partners like the trial, but the skeptic, competitor, marketer and CFO need a reason beyond 'specialty' and a price that reads per person, not per month.",
      objections: [
        "KES 38,000 reads as a luxury: show the per-person price.",
        "No outcome: sell the end of the coffee run, not the beans.",
        "Price competitors undercut: compete on freshness and service guarantees.",
      ],
      revisedPitch: "Stop the afternoon coffee run. Jua Office Coffee gives your team café-quality Kenyan coffee at their desks for about KES 63 a person a day (30 staff). We install the machine, deliver beans roasted that week, send a barista every month and swap a broken machine the same day. KES 38,000 a month for 20 to 200 staff. Try it free for a week.",
      changes: [
        "Opened with the outcome (no more coffee runs) instead of a description.",
        "Added the per-person price for a 30-person office.",
        "Added freshness and a same-day swap as the reasons to pick Jua over cheaper leases.",
      ],
    },
  ],
};

export function seedJuryCases(): JuryCase[] {
  return [emmaCase, juaCase];
}
