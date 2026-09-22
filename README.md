# RankUp

A pay-to-rank product directory built with Next.js, TypeScript, Tailwind CSS, Supabase, and Razorpay.

## Required environment variables

Only four application variables are used:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Copy the template before local development:

```bash
cp .env.example .env.local
```

Never commit `.env.local`. `SUPABASE_SECRET_KEY` and `RAZORPAY_KEY_SECRET` are server-only.

## Local development

```bash
npm install
npm run dev
```

Without credentials, the submission flow runs in clearly labeled preview mode. No listing or payment is represented as persisted or verified.

## Production setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial.sql` in the Supabase SQL Editor.
3. Add the four environment variables to `.env.local` and Vercel.
4. Use Razorpay test keys until the complete payment flow is verified.
5. Run `npm run typecheck && npm run build`.
6. Deploy to Vercel.

## Security

Razorpay orders and signature verification happen server-side. Database writes use a server-only Supabase secret. A database transaction function and unique `boosts.payment_id` enforce payment idempotency.
# rankup
