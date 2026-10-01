# Customer email automation

Purchase confirmations and the four cart reminders use the five existing HTML templates in this directory. Promotional HTML and Outreach campaigns are unchanged.

- Sender: `RESEND_FROM`, currently `Kalėdų Kampelis <labas@kaledukampelis.com>`.
- Required server secrets: `RESEND_API_KEY`, `EMAIL_AUTOMATION_SECRET`, and the existing Stripe secrets. Keep `EMAIL_AUTOMATION_SECRET` stable so existing recovery links remain valid.
- The checkout saves a cart after a valid email is entered. Cart or email changes replace its reminder run. Reminders are due 1, 24, 48, and 72 hours after the latest saved cart.
- Vercel Workflow persists timers and retries across deployments; no cron or open browser is required. Inspect failed runs in the project's Workflows dashboard.
- Successful Stripe payments queue the purchase confirmation and cancel the linked reminder run. Each reminder also checks for a recent paid order for that email, including payments in another browser.
- Recovery links restore the products, variants, quantities, email, and selected add-ons. Links expire after seven days. Unsubscribe stops that cart's reminders without changing promotional subscriptions.
- New purchases retain their original item names and prices in Stripe metadata. Provider idempotency keys and the stored confirmation status prevent duplicate sends on retries.
- `REMINDER_WEBHOOK_URL` receives a report after Resend accepts each reminder, including the recipient, 1/24/48/72-hour reminder type, exact Vilnius send time, and Resend message ID. Discord retries run separately so notification failures cannot resend the email. Provider acceptance confirms sending, not inbox delivery.
- `PRE_PURCHASE_WEBHOOK_URL` and `PRE_PURCHASE_EMAIL_WEBHOOK_URL` report a saved checkout cart and captured email to their separate channels. Each saved cart version queues reports once; duplicate captures do not start new runs. These reports show planned reminders, while actual sends are reported through `REMINDER_WEBHOOK_URL`.

Stripe posts to `https://www.kaledukampelis.com/api/stripe/webhook`. The endpoint's signing secret must match the deployed `STRIPE_WEBHOOK_SECRET`.

Run the focused regression suite with `npm run test:emails`.
