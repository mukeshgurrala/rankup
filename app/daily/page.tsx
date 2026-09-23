import Link from 'next/link';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';
import { CharacterMark, Squiggle } from '@/components/Marks';

export default function Daily() {
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date()
  );

  return (
    <ContentPage>
      <PageIntro eyebrow="Fresh every UTC day" title="Daily board">
        Every day gets a clean leaderboard. Boosts made today shape today’s rank; when midnight UTC
        arrives, the board closes and becomes an archive.
      </PageIntro>

      <section className="card-accent p-6 sm:p-8" style={{ background: 'var(--color-sky-wash)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="t-heading-sm text-ink-black">{date}</h2>
              <span className="pill bg-pure-white text-ink-black">● Live</span>
            </div>
            <p className="mt-2 text-[14px] leading-[1.43] text-black/70">
              Open for new products and verified boosts until midnight UTC.
            </p>
          </div>
          <Squiggle color="#02093a" className="mt-2" />
        </div>

        <div className="elev-mockup mt-8 rounded-buttons bg-pure-white px-6 py-12 text-center">
          <div className="mx-auto w-fit">
            <CharacterMark index={3} size={48} />
          </div>
          <h3 className="t-heading mt-5 text-ink-black">Today’s top spot is open</h3>
          <p className="t-editorial mx-auto mt-3 max-w-sm">
            Add your product and claim the first daily rank from $1.
          </p>
          <Link href="/submit" className="btn btn-primary btn-lg mt-7">
            Claim today’s rank
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Opens', '00:00 UTC'],
          ['Closes', '23:59 UTC'],
          ['Archived', 'Permanently'],
        ].map(([label, value]) => (
          <div key={label} className="card p-6">
            <p className="t-caption uppercase text-black/40">{label}</p>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.242px]">{value}</p>
          </div>
        ))}
      </section>
    </ContentPage>
  );
}
