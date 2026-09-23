import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';

export const metadata: Metadata = { title: 'Rules' };

const rules: [string, string][] = [
  [
    'Rank is a pure sort by bid',
    'Products are ordered by their standing bid, highest first. Ties break in favour of whoever listed earlier, so an established listing is never displaced by a latecomer matching its number.',
  ],
  [
    'Claiming a rank costs $1 more',
    'To take rank #N you must bid at least one dollar more than the product currently holding it. The server re-checks this price the moment before you pay, so a stale page can never underpay.',
  ],
  [
    'Nobody is removed when outbid',
    'Because rank is a sort, an outbid product simply moves to the position its bid still earns. It keeps its listing, its clicks and its history — it does not fall off the board.',
  ],
  [
    'Your standing bid is your highest bid',
    'Bidding again raises your position only if the new bid is higher. Repeat bids are cumulative for revenue but only the maximum sets your rank.',
  ],
  [
    'Today vs all-time',
    'The all-time board ranks by your highest verified bid ever. The Today board ranks only bids placed during the current UTC day and resets at midnight UTC.',
  ],
  [
    'All bids are non-refundable',
    'Every bid is a one-time payment for placement, not a subscription or a deposit. Refunded payments are removed from the board and from revenue totals.',
  ],
  [
    'Payments are verified server-side',
    'A bid only affects rank after its signature is verified on our server and recorded in a single database transaction. Replaying a payment cannot create a second bid.',
  ],
  [
    'Attribution and revenue',
    'Outbound links carry utm_source=rankup so you can measure the traffic you receive. RankUp keeps 100% of bid revenue and shares none of it with listed products.',
  ],
];

export default function RulesPage() {
  return (
    <ContentPage>
      <PageIntro eyebrow="How it works" title="Rules">
        RankUp is an attention market. Position is bought openly, the price of every rank is public,
        and nothing about the ordering is hidden.
      </PageIntro>

      <ol className="card divide-y divide-hairline overflow-hidden">
        {rules.map(([title, body], i) => (
          <li key={title} className="grid gap-3 p-5 sm:grid-cols-[28px_1fr]">
            <span className="font-mono text-[13px] tabular-nums text-black/30">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-ink-black">{title}</h2>
              <p className="t-body-sm mt-1.5">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 text-center">
        <Link href="/claim?rank=1" className="btn btn-primary btn-lg">
          Claim a rank
        </Link>
      </div>
    </ContentPage>
  );
}
