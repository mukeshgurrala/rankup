import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ClaimRank } from '@/components/ClaimRank';
import { money } from '@/lib/data';
import { getLeaderboard } from '@/lib/queries';
import { StartupLogo } from '@/components/StartupLogo';
import { MarkRow, Sparkle, Squiggle, Arrow, CharacterMark } from '@/components/Marks';

export const dynamic = 'force-dynamic';

const LOGO_WALL = ['Linear', 'Vercel', 'Raycast', 'Supabase', 'Framer', 'Cal.com'];

export default async function Home() {
  const startups = await getLeaderboard();

  return (
    <main className="bg-paper-warmth">
      {/* ---------- Hero ---------- */}
      <section className="relative px-6 pb-20 pt-16">
        <div className="mx-auto max-w-[1100px]">
          <MarkRow count={7} className="mb-10" />

          <div className="relative text-center">
            <Sparkle className="absolute -left-2 top-4 hidden lg:block" color="#ffb110" />
            <Squiggle className="absolute -right-4 top-10 hidden lg:block" color="#f64932" />

            <h1 className="t-display mx-auto max-w-4xl text-ink-black">
              Where products and supporters{' '}
              <span className="highlight-pill" style={{ background: '#f6d5b8' }}>
                rank
              </span>{' '}
              together.
            </h1>

            <p className="t-editorial mx-auto mt-6 max-w-xl">
              Add your product without an account, start from one dollar, and climb the board
              through verified boosts from real people.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link href="/submit" className="btn btn-primary btn-lg">
                Add your product
              </Link>
              <Link href="#rankings" className="btn btn-ghost btn-lg">
                See the board
              </Link>
            </div>
          </div>

          <ClaimRank />
        </div>
      </section>

      {/* ---------- Logo wall ---------- */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1100px] rounded-cards bg-pure-white px-6 py-10">
          <p className="t-caption text-center uppercase text-black/40">
            Built for the tools teams actually ship with
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {LOGO_WALL.map((name) => (
              <span
                key={name}
                className="text-[20px] font-semibold leading-none tracking-[-0.6px] text-black/60"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Rankings ---------- */}
      <section id="rankings" className="px-6 pb-20">
        <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="t-heading text-ink-black">All-time ranking</h2>
                <p className="t-body-sm mt-1">Verified boosts only — no seeded listings.</p>
              </div>
              <Link href="/categories" className="btn btn-outline">
                View all
              </Link>
            </div>

            {startups.length ? (
              <div className="space-y-2">
                {startups.map((s, i) => (
                  <Link
                    href={`/startup/${s.slug}`}
                    key={s.id}
                    className="transition-notion card grid grid-cols-[40px_48px_1fr_auto] items-center gap-4 p-4 hover:border-black/20"
                  >
                    <b className="text-[22px] font-semibold leading-none tracking-[-0.6px] text-black/40">
                      {i + 1}
                    </b>
                    <StartupLogo domain={s.domain} name={s.name} className="h-12 w-12" />
                    <div className="min-w-0">
                      <h3 className="truncate text-[16px] font-medium leading-[1.5] text-ink-black">
                        {s.name}
                      </h3>
                      <p className="t-body-sm truncate">{s.description}</p>
                      <span className="pill mt-2 bg-sky-tint text-notion-blue">{s.category}</span>
                    </div>
                    <b className="text-[16px] font-medium text-notion-blue">{money(s.total)}</b>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyBoard />
            )}
          </div>

          <aside className="space-y-4">
            <div className="card-accent p-6" style={{ background: 'var(--color-marigold)' }}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="t-heading-sm text-ink-black">Today’s board is open</h3>
                <CharacterMark index={2} size={40} />
              </div>
              <p className="mt-3 text-[14px] leading-[1.43] text-black/70">
                The first verified boost of the UTC day takes the top spot. Boards reset at
                midnight.
              </p>
              <Link href="/today" className="btn btn-text mt-5 bg-pure-white">
                Open today’s board <ArrowRight size={16} />
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="t-heading-sm text-ink-black">How rank works</h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Payments verify on the server before rank changes.',
                  'Refunded boosts leave the totals.',
                  'Every product starts at the same place.',
                ].map((line) => (
                  <li key={line} className="t-body-sm flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-pills bg-notion-blue" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link href="/rules" className="btn btn-ghost mt-5">
                Read the rules
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Feature blocks ---------- */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1100px] space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="card-accent p-6 sm:p-8" style={{ background: 'var(--color-sky-wash)' }}>
              <span className="pill bg-pure-white text-ink-black">01 — Submit</span>
              <h3 className="t-heading mt-5 text-ink-black">No account. One page.</h3>
              <p className="mt-3 max-w-sm text-[16px] leading-[1.5] text-black/70">
                Paste a URL, pick a category, and your listing exists. That&rsquo;s the whole
                onboarding.
              </p>
              <div className="elev-mockup mt-8 rounded-buttons bg-pure-white p-4">
                <div className="t-caption text-black/40">Website</div>
                <div className="mt-2 rounded-small border border-hairline px-3 py-2 text-[14px]">
                  https://yourproduct.com
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="pill bg-sky-tint text-notion-blue">AI &amp; Automation</span>
                  <span className="btn btn-primary">Publish</span>
                </div>
              </div>
            </div>

            <div className="card-accent p-6 sm:p-8" style={{ background: 'var(--color-coral)' }}>
              <span className="pill bg-pure-white text-ink-black">02 — Boost</span>
              <h3 className="t-heading mt-5 text-pure-white">Rank is bought honestly.</h3>
              <p className="mt-3 max-w-sm text-[16px] leading-[1.5] text-white/85">
                Every position on this board is a payment someone actually made and the server
                actually verified. Nothing is implied.
              </p>
              <div className="elev-mockup mt-8 space-y-2 rounded-buttons bg-pure-white p-4">
                {[
                  ['Boost verified', '#0075de'],
                  ['Rank updated', '#0075de'],
                  ['Refund removed', '#757575'],
                ].map(([label, color]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-small border border-hairline px-3 py-2"
                  >
                    <span className="text-[14px] font-medium">{label}</span>
                    <span className="h-2 w-2 rounded-pills" style={{ background: color }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="card-accent relative overflow-hidden p-8 sm:p-12"
            style={{ background: 'var(--color-midnight-ink)' }}
          >
            <Arrow className="absolute right-8 top-8 hidden sm:block" color="#62aef0" />
            <span className="pill bg-white/10 text-pure-white">03 — Climb</span>
            <h3 className="t-display-sm mt-5 max-w-2xl text-pure-white">
              A board you can actually read.
            </h3>
            <p className="t-editorial mt-4 max-w-xl text-white/70">
              No hidden score, no purchased reviews, no placement deals. Just totals, in order,
              updated the moment a payment clears.
            </p>
            <Link href="/submit" className="btn btn-primary btn-lg mt-8">
              Claim your rank <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyBoard() {
  return (
    <div className="card p-8 text-center sm:p-12">
      <div className="mx-auto w-fit">
        <CharacterMark index={0} size={48} />
      </div>
      <h2 className="t-heading mt-6 text-ink-black">This leaderboard is yours.</h2>
      <p className="t-editorial mx-auto mt-3 max-w-sm">
        No products have claimed a rank yet. Add your URL and become the first product discovered
        here.
      </p>
      <Link href="/submit" className="btn btn-primary btn-lg mt-7">
        Add your product <ArrowRight size={18} />
      </Link>
    </div>
  );
}
