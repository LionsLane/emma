import type { ReactNode } from "react";
import { COMPANY } from "@/lib/company";
import { PLANS, formatKES } from "@/lib/plans";

// Draft legal text for EMMA. Must be reviewed by a Kenyan advocate before
// launch (see docs/15Legal.md). Business details come from COMPANY.

export const UPDATED = "9 October 2026";

const contact = (
  <>
    {COMPANY.privacyEmail ? <a className="link" href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a> : "the contact details on our website"}
    {COMPANY.address ? `, or write to ${COMPANY.legalName}, ${COMPANY.address}` : ""}
  </>
);

export interface LegalDoc { title: string; intro: string; body: ReactNode }

export const DOCS: Record<string, LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    intro: `How ${COMPANY.legalName} collects, uses and protects personal data when you use EMMA, under Kenya's Data Protection Act, 2019.`,
    body: (
      <>
        <h2>Who we are</h2>
        <p>EMMA is operated by {COMPANY.legalName} ({COMPANY.city}). For your account and billing data we are the <b>data controller</b>. For personal data you put into your workspace about your own customers and leads, <b>your business is the controller</b> and we process it on your instructions.</p>

        <h2>What we collect</h2>
        <ul>
          <li><b>Account</b>: your email address, name, and sign-in records.</li>
          <li><b>Workspace content</b>: your business profile, calendar, campaigns, leads, emails, library and notes, and your conversations with EMMA.</li>
          <li><b>Leads</b>: contact details you add, and business contact details EMMA finds in public sources (always marked unverified and without consent).</li>
          <li><b>Usage</b>: how many briefs and searches you use, and the AI processing they needed, so we can enforce plan limits and costs.</li>
          <li><b>Payments</b>: for M-Pesa, the phone number and the receipt. Card payments are handled by Stripe; we never see or store card numbers.</li>
          <li><b>Technical</b>: server logs (including IP address) kept briefly for security, and anonymous, cookie-free page statistics.</li>
        </ul>

        <h2>Why we use it (lawful basis)</h2>
        <ul>
          <li>To provide EMMA under our contract with you: running your workspace, generating your plans, billing.</li>
          <li>Our legitimate interests: keeping the service secure, preventing abuse, and improving the product from aggregated usage.</li>
          <li>Legal obligations: keeping financial records.</li>
          <li>Your consent, where we ask for it (for example product news by email). You can withdraw it at any time.</li>
        </ul>
        <p>We do not sell personal data and we do not use your workspace to train AI models.</p>

        <h2>Who processes it for us</h2>
        <table className="legal-table">
          <thead><tr><th>Provider</th><th>What for</th><th>Where</th></tr></thead>
          <tbody>
            <tr><td>Supabase</td><td>Database and sign-in</td><td>Cloud region chosen at setup</td></tr>
            <tr><td>Vercel</td><td>Hosting the website and API</td><td>Global</td></tr>
            <tr><td>Anthropic</td><td>Generating EMMA&apos;s responses (Claude)</td><td>United States</td></tr>
            <tr><td>Stripe</td><td>Card payments</td><td>Global</td></tr>
            <tr><td>Safaricom</td><td>M-Pesa payments</td><td>Kenya</td></tr>
          </tbody>
        </table>
        <p>When you brief EMMA, your message, the conversation and the relevant parts of your workspace are sent to Anthropic to generate the reply. Under its commercial terms, Anthropic does not use this data to train its models. Some providers process data outside Kenya; we rely on contractual safeguards for those transfers as the Act requires.</p>

        <h2>How long we keep it</h2>
        <p>Workspace and account data for as long as your account is open. When you delete your account, we delete it within 30 days, except records the law requires us to keep (such as payment records, kept for the period required by Kenyan tax law). Security logs are kept for up to 90 days.</p>

        <h2>Your rights</h2>
        <p>You can ask to access, correct, export or delete your personal data, object to or restrict how we use it, and withdraw consent. You can export your workspace and delete your account yourself in the app. For anything else, contact us at {contact}. If you&apos;re unhappy with our answer, you can complain to the Office of the Data Protection Commissioner (ODPC).</p>

        <h2>Security</h2>
        <p>Data is encrypted in transit, every business&apos;s data is isolated at the database level, secret keys never reach your browser, and access is limited to people who need it. If a breach affects your personal data, we&apos;ll notify the ODPC within 72 hours and tell you without undue delay.</p>

        <h2>Children</h2>
        <p>EMMA is for businesses and people aged 18 and over.</p>

        <h2>Changes</h2>
        <p>We&apos;ll post changes here and tell you in the app or by email if they matter.</p>
      </>
    ),
  },

  terms: {
    title: "Terms of Service",
    intro: `The agreement between you and ${COMPANY.legalName} for using EMMA.`,
    body: (
      <>
        <h2>The service</h2>
        <p>EMMA is an AI marketing assistant. It drafts plans, content, campaigns, emails and lead lists for you to review. EMMA does not publish or send anything on your behalf; you decide what to approve and what to publish.</p>

        <h2>Your account</h2>
        <p>You must be 18 or over and give accurate details. Keep access to your email secure; you&apos;re responsible for activity in your account.</p>

        <h2>Plans and payment</h2>
        <ul>
          <li>{PLANS.free.name} costs {formatKES(0)} and has the limits shown on the pricing page.</li>
          <li>{PLANS.pro.name} costs {formatKES(PLANS.pro.priceKES)} a month and {PLANS.max.name} {formatKES(PLANS.max.priceKES)} a month.</li>
          <li><b>M-Pesa</b> payments give 30 days of the plan and don&apos;t renew automatically. <b>Card</b> payments renew monthly until you cancel.</li>
          <li>Plan limits (briefs, searches, workspaces, seats, leads and a monthly AI-usage allowance) reset on the 1st of each month (Nairobi time).</li>
          <li>We may change prices with at least 30 days&apos; notice; changes apply from your next period.</li>
        </ul>

        <h2>Acceptable use</h2>
        <p>You agree not to use EMMA to send spam or unsolicited marketing, contact people without a lawful basis, make false or misleading claims, infringe others&apos; rights, or break any law, including the Data Protection Act and consumer protection law. You&apos;re responsible for having consent before marketing to the people in your workspace.</p>

        <h2>AI-generated content</h2>
        <p>EMMA&apos;s drafts can be wrong, out of date or unsuitable. Review everything before you publish it, especially prices, dates, claims, health, financial and legal statements. You are responsible for what you publish. Lead details found by EMMA are unverified until you check them.</p>

        <h2>Your content</h2>
        <p>You own your workspace content and EMMA&apos;s outputs made for you. You give us permission to store and process your content only to provide the service. You can export it at any time.</p>

        <h2>Availability and changes</h2>
        <p>We work to keep EMMA available but can&apos;t promise it will be uninterrupted. We may change or improve features.</p>

        <h2>Liability</h2>
        <p>To the extent the law allows, EMMA is provided as is, and our total liability to you is limited to the amount you paid us in the three months before the claim. Nothing in these terms limits rights you have under Kenyan consumer protection law that can&apos;t be limited.</p>

        <h2>Ending the agreement</h2>
        <p>You can delete your account at any time. We may suspend or close accounts that break these terms, after notice where reasonable.</p>

        <h2>Law</h2>
        <p>These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction.</p>

        <h2>Contact</h2>
        <p>{contact}</p>
      </>
    ),
  },

  cookies: {
    title: "Cookie Notice",
    intro: "Which cookies and browser storage EMMA uses, and why there's no cookie banner.",
    body: (
      <>
        <h2>Strictly necessary only</h2>
        <table className="legal-table">
          <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Lasts</th></tr></thead>
          <tbody>
            <tr><td><code>sb-…-auth-token</code></td><td>Cookie</td><td>Keeps you signed in (set by our sign-in provider, Supabase)</td><td>Until you sign out or the session expires</td></tr>
            <tr><td><code>emma-cloud</code></td><td>Local storage</td><td>Remembers which workspace you last opened</td><td>Until you clear it</td></tr>
          </tbody>
        </table>
        <p>These are needed for the service to work, so they don&apos;t require consent.</p>

        <h2>No tracking cookies</h2>
        <p>We don&apos;t use advertising or social media cookies. Our page statistics (Vercel Web Analytics) are anonymous and don&apos;t use cookies.</p>

        <h2>Card checkout</h2>
        <p>If you pay by card, Stripe&apos;s checkout page sets its own cookies for fraud prevention, under Stripe&apos;s privacy policy.</p>
      </>
    ),
  },

  refunds: {
    title: "Refund Policy",
    intro: "When you can get your money back.",
    body: (
      <>
        <h2>First payment</h2>
        <p>If EMMA isn&apos;t right for you, ask within <b>7 days of your first paid plan payment</b> and we&apos;ll refund it in full, by M-Pesa or to your card.</p>

        <h2>After that</h2>
        <p>Later payments aren&apos;t refunded, but you can stop at any time: M-Pesa plans simply end after the 30 days you paid for, and cancelling a card plan stops the next renewal. You keep your plan until the end of the period.</p>

        <h2>If something went wrong</h2>
        <p>If you were charged and your plan didn&apos;t activate, or you were charged twice, we&apos;ll fix it or refund you in full.</p>

        <h2>How to ask</h2>
        <p>Contact us at {contact} with your account email and the M-Pesa receipt or card receipt. We aim to reply within 2 working days and refund within 7.</p>
      </>
    ),
  },
};
