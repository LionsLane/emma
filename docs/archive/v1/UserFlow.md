# EMMA: User Flows

Every screen must lead somewhere. Arrows are the only ways forward.

## 1. First visit → value (target: under 5 minutes)
```
Landing (/) ──"Start free"──▶ Sign in (/signin): email → 6-digit code
   │                                   │ new user
   └──"See pricing"──▶ #pricing        ▼
                           Onboarding (/app/welcome)
                             1. Business name + what you sell
                             2. Who buys + where you sell (channels)
                             3. Voice (pick a vibe)
                                   │ "Build my plan"
                                   ▼
                           Command Center (/app) — EMMA's first reply streams in
                             with a 2-week starter calendar proposal
                                   │ Approve
                                   ▼
                           Calendar (/app/calendar) with entries in place
```

## 2. Returning user (weekly loop)
```
Open app ─▶ Command Center: "Waiting on you" (pending proposals) + Coming up (key dates) + tasks
   ├─ Approve / discard proposals
   ├─ Brief EMMA (quick commands or own words)
   └─ Surfaces via sidebar (web) / tab bar (mobile)
```

## 3. Hitting a limit → upgrade
```
Brief refused (402) or usage meter ≥ 80% ─▶ Upgrade sheet (plans side by side)
   ├─ M-Pesa: enter number ─▶ PIN prompt on phone ─▶ "Waiting for payment" ─▶ confirmed ─▶ plan active
   │                                                 └─ "Check payment" if it stalls
   └─ Card: Stripe Checkout ─▶ /app/billing?status=success ─▶ plan active (polls until webhook lands)
```

## 4. Leads
```
Leads (kanban) ─ drag card between stages
   └─ open lead ─▶ sheet: details, consent/verified flags, notes
        ├─ "Draft next touch" ─▶ EMMA proposal
        ├─ Call / WhatsApp (mobile)
        └─ Mark verified / Record consent
```

## 5. Account
```
Avatar menu ─▶ Billing (/app/billing) · Business profile (/app/settings) · Sign out
Business profile ─▶ Export data · Delete account (confirm by typing DELETE)
```

## 6. Mobile (Expo)
```
Sign in (code) ─▶ Tabs: EMMA (chat + approvals) · Calendar · Leads · Account
Account ─▶ plan + usage (upgrades happen on the web in v1)
```

## Screen inventory
| Screen | Route | Reached from | Leads to |
|---|---|---|---|
| Landing | `/` | — | Sign in, Pricing |
| Legal | `/legal/*` | Footer | Landing |
| Sign in | `/signin` | Landing, protected routes | Onboarding or Command Center |
| Onboarding | `/app/welcome` | First sign-in | Command Center |
| Command Center | `/app` | Everywhere | Proposals, all surfaces |
| Surfaces | `/app/{dashboard,calendar,campaigns,leads,email,library,catalog,roi}` | Sidebar / ⌘K | Ask EMMA drawer, detail sheets |
| Pitch Jury | `/app/jury` | Sidebar (staff/Max) | Hand to EMMA |
| Billing | `/app/billing` | Avatar menu, upgrade sheet | M-Pesa / Stripe |
| Business profile | `/app/settings` | Avatar menu, sidebar | Export, delete |
