import type { Metadata } from 'next';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';
import { StatsBar } from '@/components/StatsBar';
import { compact, usd } from '@/lib/data';
import { getStats } from '@/lib/queries';

export const metadata: Metadata = { title: 'Live stats' };
export const dynamic = 'force-dynamic';

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL;

export default async function StatsPage() {
  const stats = await getStats();

  const rows: [string, string, string][] = [
    ['Unique visitors', compact(stats.visitors), 'Distinct browser sessions ever recorded'],
    ['Visitors today', compact(stats.visitorsToday), 'Sessions seen since 00:00 UTC'],
    ['Online now', compact(stats.online), 'Sessions active in the last 5 minutes'],
    ['Bid revenue', usd(stats.revenue), 'Sum of every verified, non-refunded bid'],
    ['Products listed', compact(stats.products), 'Active listings in the directory'],
    ['Bids placed', compact(stats.bids), 'Verified payments recorded'],
    ['Days since launch', compact(stats.daysSinceLaunch), 'Counted from 23 September 2026'],
  ];

  return (
    <ContentPage>
      <PageIntro eyebrow="Fully public" title="Live stats">
        Every number here is counted from RankUp&rsquo;s own database at the moment you load the
        page. Nothing is estimated, and nothing is seeded.
      </PageIntro>

      <StatsBar stats={stats} />

      <div className="card mt-6 divide-y divide-hairline overflow-hidden">
        {rows.map(([label, value, note]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="text-[14px] font-medium text-ink-black">{label}</div>
              <div className="t-body-sm mt-0.5">{note}</div>
            </div>
            <div className="font-mono text-[18px] font-semibold tabular-nums text-ink-black">
              {value}
            </div>
          </div>
        ))}
      </div>

      <section className="card mt-6 p-6">
        <h2 className="t-heading-sm text-ink-black">Third-party analytics</h2>
        {ANALYTICS_URL ? (
          <p className="t-body-sm mt-2">
            Independently verified traffic is published at{' '}
            <a
              href={ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-notion-blue hover:underline"
            >
              our public analytics dashboard
            </a>
            .
          </p>
        ) : (
          <p className="t-body-sm mt-2">
            No third-party analytics provider is connected yet. Set{' '}
            <code className="rounded-small bg-black/[0.05] px-1.5 py-0.5 text-[12px]">
              NEXT_PUBLIC_ANALYTICS_URL
            </code>{' '}
            to a public Plausible, Vemetric or DataFast dashboard and it will be linked here. Until
            then, the first-party counts above are the only numbers we publish.
          </p>
        )}
      </section>
    </ContentPage>
  );
}
