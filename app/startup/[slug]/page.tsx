import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Globe } from 'lucide-react';
import { money } from '@/lib/data';
import { getLeaderboard, getStartupBySlug } from '@/lib/queries';
import { StartupLogo } from '@/components/StartupLogo';

export const dynamic = 'force-dynamic';

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [s, startups] = await Promise.all([getStartupBySlug(slug), getLeaderboard()]);
  if (!s) notFound();
  const rank = startups.findIndex((x) => x.id === s.id) + 1;

  return (
    <main className="min-h-[80vh] bg-paper-warmth">
      <div className="mx-auto max-w-[900px] px-6 py-12 sm:py-16">
        <Link href="/" className="btn btn-text -ml-[15px] mb-8">
          <ArrowLeft size={16} /> Back to leaderboard
        </Link>

        <div className="card overflow-hidden">
          <div className="p-6 sm:p-8" style={{ background: 'var(--color-sky-tint)' }}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <StartupLogo domain={s.domain} name={s.name} className="h-20 w-20 rounded-cards" />
              <div className="min-w-0 flex-1">
                <span className="pill bg-pure-white text-ink-black">{s.category}</span>
                <h1 className="t-display-sm mt-3 text-ink-black">{s.name}</h1>
                <p className="t-body mt-2">{s.description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_260px] sm:p-8">
            <div>
              <h2 className="t-heading-sm text-ink-black">About</h2>
              <p className="t-body mt-3">
                {s.description} Built by ambitious founders and supported by the RankUp community.
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg mt-6"
              >
                Visit website <ArrowUpRight size={18} />
              </a>
            </div>

            <aside className="card bg-paper-warmth p-5">
              <p className="t-caption uppercase text-black/40">Current rank</p>
              <div className="mt-1 text-[40px] font-semibold leading-[1.04] tracking-[-1.4px]">
                #{rank}
              </div>

              <hr className="my-5 border-0 border-t border-hairline" />

              <p className="t-caption uppercase text-black/40">Verified boost</p>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.242px] text-notion-blue">
                {money(s.total)}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[12px] leading-[1.33] text-black/60">
                <CheckCircle2 size={14} /> Payment verified
              </div>
              <div className="mt-2 flex items-center gap-2 text-[12px] leading-[1.33] text-black/60">
                <Globe size={14} /> {s.domain}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
