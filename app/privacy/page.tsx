import type { Metadata } from 'next';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';

export const metadata: Metadata = { title: 'Privacy' };

const sections: [string, string][] = [
  ['What we collect', 'For listings: product name, URL, tagline, category and an optional contact email. For visitors: a randomly generated session identifier stored in your browser, used only to count unique visitors and who is currently online.'],
  ['What we do not collect', 'We do not store your name, IP address, or device fingerprint for analytics, and we do not build advertising profiles. The session identifier is a random value that is not linked to any personal data.'],
  ['Payments', 'Card details are handled entirely by our payment processor and never reach our servers. We store only the order and payment identifiers needed to verify a bid and to reconcile refunds.'],
  ['Click measurement', 'When you click an outbound product link we record that a click occurred for that listing. We record the count only, never who clicked.'],
  ['Cookies and storage', 'We use browser localStorage for the session identifier. No third-party advertising or tracking cookies are set.'],
  ['Data retention', 'Listings and bid records are retained for as long as the listing is public, since the leaderboard is a permanent public record. Session records are retained in aggregate.'],
  ['Your rights', 'You can request access to, correction of, or deletion of listing data associated with your product by contacting us. Bid records that underpin the public leaderboard may be retained in anonymised form.'],
];

export default function PrivacyPage() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Legal" title="Privacy policy">
        What RankUp stores, why, and what it deliberately does not collect.
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
        This policy is a starting point and is not legal advice. Review it against GDPR, DPDP or
        other applicable law before launch.
      </p>
    </ContentPage>
  );
}
