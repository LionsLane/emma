# EMMA: MVP Scope (v1)

What v1 is, and what it is not. Anything not on the "in" list waits.

## In v1
- Accounts: email code (OTP) sign-in, Google on web, account deletion, data export.
- Onboarding: 3 questions → EMMA drafts the business profile → starter 2-week calendar proposed.
- Command Center: brief, stream, proposals (approve / discard), threads saved server-side, usage meter.
- Surfaces: Dashboard, Content Calendar, Campaigns, Leads (kanban), Email Hub, Content Library, Catalog, ROI & Compliance, Business profile (the six inputs).
- Plans: Free / Pro KES 500 / Max KES 1,500 with enforced limits and cost caps.
- Payments: M-Pesa STK push (30 days prepaid) and Stripe cards (recurring), billing page.
- Pitch Jury: staff + Max.
- Legal: privacy policy, terms, cookie notice, refund policy, data processing summary.
- Mobile app (iOS + Android, Expo): sign in, brief, approve, calendar list, leads list (tap to call / WhatsApp), plan and usage.
- Security: RLS on every table, server-side history, quotas, rate limits, headers, error boundaries.

## Not in v1
- Publishing to Instagram/Facebook/TikTok/LinkedIn or WhatsApp sending.
- Syncing live data from Meta Ads, Google Ads, GA4 or email providers.
- In-app purchases on iOS/Android (mobile shows the plan; buying happens on the web until RevenueCat IAP is added, see DevelopmentPlan).
- Push notifications, Monday brief email (v1.1).
- Team invites UI beyond the owner (Max seats activate in v1.1).
- Image/video generation.
- Languages other than English (Swahili copy in v1.1).
