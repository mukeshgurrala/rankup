# RankUp launch checklist

## 1. Supabase

- Run `supabase/migrations/001_initial.sql` in the SQL Editor.
- Run `supabase/migrations/002_bidding.sql` in the SQL Editor.
- Confirm tables exist: `startups`, `payments`, `bids`, `clicks`, `site_sessions`.
- Confirm views exist: `product_board`, `product_board_today`, `bid_activity`.
- Confirm functions exist: `verify_payment_and_create_bid`, `register_click`, `touch_session`.
- Add `SUPABASE_URL` and the complete `SUPABASE_SECRET_KEY` to Vercel.

## 2. Razorpay

- Start with test credentials.
- Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Vercel.
- Confirm the `USD_TO_INR` rate in `lib/data.ts` matches your intended pricing.
- Complete a successful test checkout.
- Confirm exactly one `payments` row and one `bids` row are created.
- Replay the verification request and confirm no duplicate bid is created.
- Confirm the bid amount stored in `bids.amount` is in **USD**, not paise.
- Replace test credentials with live credentials only after the test flow succeeds.

## 3. Realtime and analytics (optional)

- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable
  the live activity feed. The badge on the feed should read `live`, not `snapshot`.
- Enable Realtime on the `bids` table in the Supabase dashboard.
- Add `NEXT_PUBLIC_ANALYTICS_URL` pointing at a public analytics dashboard.

## 4. Bidding rules

- Claiming an occupied rank costs exactly $1 more than the current holder.
- Claiming an unoccupied rank costs $1.
- Submitting a stale price returns a 409 and updates the amount client-side.
- An outbid product keeps its listing and moves down, it is not removed.
- Re-bidding from the same domain raises the existing listing, not a duplicate.

## 5. Legal and content

- Replace all placeholder operator details on `/imprint`.
- Have a lawyer review `/terms` and `/privacy`.
- Confirm the "Built by" credit in the footer points at the right profile.
- Confirm `LAUNCH_DATE` in `lib/data.ts` is the real launch date.

## 6. Final checks

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

- All routes return 200: `/`, `/?board=today`, `/claim`, `/categories`,
  `/category/[slug]`, `/stats`, `/about`, `/rules`, `/faq`, `/terms`,
  `/privacy`, `/imprint`.
- An unknown category slug returns 404.
- An unknown product slug returns 404.
- Favicons load, and initials appear as a fallback for domains without one.
- Outbound links open in a new tab, are `nofollow`, and carry `utm_source=rankup`.
- Clicking an outbound link increments the listing's click count.
- Pagination shows the correct "N–M of T" range and keeps rank numbers absolute.
- Stats show real counts, not placeholders.
- Mobile header, board rows and claim flow remain usable.
- No secrets appear in browser code or in Git.

## Required environment variables

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# optional
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ANALYTICS_URL=
```
