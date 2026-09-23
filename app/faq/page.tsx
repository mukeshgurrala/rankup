import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';

export const metadata: Metadata = { title: 'FAQ' };

const faqs: [string, string][] = [
  [
    'What exactly am I buying?',
    'A position on a public leaderboard. Your listing shows your favicon, name, tagline, category and domain, and links out to your site with UTM attribution so you can measure the traffic.',
  ],
  [
    'How is the price of a rank decided?',
    'It is always one dollar more than the standing bid of whoever holds that rank. If rank #3 is held by a $40 bid, taking #3 costs $41. Unoccupied ranks cost $1.',
  ],
  [
    'What happens to me when someone outbids me?',
    'Nothing is taken away. Rank is a pure sort by bid, so you simply appear at whatever position your bid still earns. You keep your listing, your click count and your history.',
  ],
  [
    'Can I raise my bid later?',
    'Yes. Bid again at any time. Your rank is set by your highest single bid, so a new bid moves you up only if it exceeds your previous one.',
  ],
  [
    'Are bids refundable?',
    'No. Every bid is a one-time, non-refundable payment for placement. If a payment is refunded through the gateway, the bid is removed from the board and from revenue totals.',
  ],
  [
    'Do you take a cut of my sales?',
    'No. There is no revenue share in either direction. You pay for placement once; anything you earn from the traffic is entirely yours.',
  ],
  [
    'Is the link dofollow?',
    'No. Outbound product links are marked nofollow and carry utm_source=rankup. You are buying visitors, not backlinks.',
  ],
  [
    'Do I need an account?',
    'No. Submit your product, pay, and the listing is live. Your listing is identified by its domain, so bidding again from the same domain raises the same entry.',
  ],
];

export default function FaqPage() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Questions" title="FAQ">
        Everything people ask before placing a first bid.
      </PageIntro>

      <div className="card divide-y divide-hairline overflow-hidden">
        {faqs.map(([q, a]) => (
          <details key={q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none text-[14px] font-medium text-ink-black marker:hidden">
              <span className="flex items-center justify-between gap-3">
                {q}
                <span className="font-mono text-[14px] text-black/30 group-open:hidden">+</span>
                <span className="hidden font-mono text-[14px] text-black/30 group-open:inline">−</span>
              </span>
            </summary>
            <p className="t-body-sm mt-2.5">{a}</p>
          </details>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/claim?rank=1" className="btn btn-primary btn-lg">Claim a rank</Link>
      </div>
    </ContentPage>
  );
}
