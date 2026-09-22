# RankUp launch checklist

## 1. Supabase

- Run `supabase/migrations/001_initial.sql` in the Supabase SQL Editor.
- Add `SUPABASE_URL` to Vercel.
- Add the complete `SUPABASE_SECRET_KEY` to Vercel.
- Confirm the `startups`, `payments`, and `boosts` tables exist.
- Confirm `startup_leaderboard` view exists.

## 2. Razorpay

- Start with Razorpay test credentials.
- Add `RAZORPAY_KEY_ID` to Vercel.
- Add `RAZORPAY_KEY_SECRET` to Vercel.
- Complete a successful test checkout.
- Confirm exactly one payment and one boost record are created.
- Repeat the verification request and confirm no duplicate boost is created.
- Enable USD/international payments in Razorpay, or change the application back to INR if the account only accepts INR.
- Replace test credentials with live credentials only after the test flow succeeds.

## 3. Vercel

- Import the repository into Vercel.
- Add all four environment variables for Production, Preview, and Development as appropriate.
- Deploy.
- Add the production domain.
- Redeploy after changing environment variables.

## 4. Final checks

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

- Homepage returns 200.
- Submit, Today, Daily, Categories, About, and Rules return 200.
- Product URL normalization works.
- Product logo and initials fallback work.
- Duplicate domains are rejected.
- Real payment success updates ranking.
- Invalid signatures and repeated verification do not create boosts.
- Mobile header and submission form remain usable.
- No secrets appear in browser code or Git.

## Required environment variables

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```
