import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BoardToggle } from '@/components/BoardToggle';
import { Pagination } from '@/components/Pagination';
import { ProductRow } from '@/components/ProductRow';
import { categoryFromSlug, categorySlug } from '@/lib/categories';
import { PAGE_SIZE } from '@/lib/data';
import { getBoard, type Board } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const category = categoryFromSlug((await params).slug);
  return { title: category ?? 'Category' };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ board?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const board: Board = sp.board === 'today' ? 'today' : 'all-time';
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const boardPage = await getBoard({ board, category, page, pageSize: PAGE_SIZE });

  return (
    <main className="min-h-[80vh] bg-paper-warmth">
      <div className="mx-auto max-w-[900px] px-5 py-10">
        <Link
          href="/categories"
          className="transition-notion mb-6 inline-flex items-center gap-1.5 font-mono text-[12px] text-black/50 hover:text-ink-black"
        >
          <ArrowLeft size={13} /> all categories
        </Link>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="t-heading text-ink-black">{category}</h1>
            <p className="t-body-sm mt-1">
              Ranked by standing bid. Outbid any position by $1 to take it.
            </p>
          </div>
          <BoardToggle board={board} basePath={`/category/${categorySlug(category)}`} />
        </div>

        {boardPage.products.length === 0 ? (
          <div className="card p-10 text-center">
            <h2 className="t-heading-sm text-ink-black">Nothing ranked here yet</h2>
            <p className="t-body mx-auto mt-2 max-w-sm">
              This category is wide open. The first $1 bid takes the top spot.
            </p>
            <Link href="/claim?rank=1" className="btn btn-primary mt-5">
              Claim #1
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
              basePath={`/category/${categorySlug(category)}`}
              params={{ board: board === 'today' ? 'today' : undefined }}
            />
          </>
        )}
      </div>
    </main>
  );
}
