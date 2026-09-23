import Link from 'next/link';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';
import { CharacterMark } from '@/components/Marks';

export default function Today() {
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date()
  );

  return (
    <ContentPage>
      <PageIntro eyebrow="Live until midnight UTC" title="Today’s ranking">
        Today has its own live board. Only verified boosts made during the current UTC day count
        here.
      </PageIntro>

      <section className="card-accent p-6 sm:p-8" style={{ background: 'var(--color-marigold)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="t-heading-sm text-ink-black">{date}</h2>
              <span className="pill bg-pure-white text-ink-black">● Live</span>
            </div>
            <p className="mt-2 text-[14px] leading-[1.43] text-black/70">
              This board resets automatically at midnight UTC.
            </p>
          </div>
          <CharacterMark index={1} size={44} />
        </div>

        <div className="elev-mockup mt-8 rounded-buttons bg-pure-white px-6 py-12 text-center">
          <div className="mx-auto w-fit">
            <CharacterMark index={0} size={48} />
          </div>
          <h3 className="t-heading mt-5 text-ink-black">Claim today’s #1 spot</h3>
          <p className="t-editorial mx-auto mt-3 max-w-sm">
            No verified boosts have been placed today. Start the board with a $1 boost.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link href="/submit" className="btn btn-primary btn-lg">
              Add product &amp; boost
            </Link>
            <Link href="/rules" className="btn btn-ghost btn-lg">
              How rank works
            </Link>
          </div>
        </div>
      </section>
    </ContentPage>
  );
}
