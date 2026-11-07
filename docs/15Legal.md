# 15 · Legal and Compliance

**EMMA Build Pack v2.0 · 2026-10-15**

Not legal advice. The pages below are drafts written for clarity; **a Kenyan advocate must review them before launch.** Source: `src/app/legal/content.tsx`, served at `/legal/<slug>`. Company details come from `NEXT_PUBLIC_COMPANY_*` env vars; empty fields are hidden, never invented.

## 1. Laws that apply
| Law / rule | What it means for EMMA |
|---|---|
| **Kenya Data Protection Act 2019** + regulations | Register with the ODPC as data controller (and processor for agency workspaces). Lawful basis per purpose, data subject rights, breach notice within 72 hours, cross-border transfer safeguards (Anthropic, Vercel, Supabase, Stripe are outside Kenya). |
| Consumer Protection Act 2012 | Clear prices, honest claims, fair cancellation and refund terms. |
| Kenya Information and Communications Act (unsolicited messages) | EMMA never broadcasts to contacts without consent; consent flag on every lead. |
| Tax rules (KRA, VAT, eTIMS) | Keep payment records for the legal period; confirm VAT registration and invoices with the accountant. |
| App Store Review Guidelines 3.1.1 / Google Play Payments | No in-app purchases or external purchase links in v1 apps; IAP before selling in-app. Account deletion in-app. |
| Anthropic usage policies | No prohibited uses; AI output disclosed as AI-generated and reviewed by a person. |
| Platform terms (Meta, TikTok, LinkedIn, WhatsApp) | v1 doesn't post or message automatically; users publish by hand. v2 integrations need each platform's approval. |

## 2. The four public documents (outline of the drafts)
### Privacy Policy `/legal/privacy`
Who we are · What we collect (account email and name, workspace content, contacts users enter, usage counts, payment references; no card numbers) · Why (lawful basis: contract for the service, legitimate interest for security, consent for marketing) · Who processes it (Supabase, Vercel, Anthropic, Stripe or the card processor, Safaricom) · How long (while the account is open; deleted within 30 days of account deletion except records the law requires; security logs up to 90 days) · Your rights (access, correction, deletion, objection, portability via Export, complaint to the ODPC) · Security · Children (not for under-18s) · Changes.

### Terms of Service `/legal/terms`
The service · Your account · Plans and payment (Free/Pro/Max, M-Pesa prepaid 30 days, cards renew monthly) · Acceptable use (no spam or unsolicited marketing, no contact without a lawful basis, no false claims, consent is the user's responsibility) · **AI-generated content** (EMMA can be wrong; you review and are responsible for what you publish; researched leads are unverified) · Your content (you own it and EMMA's outputs made for you; processed only to provide the service; export any time. Consider adding an explicit "not used to train models" line once the processor terms are confirmed) · Availability and changes · Liability (capped at fees paid in the last 3 months) · Ending the agreement · Law (Kenya) · Contact.

### Cookie Notice `/legal/cookies`
Strictly necessary cookies and storage need no consent (session, CSRF-safe auth, `emma-cloud`, `emma-consent`). Every analytics script (Google Analytics and Vercel Web Analytics) and every other third-party script waits for consent: the consent bar asks first, nothing loads until the visitor taps Allow, No thanks is remembered, and Cookie settings in the footer reopens the choice. Google's sign-in script loads only when the visitor taps Continue with Google. Stripe and Paystack set their own cookies on their checkout pages.

### Refund Policy `/legal/refunds`
First paid-plan payment refunded in full within 7 days · later payments not refunded but plans can stop any time · if something went wrong (double charge, failed activation) we fix or refund · how to ask (privacy/company email).

## 3. In-product legal touchpoints
| Where | What |
|---|---|
| Sign in | "By continuing you agree to the Terms and Privacy Policy" with links |
| Business Profile → Where your data goes | Plain list of processors and what each receives (Anthropic gets the brief and the workspace slices EMMA reads) |
| Brief cards | Review notes for claims about prices, dates, health, legal, certifications |
| Tickets | Verified and consent flags; Record consent action stores who and when (v1.1: consent source text) |
| Footer | Registered name, address, contact from env; legal links |
| Delete account | Type DELETE; explains what's deleted and what's kept (payment records) |

## 4. Business customers (agencies, Max)
- Data Processing Agreement template: EMMA/LionsLane as processor for the agency's client data; sub-processors listed; breach notice; deletion on termination. **To draft with the advocate.**
- Agencies confirm they have the right to load their clients' data.

## 5. Launch legal checklist
| Item | Owner | Status |
|---|---|---|
| Advocate review of all four documents | LionsLane | Open |
| ODPC registration (controller + processor) | LionsLane | Open |
| Registered company name, address, emails, phone in env | LionsLane | Open |
| Refund window confirmed (draft 7 days) | LionsLane | Open |
| VAT / eTIMS position with the accountant | LionsLane | Open |
| DPA template for agencies | LionsLane + advocate | Open |
| Cross-border transfer clause (processors outside Kenya) | Advocate | Open |
| No fake testimonials, logos or unprovable claims on the site | Product | Done |
| Fonts and icons licensed (OFL Google Fonts; own icons and stamp) | Product | Done |
| Accessibility statement page (optional, recommended) | Product | v1.1 |
