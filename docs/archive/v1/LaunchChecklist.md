# EMMA: Launch checklist

Everything that needs LionsLane's own accounts or decisions, in order. Code is ready for all of it.

## 1. Supabase (database + sign-in)
1. Create a project at supabase.com (region: closest to Kenya available, e.g. EU/Frankfurt). Use the **Pro** plan before taking payments (daily backups + point-in-time recovery).
2. SQL editor → run `supabase/migrations/20261009120000_init.sql` (or `supabase link` + `supabase db push`).
3. Project settings → API: copy the **URL**, the **publishable key** and the **secret key**.
4. Authentication → Providers: enable **Email** (OTP codes). Email template "Magic Link": make sure it includes `{{ .Token }}` so users get a 6-digit code.
5. Authentication → SMTP: connect a custom sender (e.g. Resend, domain `emma.<yourdomain>`). **Required**: the default sender only allows a few emails an hour and can't use custom templates on new free projects.
6. Optional: enable **Google** provider; redirect URL `https://<app domain>/auth/callback`.
7. Authentication → URL configuration: Site URL = your app URL; add the app URL to redirect allow-list.
8. Make the LionsLane team staff: `update profiles set is_staff = true where id = '<user id>';` (server-only column).

## 2. Vercel (web + API)
1. Push the `emma` folder to a GitHub repository (private).
2. Import it in Vercel (framework: Next.js, root: `emma`).
3. Environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://emma.lionslane.co.ke`)
   - `NEXT_PUBLIC_COMPANY_LEGAL_NAME`, `NEXT_PUBLIC_COMPANY_ADDRESS`, `NEXT_PUBLIC_COMPANY_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL`, `NEXT_PUBLIC_COMPANY_PHONE`
   - Payments (below), and `CORS_ORIGINS` only if a web build of the mobile app is hosted elsewhere.
4. Add the custom domain. Enable Web Analytics. Add a Firewall rate-limit rule for `/api/*` (e.g. 60 requests/minute per IP).

## 3. Payments
**Stripe (cards).** Stripe doesn't onboard Kenya-registered businesses directly; use a supported entity or swap the card processor for Paystack/Flutterwave (one module: `src/lib/server/billing.ts`).
1. Create products "EMMA Pro" (KES 500/month) and "EMMA Max" (KES 1,500/month); copy the price IDs.
2. Env: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_MAX`.
3. Webhook endpoint `https://<app>/api/billing/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.created/updated/deleted` → `STRIPE_WEBHOOK_SECRET`.
4. Turn on the customer portal (cancel, update card).

**M-Pesa (Daraja STK push).**
1. Apply for Lipa na M-Pesa Online on a PayBill or Till; create a Daraja app (sandbox first).
2. Env: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV` (`sandbox`/`production`), `MPESA_CALLBACK_SECRET` (random 32+ characters). For a Till: `MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline` and `MPESA_PARTYB=<till>`.
3. Test with the sandbox number, then go live.

## 4. Legal and compliance
- Kenyan advocate reviews `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/refunds` (drafts in `src/app/legal/content.tsx`).
- Register with the ODPC as data controller/processor.
- Data processing agreement template for business customers (Anthropic, Supabase, Vercel, Stripe, Safaricom named as sub-processors).
- Confirm the refund window (draft: 7 days on the first payment) and VAT position with the accountant.

## 5. Mobile (after the web is live)
1. `mobile/.env`: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_API_URL=https://<app>`.
2. Test: `cd mobile && npx expo start` → scan the QR code in Expo Go; `npx expo start --web` for Chrome.
3. Accounts: Apple Developer (USD 99/year), Google Play Console (USD 25 once).
4. Confirm the bundle ID `co.lionslane.emma` (change in `mobile/app.json` if LionsLane prefers another).
5. `npx eas-cli@latest build --platform all` then `npx eas-cli@latest submit`. Listing copy: `docs/StoreListing.md`.
6. Before selling plans inside the apps: add in-app purchases (RevenueCat), or the stores will reject the build.

## 6. Go-live checks
- Sign up with a fresh email → onboarding → starter plan appears → approve → calendar updated.
- Two accounts can't see each other's workspaces.
- Free account hits its brief limit → upgrade sheet → M-Pesa sandbox payment → plan shows Pro.
- `npm audit` clean, `npm run build` passes, Lighthouse accessibility ≥ 95 on landing and sign-in.
