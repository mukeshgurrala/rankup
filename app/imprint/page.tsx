import type { Metadata } from 'next';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';

export const metadata: Metadata = { title: 'Imprint' };

export default function ImprintPage() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Legal" title="Imprint">
        Operator information for this site.
      </PageIntro>

      <div className="card p-6">
        <dl className="space-y-4">
          {[
            ['Service', 'RankUp — a pay-to-rank product leaderboard'],
            ['Operator', 'Not yet published'],
            ['Registered address', 'Not yet published'],
            ['Contact', 'Not yet published'],
            ['Responsible for content', 'Not yet published'],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 sm:grid-cols-[200px_1fr]">
              <dt className="text-[12px] uppercase tracking-[0.12px] text-black/40">{label}</dt>
              <dd className="text-[14px] text-ink-black">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-4 font-mono text-[11px] text-black/40">
        Replace the placeholders above with real operator details before accepting payments — an
        imprint is legally required in several jurisdictions.
      </p>
    </ContentPage>
  );
}
