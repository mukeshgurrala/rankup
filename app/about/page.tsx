import Link from 'next/link';
import { ContentPage, PageIntro, StatCard } from '@/components/SitePrimitives';
import { MarkRow } from '@/components/Marks';

export default function About() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Independent by design" title="About RankUp">
        RankUp is a simple, transparent place for useful products to earn attention. No hidden
        algorithm decides who wins — verified support does.
      </PageIntro>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-6 sm:p-8">
          <h2 className="t-heading-sm text-ink-black">Built for small beginnings</h2>
          <p className="t-body mt-3">
            Anyone can add a product without creating an account. Every listing begins on equal
            footing, and the first boost can be just one dollar.
          </p>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="t-heading-sm text-ink-black">Clear numbers, real momentum</h2>
          <p className="t-body mt-3">
            Payments are verified on the server before they affect rank. Failed, unverified, or
            refunded payments never count.
          </p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard value="Open" label="for public submissions" />
        <StatCard value="$1" label="minimum verified boost" accent />
        <StatCard value="0" label="seeded or fake listings" />
      </div>

      <section
        className="card-accent mt-4 p-8 text-center sm:p-12"
        style={{ background: 'var(--color-sky-tint)' }}
      >
        <MarkRow count={5} className="mb-8" />
        <h2 className="t-heading text-ink-black">Put your product on the board.</h2>
        <p className="t-editorial mx-auto mt-3 max-w-sm">
          One page, no account, and a rank that reflects exactly what people paid to support.
        </p>
        <Link href="/submit" className="btn btn-primary btn-lg mt-7">
          Add your product
        </Link>
      </section>
    </ContentPage>
  );
}
