import Link from 'next/link';
import { ActivityFeed } from '@/components/ActivityFeed';
import { BoardToggle } from '@/components/BoardToggle';
import { ClaimBar } from '@/components/ClaimBar';
import { Pagination } from '@/components/Pagination';
import { ProductRow } from '@/components/ProductRow';
import { StatsBar } from '@/components/StatsBar';
import { TodayWidget } from '@/components/TodayWidget';
import { PAGE_SIZE, priceForTop } from '@/lib/data';
import { getActivity, getBoard, getStats, getTopProducts, type Board } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ board?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const board: Board = sp.board === 'today' ? 'today' : 'all-time';
  const page = Math.max(1, Number(sp.page ?? '1') || 1);

  const [boardPage, todayTop, activity, stats, allTimeTop] = await Promise.all([
    getBoard({ board, page, pageSize: PAGE_SIZE }),
    getTopProducts('today', 5),
    getActivity(10),
    getStats(),
    getTopProducts('all-time', 1),
  ]);

  const claimPrice = priceForTop(allTimeTop[0]?.bid);

  return (
    <main className="bg-paper-warmth">
      <div className="mx-auto max-w-[1180px] px-5 py-8">
        {/* ---- Hero / claim ---- */}
        <section className="mb-6">
          <h1 className="t-display-sm max-w-2xl text-ink-black">
            Buy your way to{' '}
            <span className="highlight-pill" style={{ background: 'var(--color-money-tint)', color: 'var(--color-money)' }}>
              #1
            </span>
          </h1>
          <p className="t-editorial mt-3 max-w-xl">
            A leaderboard with one rule: outbid the product above you by a dollar. Every rank is
            public, every bid is verified, every click goes to the product.
          </p>

          <div className="mt-6">
            <ClaimBar minimum={claimPrice} />
          </div>
        </section>

        <section className="mb-8">
          <StatsBar stats={stats} />
        </section>

        {/* ---- Board + sidebar ---- */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <BoardToggle board={board} />
              <Link
                href="/categories"
                className="transition-notion font-mono text-[12px] text-black/50 hover:text-notion-blue"
              >
                browse categories →
              </Link>
            </div>

            {boardPage.products.length === 0 ? (
              <div className="card p-10 text-center">
                <h2 className="t-heading-sm text-ink-black">
                  {board === 'today' ? 'No bids today yet' : 'No products ranked yet'}
                </h2>
                <p className="t-body mx-auto mt-2 max-w-sm">
                  {board === 'today'
                    ? 'Today’s board opens with the first verified bid of the UTC day.'
                    : 'The board is empty. The first $1 bid takes rank #1.'}
                </p>
                <Link href="/claim?rank=1" className="btn btn-primary mt-5">
                  Claim #1 for ${claimPrice}
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {boardPage.products.map((p, i) => (
                    <ProductRow key={p.id} product={p} rank={boardPage.offset + i + 1} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={boardPage.total}
                  basePath="/"
                  params={{ board: board === 'today' ? 'today' : undefined }}
                />
              </>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <TodayWidget products={todayTop} />
            <ActivityFeed initial={activity} />
          </aside>
        </div>
      </div>
    </main>
  );
}
