# 12 · Plans and Billing

**EMMA Build Pack v2.0 · 2026-10-15**

Single source of truth for limits: `src/lib/plans.ts`. Payment code: `src/lib/server/billing.ts` and `src/app/api/billing/*`.

## 1. Plans
| | **Free** | **Pro** | **Max** |
|---|---|---|---|
| Price | KES 0 | **KES 500/month** | **KES 1,500/month** |
| Blurb | Try EMMA on your business. No card needed. | For owners who market every week. | Our best thinking, for growing teams and multiple brands. |
| Model | Claude Haiku 5.5 | Claude Sonnet 5.5 | Claude Opus 5.5 |
| Briefs / month | 15 | 30 | 35 |
| Web searches / month | 0 | 15 | 40 |
| Pitch Jury trials / month | 0 | 0 | 4 |
| Website audits (Search & AI) / month | 5 | 30 | 100 |
| AI-visibility checks / month | 0 | 4 | 12 |
| Active smart links (per workspace) | 10 | 100 | 1,000 |
| Audiences and automations | Included | Included | Included |
| Workspaces / seats | 1 / 1 | 1 / 1 | 3 / 3 |
| Tickets (leads) stored | 50 | 1,000 | Unlimited |
| Monthly AI-cost cap | USD 0.15 | USD 1.90 | USD 5.80 |

Staff (`profiles.is_staff`) get Max limits at no charge.

Website audits use no AI (usage kind `audit`, cost 0). AI-visibility checks use the plan's model with web search (kind `visibility`); each also spends up to 3 of the month's web searches and counts toward the AI-cost cap.

### Unit economics (at KES 130 ≈ USD 1)
| | Pro | Max |
|---|---|---|
| Revenue | USD 3.85 | USD 11.54 |
| AI cost cap | USD 1.90 (49%) | USD 5.80 (50%) |
| M-Pesa / card fees (≈ 1.5–4%) | ≈ USD 0.15 | ≈ USD 0.45 |
| Gross margin at cap | ≥ 46% | ≥ 46% |
Most users won't reach the cap; average margin will be higher. Free users cost ≤ USD 0.15/month each.

### When a limit is hit
| Limit | What happens |
|---|---|
| 80% of briefs | Meter turns warn; one gentle line on the Desk: "3 briefs left this month." |
| 100% of briefs or cost cap | Pad replaced by the limit note; upgrade sheet; resets on the 1st (Africa/Nairobi) |
| Searches used | EMMA works without web search and says so in her note |
| Leads cap | Approval adds up to the cap, reports "skipped"; banner with upgrade |
| Workspaces | New workspace → upgrade sheet; after a downgrade, extra workspaces become read-only |
| Jury | Pro/Free see the upgrade sheet ("Pitch Jury is part of Max") |

## 2. Payment methods
| Method | Model | Renewal | Plan active when |
|---|---|---|---|
| **M-Pesa** (Daraja STK push) | Prepaid 30 days | Manual: pay again (reminder 3 days before, v1.1) | STK query confirms payment and amount |
| **Paystack** (hosted checkout: M-Pesa or card, KES) | Prepaid 30 days | Manual: pay again | Paystack verify API confirms success, KES and amount |
| **Card** (Stripe Checkout, KES prices) | Subscription | Automatic monthly | Signed webhook lands |
| Manual (LionsLane grants) | SQL by staff | — | Immediately |

**Stripe and Kenya:** Stripe doesn't onboard Kenya-registered businesses directly, so Stripe runs on a test account and **Paystack** (chosen 7 Nov 2026: free to open, KES, M-Pesa and cards) is the live route while Daraja waits for a Till or PayBill.

**Which methods a customer sees:** `GET /api/account` returns `payments: { mpesa, paystack, card }`. A method shows only when its keys are set, and test keys (Stripe `sk_test_`, Daraja sandbox, Paystack `sk_test_`) count only for staff in production. With none open, checkout says payments open once the accounts are verified.

## 3. M-Pesa flow
```
User: phone + plan ─▶ POST /api/billing/mpesa/stk
  server: normalise phone (07…/01…/+254… → 2547…/2541…), amount = plan price,
          rate limit 3 prompts / 10 min, Daraja STK push, insert mpesa_payments(pending)
  ◀─ checkoutRequestId
Phone: PIN prompt ─▶ Safaricom ─▶ POST /api/billing/mpesa/callback/<secret>   (hint only)
  server: STK query ─▶ ResultCode 0? amount matches? request ours and unclaimed?
          ─▶ claim (idempotent, unique receipt) ─▶ subscriptions: plan, provider=mpesa,
             current_period_end = max(now, existing end) + 30 days
Browser: polls GET /status every 4 s × 30 ─▶ paid → "You're on Pro until 14 Nov"
         stalled → "I've paid, check now" (runs STK query)
```
- Paying while still active extends from the current end date (no lost days).
- Upgrading Pro → Max via M-Pesa: the new 30 days are Max; remaining Pro days aren't refunded in v1 (stated on the checkout sheet).
- Sandbox: Daraja test credentials and the sandbox phone. Production needs Lipa na M-Pesa Online on a PayBill or Till (`MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline`, `MPESA_PARTYB=<till>` for a Till).

## 3a. Paystack flow
1. `POST /api/billing/paystack/init { plan }`: our row first (`paystack_payments`, reference `emma-<uuid>`, amount from `PLANS`), then Paystack `transaction/initialize` (amount × 100, `KES`, channels `mobile_money` and `card`, callback `/app/billing?paystack=1`). Max 5 checkouts per user per 10 minutes.
2. The customer pays on `checkout.paystack.com`; Paystack sends them back with `?reference=`.
3. `GET /api/billing/paystack/verify?reference=` (owner only) and the signed webhook `POST /api/billing/paystack/webhook` (`charge.success`, HMAC SHA512 of the raw body with the secret key) both call `settlePaystack`, which asks Paystack's verify API, requires `success`, `KES` and the exact amount, claims the row once (`pending → paid`), then `extendPlan` adds 30 days.
4. Paystack dashboard setting: webhook URL `https://emma.lionslane.co.ke/api/billing/paystack/webhook`. Key: `PAYSTACK_SECRET_KEY` (Desktop button 9, then Vercel env).

## 4. Card flow (Stripe)
```
POST /api/billing/stripe/checkout { plan } ─▶ Checkout Session (mode subscription,
  price STRIPE_PRICE_PRO|MAX, client_reference_id = user id, success/cancel → /app/billing?status=…)
Stripe ─▶ POST /api/billing/stripe/webhook (signature verified on raw body)
  checkout.session.completed → retrieve subscription → syncStripeSubscription
  customer.subscription.created|updated|deleted → syncStripeSubscription
     (period end read from the subscription item, API 2026-08-26.dahlia)
Browser returns ─▶ polls /api/account for 30 s ─▶ toast "You're on Pro"
Manage ─▶ POST /api/billing/stripe/portal ─▶ cancel / change card
```
Cancel keeps the plan to the period end; `deleted` sets status canceled and the plan falls back to Free at period end.

## 5. Mobile apps
No purchasing in the iOS/Android apps in v1, and no links or calls to action to buy elsewhere (App Store 3.1.1, Google Play Billing). The Me tab says "Manage plan on the web" only where store rules allow; otherwise it shows the plan without a purchase path. Before selling inside the apps: RevenueCat with App Store / Play products mirroring Pro and Max, receipts verified server-side into `subscriptions` (provider `iap`, new migration).

## 6. Refunds and receipts
- Draft policy (`/legal/refunds`): the first paid-plan payment is refunded in full if asked within **7 days**; later payments aren't refunded, but plans can stop at any time (M-Pesa simply ends after 30 days; card cancellation stops the next renewal). Owner to confirm the window.
- M-Pesa receipt number shown on the Billing page; Stripe sends its own receipts.
- VAT position and tax invoices: confirm with LionsLane's accountant before launch; no "prices include VAT" claim until confirmed.

## 7. Admin
- Grant a plan manually:
```sql
update subscriptions set plan='pro', status='active', provider='manual',
  current_period_end = now() + interval '30 days' where user_id = '<uuid>';
```
- Make someone staff: `update profiles set is_staff = true where id = '<uuid>';`
- Cost per user this month: `select user_id, sum(cost_usd) from usage_events where created_at >= date_trunc('month', now() at time zone 'Africa/Nairobi') group by 1 order by 2 desc;`

## 8. Billing tests (before launch)
1. Free user hits 15 briefs → upgrade sheet → M-Pesa sandbox → plan shows Pro with the right end date.
2. Same payment callback sent twice → plan extended once.
3. Callback with a wrong amount → plan unchanged, payment marked failed.
4. Stripe test card → webhook → Pro; cancel in portal → stays Pro until period end.
5. Webhook with a bad signature → 400, nothing changes.
