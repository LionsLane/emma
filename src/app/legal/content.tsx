import type { ReactNode } from "react";
import { COMPANY } from "@/lib/company";
import { PLANS, formatKES } from "@/lib/plans";

// Draft legal text for EMMA. Must be reviewed by a Kenyan advocate before
// launch (see docs/15Legal.md). Business details come from COMPANY.

export const UPDATED = "7 November 2026";

const mail = (addr: string) => <a className="link" href={`mailto:${addr}`}>{addr}</a>;
const securityContact = COMPANY.securityEmail ? mail(COMPANY.securityEmail) : "the contact details on our website";
const supportContact = COMPANY.email ? mail(COMPANY.email) : "the contact details on our website";
const billingContact = COMPANY.billingEmail ? mail(COMPANY.billingEmail) : "the contact details on our website";

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
          <li><b>Account</b>: your email address, name, and sign-in records. If you choose Google sign-in, Google shares your name and email address with us.</li>
          <li><b>Sign-in security</b>: the two-step verification methods you add. For an authenticator app, our sign-in provider holds the shared secret; for a passkey, only a public key is stored. Your fingerprint, face or screen lock never leaves your device. A phone number, if you add text-message codes.</li>
          <li><b>Workspace content</b>: your business profile, calendar, campaigns, leads, emails, library and notes, and your conversations with EMMA.</li>
          <li><b>Leads</b>: contact details you add, and business contact details EMMA finds in public sources (always marked unverified and without consent).</li>
          <li><b>Search &amp; AI</b>: the public web address you ask EMMA to audit, and the results (page title, headings, structured data, and whether AI crawlers may read the site), kept in your workspace. EMMA only reads public pages; it never logs in or reads private addresses.</li>
          <li><b>Smart links</b>: when someone opens one of your short links, we record the time, the type of device, the country, the website they came from (its name only) and an anonymous number that changes every day, so you can count visitors without anyone being identified. We don&apos;t store IP addresses for clicks and the links set no cookies.</li>
          <li><b>Usage</b>: how many briefs, searches, website audits and AI-visibility checks you use, and the AI processing they needed, so we can enforce plan limits and costs.</li>
          <li><b>Payments</b>: for M-Pesa, the phone number and the receipt. Card payments are handled by Stripe; we never see or store card numbers.</li>
          <li><b>Technical</b>: server logs (including IP address) kept briefly for security, and anonymous, cookie-free page statistics.</li>
        </ul>

        <h2>Why we use it (lawful basis)</h2>
        <ul>
          <li>To provide EMMA under our contract with you: running your workspace, generating your plans, billing.</li>
          <li>Our legitimate interests: keeping the service secure, preventing abuse, and improving the product from aggregated usage.</li>
          <li>Legal obligations: keeping financial records.</li>
          <li>Your consent, where we ask for it (for example product news by email, or Google Analytics cookies). You can withdraw it at any time.</li>
        </ul>
        <p>We do not sell personal data and we do not use your workspace to train AI models.</p>

        <h2>Who processes it for us</h2>
        <table className="legal-table">
          <thead><tr><th>Provider</th><th>What for</th><th>Where</th></tr></thead>
          <tbody>
            <tr><td>Supabase</td><td>Database and sign-in</td><td>Frankfurt, Germany (EU)</td></tr>
            <tr><td>Vercel</td><td>Hosting the website and API, and anonymous page statistics, only if you allow analytics</td><td>Global</td></tr>
            <tr><td>Brevo</td><td>Sending sign-in codes and account emails</td><td>European Union</td></tr>
            <tr><td>Cloudflare</td><td>Our domain name and forwarding of our support email addresses</td><td>Global</td></tr>
            <tr><td>Google</td><td>Google sign-in, only if you choose it; Google Analytics page statistics, only if you allow analytics cookies</td><td>Global</td></tr>
            <tr><td>Anthropic</td><td>Generating EMMA&apos;s responses (Claude)</td><td>United States</td></tr>
            <tr><td>Stripe</td><td>Card payments</td><td>Global</td></tr>
            <tr><td>Paystack</td><td>M-Pesa and card payments through Paystack&apos;s checkout</td><td>Global</td></tr>
            <tr><td>Safaricom</td><td>M-Pesa payments</td><td>Kenya</td></tr>
          </tbody>
        </table>
        <p>When you run an AI-visibility check, your business name, website, location and the searches you entered are sent to Anthropic, which runs those web searches. When you brief EMMA, your message, the conversation and the relevant parts of your workspace are sent to Anthropic to generate the reply. Under its commercial terms, Anthropic does not use this data to train its models. Some providers process data outside Kenya; we rely on contractual safeguards for those transfers as the Act requires.</p>

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
        <p>Questions about EMMA or these terms: {supportContact}{COMPANY.address ? `, or write to ${COMPANY.legalName}, ${COMPANY.address}` : ""}. Payments: {billingContact}. Privacy: {contact}.</p>
      </>
    ),
  },

  cookies: {
    title: "Cookie Notice",
    intro: "Which cookies and browser storage EMMA uses, and what we ask before any analytics runs.",
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

        <h2>Analytics cookies, only if you allow them</h2>
        <p>We ask before any analytics runs. If you tap <b>Allow</b>, Google Analytics sets the cookies below and Vercel Web Analytics (anonymous, no cookies) counts page views, so we can see which pages help people. If you tap <b>No thanks</b>, or don&apos;t choose, neither analytics script loads and nothing about your visit is sent to either. Advertising features, Google signals and ad personalisation are switched off.</p>
        <table className="legal-table">
          <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Lasts</th></tr></thead>
          <tbody>
            <tr><td><code>_ga</code></td><td>Cookie</td><td>Google Analytics: tells visits apart, without your name or email. Shared with the Lions Lane website (lionslane.co.ke), which has its own cookie choice</td><td>2 years</td></tr>
            <tr><td><code>_ga_E9PQVEK9RS</code></td><td>Cookie</td><td>Google Analytics: keeps the state of a visit</td><td>2 years</td></tr>
            <tr><td><code>emma-consent</code></td><td>Local storage</td><td>Remembers your cookie choice</td><td>Until you clear it</td></tr>
          </tbody>
        </table>
        <p>You can change your mind at any time with <b>Cookie settings</b> at the bottom of our pages. Choosing No thanks stops EMMA&apos;s analytics and removes both Google Analytics cookies (<code>_ga</code> and <code>_ga_E9PQVEK9RS</code>). The Lions Lane website (lionslane.co.ke) asks its own question; if you allowed analytics there, it sets a new <code>_ga</code> on your next visit to it.</p>

        <h2>Google sign-in</h2>
        <p>Google&apos;s sign-in script loads only when you tap <b>Continue with Google</b>. Opening the sign-in page sends nothing to Google.</p>

        <h2>No advertising cookies</h2>
        <p>We don&apos;t use advertising or social media cookies.</p>

        <h2>Payment pages</h2>
        <p>If you pay by card through Stripe, or by M-Pesa or card through Paystack, their checkout pages set their own cookies for security and fraud prevention, under their own privacy policies.</p>
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
        <p>Email {billingContact} with your account email and the M-Pesa, Paystack or card receipt. We aim to reply within 2 working days and refund within 7.</p>
      </>
    ),
  },

  "acceptable-use": {
    title: "Acceptable Use Policy",
    intro: "What you may and may not use EMMA for. It is part of our Terms of Service.",
    body: (
      <>
        <h2>Use EMMA to market honestly</h2>
        <p>EMMA is for planning and writing your own business&apos;s marketing and following up people who are interested in it. You approve everything EMMA drafts, so you are responsible for what you publish and send.</p>

        <h2>You must not use EMMA to</h2>
        <ul>
          <li>Send spam, or market to people without a lawful basis, including bought, rented or scraped contact lists.</li>
          <li>Add people to broadcasts or sequences who have not opted in, or ignore someone who asks you to stop.</li>
          <li>Make false or misleading claims about prices, offers, products, results, health, money or qualifications.</li>
          <li>Pretend to be another person or business, or copy another brand&apos;s identity.</li>
          <li>Promote anything illegal in Kenya or where your customers are, or content that is hateful, harassing, sexual involving minors, or that incites violence.</li>
          <li>Spread election or public-health misinformation.</li>
          <li>Break platform rules (for example Meta, TikTok, Google or WhatsApp policies) with the content EMMA drafts.</li>
          <li>Get around plan limits, share one account between businesses beyond your plan&apos;s seats, or resell EMMA without our written agreement.</li>
          <li>Probe, overload or attack the service, try to reach other customers&apos; data, or reverse engineer it. To report a security issue, see our <a className="link" href="/legal/security">Security</a> page.</li>
        </ul>

        <h2>What happens if this policy is broken</h2>
        <p>We may remove content, limit features, or suspend or close the account, with notice where reasonable. Serious or illegal use may be reported to the authorities.</p>

        <h2>Questions</h2>
        <p>{contact}</p>
      </>
    ),
  },

  ai: {
    title: "AI Policy",
    intro: "How EMMA uses artificial intelligence, what it can and cannot do, and how you stay in control.",
    body: (
      <>
        <h2>The models</h2>
        <p>EMMA runs on Claude models made by Anthropic: Claude Haiku 5.5 on Free, Claude Sonnet 5.5 on Pro and Claude Opus 5.5 on Max.</p>

        <h2>What is sent to the AI</h2>
        <p>When you brief EMMA, your message, the conversation and the parts of your workspace EMMA needs for that brief are sent to Anthropic to produce the reply. On Pro and Max, EMMA can also search the web; she shows the sources she used. AI-visibility checks (Pro and Max) report what AI search returned for your searches: whether your business is named is taken from the AI&apos;s answer, and whether your site is cited is checked against the real search results. Results change from day to day, so treat them as a snapshot, not a ranking guarantee. Under Anthropic&apos;s commercial terms, this data is not used to train its models, and we do not use your workspace to train any model.</p>

        <h2>You stay in control</h2>
        <ul>
          <li>EMMA proposes; you decide. Every plan, post, message, lead list and campaign arrives as a card you approve, edit or send back.</li>
          <li>EMMA does not publish posts, send messages or spend money by herself.</li>
          <li>When a fact is missing, such as a price or a date, EMMA leaves it in [brackets] for you to fill in instead of guessing, and adds a review note.</li>
        </ul>

        <h2>Limits you should know</h2>
        <ul>
          <li>AI can be wrong, out of date or unsuitable. Check prices, dates, offers, claims, and any health, financial or legal statement before you publish.</li>
          <li>Businesses and contact details EMMA finds on the web are marked unverified and without consent until you check them.</li>
          <li>The Pitch Jury&apos;s nine jurors are AI personas giving simulated opinions, not real people or market research.</li>
          <li>Some platforms ask you to label AI-generated or AI-edited content. Follow each platform&apos;s rules when you post.</li>
        </ul>

        <h2>Questions or concerns</h2>
        <p>{contact}</p>
      </>
    ),
  },

  security: {
    title: "Security",
    intro: "How EMMA protects your account and data, what you can do, and how to report a problem.",
    body: (
      <>
        <h2>How we protect your data</h2>
        <ul>
          <li>Everything travels encrypted (HTTPS). Each business&apos;s data is separated at the database level, so one account cannot read another&apos;s.</li>
          <li>Sign-in uses one-time email codes, Google or passkeys, so there is no EMMA password to steal.</li>
          <li>Two-step verification is available with an authenticator app or a passkey. Once it is on, EMMA asks for it at every new sign-in.</li>
          <li>Secret keys stay on our servers and never reach your browser. Payment card details are handled by Stripe and never touch EMMA.</li>
          <li>Usage limits, one AI request at a time and size limits protect the service from abuse.</li>
        </ul>

        <h2>What you can do</h2>
        <ul>
          <li>Turn on two-step verification in Business Profile, Security.</li>
          <li>Keep your email account secure, because sign-in codes go there.</li>
          <li>Sign out on shared computers, and remove passkeys from devices you no longer use.</li>
        </ul>

        <h2>Report a security issue</h2>
        <p>If you find a vulnerability, email {securityContact} with the steps to reproduce it. Please don&apos;t access other people&apos;s data, disrupt the service or share the issue publicly before we have fixed it. We aim to acknowledge reports within 3 working days and will keep you updated. We won&apos;t take action against good-faith research that follows these rules.</p>

        <h2>If something goes wrong</h2>
        <p>If a breach affects your personal data, we will notify the Office of the Data Protection Commissioner within 72 hours and tell affected users without undue delay.</p>
      </>
    ),
  },

  dpa: {
    title: "Data Processing Addendum",
    intro: `How ${COMPANY.legalName} processes the personal data your business puts into EMMA, such as your customers and leads. It forms part of the Terms of Service.`,
    body: (
      <>
        <h2>Roles</h2>
        <p>For personal data you add to your workspace about your customers, leads and contacts, your business is the <b>data controller</b> and {COMPANY.legalName} is the <b>data processor</b> under Kenya&apos;s Data Protection Act, 2019.</p>

        <h2>What we do with it</h2>
        <ul>
          <li>We process it only to provide EMMA as you use it, and on your documented instructions.</li>
          <li>People who work on EMMA are bound by confidentiality.</li>
          <li>We protect it with the measures on our <a className="link" href="/legal/security">Security</a> page.</li>
          <li>We use the sub-processors listed in our <a className="link" href="/legal/privacy">Privacy Policy</a>, under written terms with equivalent protection, and will tell you about changes in advance.</li>
          <li>Some sub-processors are outside Kenya; we rely on the safeguards the Act requires for those transfers.</li>
        </ul>

        <h2>Helping you meet your duties</h2>
        <ul>
          <li>You can export or delete your workspace data at any time, which helps you answer access and deletion requests.</li>
          <li>We will help with data subject requests and data protection impact assessments where reasonable.</li>
          <li>We will notify you without undue delay after becoming aware of a breach affecting your data.</li>
        </ul>

        <h2>Your duties</h2>
        <p>You confirm you have a lawful basis, such as consent, for the personal data you add, and that you will use EMMA in line with our <a className="link" href="/legal/acceptable-use">Acceptable Use Policy</a>.</p>

        <h2>When you leave</h2>
        <p>When you delete your workspace or account, we delete the personal data in it within 30 days, except where the law requires us to keep records.</p>

        <h2>Contact</h2>
        <p>{contact}</p>
      </>
    ),
  },
};
