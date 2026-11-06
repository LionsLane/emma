# EMMA: Validation

The three questions to answer before building more. Research done 2026-10-09. Prices change often; recheck before quoting them publicly.

## 1. Can we name three real competitors charging money? **Green**

| Competitor | What it is | Price |
|---|---|---|
| **Fursa Connect** (Nairobi) | "AI-powered platform that replaces an entire digital agency team" for East African SMEs: website, AI content, social scheduling, ads, email, M-Pesa. | From **KES 2,999 / month** ([VC4A listing](https://vc4a.com/ventures/fursa-digital-agency/)) |
| **Ocoya** | AI social content + scheduling. | **$15–159 / month** ([ocoya.com/pricing](https://ocoya.com/pricing)) |
| **Predis.ai** | AI-generated social posts, images and short video. | Core about **$19–32 / month** ([Capterra](https://www.capterra.com/p/231932/Predisai/pricing/)) |
| **Jasper** | AI copy and brand voice for marketers. | Pro **$59–69 / seat / month** ([eesel.ai guide](https://eesel.ai/blog/jasper-ai-pricing)) |
| **Vista Social** | Social scheduling with an AI assistant. | Standard **$39 / month** ([SME South Africa](https://smesouthafrica.co.za/?p=62331)) |
| **Freelancers / agencies** (the real incumbent) | A person posting for you. | Freelancers **KES 10,000–80,000 / month**, agencies **KES 15,000–150,000** ([ProGigFinder 2026 guide](https://www.progigfinder.com/blog/how-to-price-your-gig-in-kenya-a-freelancer-pricing-guide-for-2026), [Achi Systems](https://achisystems.co.ke/service/social-media-management-service/)) |

People already pay for this. At **KES 500** EMMA Pro is about a sixth of Fursa's entry price and 20–50× cheaper than a freelancer. The risk flips: at that price, "is it any good?" is the objection, so the first session has to prove it.

## 2. Can we describe the exact person who buys, and what they Google? **Amber (hypothesis, needs interviews)**

**The buyer**: owner-operator of a 1–20 person business in Nairobi or another Kenyan town: salon, boutique, café, clinic, training centre, hardware, real estate agent. Sells through WhatsApp and Instagram, posts when they remember, has either tried a KES 10–25k freelancer and stopped, or does it themselves at night on their phone.

**Their pain, in their words (to confirm)**: "I don't know what to post." "I post for a week then stop." "People ask the price on WhatsApp and disappear." "Marketing agencies are too expensive."

**What they Google before spending money (to confirm with search data)**: "social media manager Kenya price" · "digital marketing agency Nairobi cost" · "how to market my business on Instagram Kenya" · "content ideas for [salon / boutique / restaurant]" · "ChatGPT for business".

**To turn this green**: 10 short interviews with owners this week (LionsLane's client list is the start). Ask what they did the last time they tried to get customers online, what it cost, and why they stopped. Pull keyword volumes for the phrases above.

## 3. Will people pay in the next 30 days? **Red until tested**

Research can't answer this; only a payment can. The 30-day test:
1. Ship Free + Pro with M-Pesa (this build).
2. Offer LionsLane's existing clients and their networks Pro at KES 500, first month on us only if they give feedback.
3. Post three short videos of EMMA building a real calendar in under a minute (the Other Side series audience).
4. **Target: 20 paying Pro users by 2026-11-09.** Under 5 means the offer or the buyer is wrong; go back to the interviews.

**Scorecard**: 1 green, 1 amber, 1 red. The checklist says: one red light → talk to customers. Build continues because the product is needed to run the payment test, but the interviews happen this week, in parallel.

## Also from the checklist

- **First 30 seconds must show value.** Onboarding asks three questions, then EMMA immediately proposes a two-week starter calendar for that business. No empty dashboard on day one.
- **Tracking.** Cookieless product analytics (Vercel Web Analytics) for funnel steps: sign-up → profile done → first brief → first approval → upgrade. Server logs for errors. Add an error tracker (e.g. Sentry) before scaling.
- **Distribution plan.** (1) LionsLane's client book and their referrals. (2) Short-form video: EMMA doing real work in real time. (3) WhatsApp business communities and SME groups. (4) Referral: give a month of Pro, get a month. (5) Partnerships with SME associations and business trainers.
