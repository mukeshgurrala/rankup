import type { Metadata } from 'next';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';

export const metadata: Metadata = { title: 'Terms' };

const sections: [string, string][] = [
  ['What RankUp provides', 'RankUp lists products on a public leaderboard ordered by the amount each product has bid. A bid buys placement on that leaderboard and nothing else. We make no guarantee of traffic volume, conversions, revenue, or search visibility.'],
  ['Payment and refunds', 'All bids are one-time payments in US dollars and are non-refundable. Submitting a bid authorises an immediate charge. A bid affects your rank only after the payment is verified on our servers.'],
  ['Ranking mechanics', 'Rank is determined solely by standing bid, highest first, with earlier listings winning ties. We may correct the board to reverse fraudulent, disputed, or charged-back payments.'],
  ['Acceptable listings', 'You must own or be authorised to represent the product you list. We may remove, without refund, listings that are illegal, deceptive, malicious, sexually explicit, or that impersonate another party.'],
  ['Link treatment', 'Outbound links are nofollow and carry UTM parameters. Listings are advertising placements and are not editorial endorsements.'],
  ['Availability', 'The service is provided as-is, without warranty. We do not guarantee uninterrupted availability and may change or discontinue features at any time.'],
  ['Liability', 'To the maximum extent permitted by law, our total liability for any claim relating to the service is limited to the amount you paid us in the preceding twelve months.'],
  ['Changes', 'We may update these terms. Material changes will be reflected by the revision date shown on this page.'],
];

export default function TermsPage() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Legal" title="Terms of service">
        The agreement between RankUp and anyone placing a bid.
      </PageIntro>

      <div className="card divide-y divide-hairline overflow-hidden">
        {sections.map(([title, body]) => (
          <section key={title} className="p-5">
            <h2 className="text-[14px] font-semibold text-ink-black">{title}</h2>
            <p className="t-body-sm mt-1.5">{body}</p>
          </section>
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] text-black/40">
        These terms are a starting point and are not legal advice. Have a lawyer review them before
        taking real payments.
      </p>
    </ContentPage>
  );
}
