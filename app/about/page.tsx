import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';
import { StatsBar } from '@/components/StatsBar';
import { getStats } from '@/lib/queries';

export const metadata: Metadata = { title: 'About' };
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <ContentPage>
      <PageIntro eyebrow="Independent by design" title="About RankUp">
        RankUp is a leaderboard where placement is bought in the open. No engagement score, no
        editorial picks, no pay-to-play deals disguised as rankings — just a public price for every
        position.
      </PageIntro>

      <StatsBar stats={stats} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="card p-6">
          <h2 className="t-heading-sm text-ink-black">Why pay for rank?</h2>
          <p className="t-body-sm mt-2">
            Every directory sells attention somehow. Most hide it behind an algorithm. Here the
            mechanism is the product: the price of rank #1 is displayed on the page, and anyone can
            pay it.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="t-heading-sm text-ink-black">What you get</h2>
          <p className="t-body-sm mt-2">
            A permanent listing with your favicon, tagline and category, a dofollow-free outbound
            link carrying UTM attribution, and a public click count so you can verify the traffic
            you were sent.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="t-heading-sm text-ink-black">The numbers are real</h2>
          <p className="t-body-sm mt-2">
            Visitor, revenue and product counts on this site are queried from our own database at
            request time. Nothing is seeded, padded or estimated — an empty platform reports zeros.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="t-heading-sm text-ink-black">How the money works</h2>
          <p className="t-body-sm mt-2">
            Bids are one-time, non-refundable payments verified server-side. RankUp keeps 100% of
            bid revenue and shares none of it with listed products.
          </p>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/claim?rank=1" className="btn btn-primary btn-lg">
          Claim a rank
        </Link>
        <Link href="/rules" className="btn btn-ghost btn-lg">
          Read the rules
        </Link>
      </div>
    </ContentPage>
  );
}
