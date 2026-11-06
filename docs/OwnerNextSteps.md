# EMMA: your next steps (6 November 2026)

Do these in order. Each step says exactly where to click. When a step says "tell Claude", type that in the chat and Claude does the rest.

Never paste a key or password into the chat. Keys go only into the places named below.

---

## Step 1. Give Supabase its email password (Brevo SMTP key)

This lets EMMA send sign-in emails from emma@lionslane.co.ke.

1. In the browser pane, open the **Brevo** tab. (If it isn't open: app.brevo.com, then Settings, then **SMTP & API**.)
2. Click the **SMTP** tab, then **Generate a new SMTP key**.
3. Name it `EMMA Supabase` and click **Generate**.
4. Click **Copy**. Brevo shows the key only once, so copy it now.
5. Open the **Supabase** tab. It is already on Emails, SMTP Settings, with everything filled in except **Password**.
6. Click in the **Password** box and paste (Ctrl+V).
7. Click **Save changes**.
8. Tell Claude: **"SMTP saved"**. Claude switches the email to the 6-digit code and sends you a test sign-in.

## Step 2. Put your keys in EMMA's secret file

1. Open the file by running this in the Terminal:
```bash
notepad "C:\Users\ADMIN\hyperframes claude\emma\.env.local"
```
2. Go to the very bottom of the file and add these lines, pasting each value after the `=` with no spaces:

```
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_ENV=sandbox
```

Where each value comes from:

| Line | Where to copy it |
|---|---|
| `ANTHROPIC_API_KEY` | The key you made in Claude Console ("EMMA production"). It starts with `sk-ant-`. If you did not copy it when you made it, you can't see it again: make a new one and copy that |
| `STRIPE_SECRET_KEY` | Stripe tab, **Home** page, "Secret key". Click it to reveal, then copy. It starts with `sk_test_` |
| `STRIPE_WEBHOOK_SECRET` | Stripe tab, **Developers**, **Webhooks**, "EMMA billing", **Signing secret**, **Reveal**, copy. It starts with `whsec_` |
| `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` | Daraja portal, **My Apps**, your app, the two keys |
| `MPESA_SHORTCODE` and `MPESA_PASSKEY` | Daraja portal, the **Lipa na M-Pesa Online** test credentials (the sandbox shortcode and its passkey) |

3. Save with **Ctrl+S** and close Notepad.
4. Tell Claude: **"keys saved"**. Claude checks the keys work (without showing them), copies them to Vercel and redeploys EMMA.

## Step 3. Turn on EMMA's email addresses (one copy and paste)

1. Open the router file by running this in the Terminal:
```bash
notepad "C:\Users\ADMIN\hyperframes claude\lionslane\infra\mailrouter\worker.js"
```
2. Press **Ctrl+A**, then **Ctrl+C** (this copies everything).
3. Open the **Cloudflare** tab with the code editor for `lionslane-mailrouter`. (If it isn't open: dash.cloudflare.com, then Workers & Pages, then lionslane-mailrouter, then **Edit code**.)
4. Before you paste, look at the code there. Near the top it should end the list with `website: [LIONS], postmaster: [LIONS], abuse: [LIONS]`. If it has other addresses that are not in the Notepad file, stop and tell Claude.
5. Click inside the code, press **Ctrl+A**, then **Ctrl+V**.
6. Click **Deploy**.
7. Tell Claude: **"router deployed"**. Claude sends a test email to emma@ to prove it arrives.

## Step 4. Approve the Lions Lane website update

1. Open https://github.com/LionsLane/lionslane/pull/17
2. Click **Merge pull request**, then **Confirm merge**.
3. Tell Claude: **"merged"**. Claude deploys lionslane.co.ke with the new EMMA tab and /emma page, then checks it live.

## Step 5. Put EMMA's code on GitHub

Claude isn't allowed to create the repository itself. Run this once in the Terminal:
```bash
cd "C:\Users\ADMIN\hyperframes claude\emma" && gh repo create LionsLane/emma --private --source . --remote origin --push
```
Tell Claude: **"EMMA is on GitHub"**.

## Later (not today)

- **Live card payments:** your Stripe EMMA account is a **United States** account in test mode. To take real card payments, Stripe asks you to "Verify your business": legal name (you chose **Lions Lane EMMA**, which must match your registration documents), a US tax number (EIN), an ID and a bank account. If that's hard from Kenya, Paystack is the easier card option for a Kenyan business. Test mode works fully without it.
- **M-Pesa live:** after sandbox works, apply for Lipa na M-Pesa Online on your PayBill or Till, then swap the sandbox values for the live ones and set `MPESA_ENV=production`.
- **Truehost:** nothing to do. The domain is registered at Truehost, but its DNS runs on Cloudflare, which is where emma.lionslane.co.ke was added.
