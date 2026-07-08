# SPBAA Member Payment Portal

A single-page dues / special-assessment payment portal for the Schicke Point
Beach Access Association, backed by Stripe.

## Structure
- `index.html` — the static frontend (served at `/`).
- `api/create-payment-intent.js` — serverless function that creates the Stripe
  PaymentIntent. **It decides the price**, not the browser.
- `api/status.js` — health check at `/api/status`.
- `lib/pricing.js` — dues/assessment amounts and surcharge math (single source
  of truth). Change `DUES_CENTS` to adjust standard dues.
- `lib/cors.js` — optional cross-origin allowlist.

This uses Vercel's zero-config layout: static files at the root, functions in
`/api`. No `vercel.json` needed.

## Environment variables (Vercel → Project → Settings → Environment Variables)
- `STRIPE_SECRET_KEY` — your Stripe secret key (`sk_live_...` in production).
- `ALLOWED_ORIGINS` — optional, comma-separated origins allowed to call the API.
  Leave unset for the normal same-origin case.

Also set `stripePublicKey` in `index.html` to your **publishable** key
(`pk_live_...`) before going live.

## Local development
`npm install`, then `vercel env pull` (once, to create `.env.local`) and
`vercel dev` to run the page and the `/api` functions together.

## What this does NOT do
There is no automatic yearly billing and no server-side record of who has paid
beyond the Stripe Dashboard (each payment carries the member's name, number, and
address in metadata). See the notes from your developer on adding a webhook +
recurring billing if you want those later.
