import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Favicon } from '@/components/Favicon';
import { OutboundLink } from '@/components/OutboundLink';
import { categorySlug } from '@/lib/categories';
import { compact, priceToClaim, timeAgo, usd } from '@/lib/data';
import { getProductBySlug, getRankOf } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: 'Product not found' };
  return { title: product.name, description: product.tagline };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const rank = await getRankOf(product);
  const claimPrice = priceToClaim(product.bid);

  const facts: [string, string][] = [
    ['Standing bid', usd(product.bid)],
    ['Rank', `#${rank}`],
    ['Total paid', usd(product.totalPaid)],
    ['Bids placed', compact(product.bidCount)],
    ['Clicks', compact(product.clickCount)],
    ['Listed', timeAgo(product.createdAt)],
  ];

  return (
    <main className="min-h-[80vh] bg-paper-warmth">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link
          href="/"
          className="transition-notion mb-6 inline-flex items-center gap-1.5 font-mono text-[12px] text-black/50 hover:text-ink-black"
        >
          <ArrowLeft size={13} /> back to the board
        </Link>

        <article className="card overflow-hidden">
          <header className="flex flex-wrap items-start gap-4 border-b border-hairline p-6">
            <Favicon domain={product.domain} name={product.name} size={48} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] tabular-nums text-black/40">#{rank}</span>
                <h1 className="t-heading-sm text-ink-black">{product.name}</h1>
              </div>
              <p className="t-body mt-1">{product.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/category/${categorySlug(product.category)}`}
                  className="transition-notion rounded-small bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-black/60 hover:bg-sky-tint hover:text-notion-blue"
                >
                  {product.category}
                </Link>
                <span className="font-mono text-[11px] text-black/40">{product.domain}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-[24px] font-semibold tabular-nums text-money">
                {usd(product.bid)}
              </div>
              <div className="font-mono text-[11px] text-black/40">standing bid</div>
            </div>
          </header>

          <dl className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="p-4">
                <dt className="text-[11px] uppercase tracking-[0.12px] text-black/40">{label}</dt>
                <dd className="mt-1 font-mono text-[15px] font-medium tabular-nums text-ink-black">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2 border-t border-hairline p-6">
            <OutboundLink
              productId={product.id}
              url={product.url}
              className="btn btn-primary btn-lg"
            >
              Visit {product.domain} <ArrowUpRight size={16} />
            </OutboundLink>
            <Link href={`/claim?rank=${rank}`} className="btn btn-ghost btn-lg">
              Outbid for {usd(claimPrice)}
            </Link>
          </div>
        </article>

        <p className="mt-4 text-center font-mono text-[11px] text-black/40">
          Outbound links carry <code>utm_source=rankup</code>. RankUp takes 100% of bid revenue.
        </p>
      </div>
    </main>
  );
}
