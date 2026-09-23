# RankUp

A pay-to-rank product directory and leaderboard. Products are ranked by a public
standing bid; taking any rank costs **$1 more** than whoever currently holds it.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase and Razorpay.

## How ranking works

Rank is a **pure sort**: products are ordered by standing bid, highest first,
with earlier listings winning ties.

- **Claiming rank #N** requires a bid of at least `(bid at #N) + $1`. Unoccupied
  ranks cost $1.
- **Nobody is removed when outbid.** An outbid product simply moves to whatever
  position its bid still earns, keeping its listing, clicks and history.
- **Your standing bid is your highest single bid.** Bidding again only raises you
  if the new bid exceeds the previous one. All bids count toward revenue.
- **All-time** ranks by highest verified bid ever. **Today** ranks only bids
  placed during the current UTC day and resets at midnight UTC.
- All bids are one-time and **non-refundable**. Refunded payments are removed
  from the board and from revenue totals.

The price is re-checked server-side immediately before payment, so a stale page
can never underpay for a rank.

## Data honesty

Every public number — visitors, revenue, product count, bids, clicks — is
counted from this application's own tables at request time. Nothing is seeded,
padded or estimated, so a new deployment honestly reports zeros.

Visitor counts come from a first-party `site_sessions` table keyed by a random
identifier in `localStorage`. No IPs, fingerprints or third-party trackers.

## Environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Database URL (server-only) |
| `SUPABASE_SECRET_KEY` | yes | Service role key (server-only) |
| `RAZORPAY_KEY_ID` | yes | Payment gateway key |
| `RAZORPAY_KEY_SECRET` | yes | Signature verification (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | no | Enables the realtime activity feed |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | Anon key for realtime subscriptions |
| `NEXT_PUBLIC_ANALYTICS_URL` | no | Public analytics dashboard linked from `/stats` |

Never commit `.env.local`. The secret keys are server-only and are never
exposed to the browser.

## Local development

```bash
npm install
npm run dev
```

Without credentials the app runs and every page renders, but the board is empty
and the claim flow reports that the gateway is not configured. No listing or
payment is ever represented as persisted or verified when it is not.

## Database setup

Run both migrations in the Supabase SQL Editor, in order:

1. `supabase/migrations/001_initial.sql` — products, payments, RLS
2. `supabase/migrations/002_bidding.sql` — bids, clicks, sessions, board views

This creates the `product_board`, `product_board_today` and `bid_activity`
views, plus the `verify_payment_and_create_bid`, `register_click` and
`touch_session` functions.

## Currency

Bids are denominated and displayed in **USD**. Razorpay is charged the INR
equivalent at checkout using the fixed `USD_TO_INR` rate in `lib/data.ts`,
because the gateway account is domestic-only. Adjust that constant, or switch
to a gateway that settles USD directly, before taking real money.

## Security

- Razorpay orders are created server-side; the client never sees the secret.
- Signatures are verified with HMAC-SHA256 and a constant-time comparison.
- A bid is recorded inside a single database transaction with a unique
  constraint on `payment_id`, so replaying a payment cannot create a second bid.
- The bid price is validated against the live board before an order is created.
- Outbound product links are `nofollow` and carry `utm_source=rankup`.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Leaderboard with all-time/today toggle, stats, sidebar, pagination |
| `/claim?rank=N` | Two-step claim flow: pick rank and price, then product details |
| `/product/[slug]` | Listing detail with rank, bid history and click count |
| `/categories` | All 29 categories with live listing counts |
| `/category/[slug]` | Per-category ranked board |
| `/stats` | Public stats dashboard |
| `/rules`, `/about`, `/faq`, `/terms`, `/privacy`, `/imprint` | Content pages |

## Before taking real payments

- Replace the placeholder operator details on `/imprint`.
- Have a lawyer review `/terms` and `/privacy`.
- Verify the USD→INR rate, or move to a USD-native gateway.
- Complete a full test-mode checkout and confirm exactly one bid is recorded.
