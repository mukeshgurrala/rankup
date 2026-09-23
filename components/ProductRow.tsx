import Link from 'next/link';
import { ArrowUpRight, MousePointerClick } from 'lucide-react';
import { Favicon } from './Favicon';
import { OutboundLink } from './OutboundLink';
import { categorySlug } from '@/lib/categories';
import { compact, priceToClaim, timeAgo, usd, type Product } from '@/lib/data';

/**
 * Compact listing row, optimised for scanning many entries. Everything the
 * spec asks for lives on one line-dense card: rank, favicon, name + tagline,
 * bid, category, age, domain, clicks, details link and the claim CTA.
 */
export function ProductRow({ product, rank }: { product: Product; rank: number }) {
  const claimPrice = priceToClaim(product.bid);

  return (
    <article className="transition-notion card p-4 hover:border-black/20">
      <div className="flex gap-4">
        <div className="w-10 shrink-0 pt-0.5 text-right">
          <span className="font-mono text-[16px] font-medium tabular-nums text-black/40">
            #{rank}
          </span>
        </div>

        <Favicon domain={product.domain} name={product.name} size={36} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <OutboundLink
              productId={product.id}
              url={product.url}
              className="group inline-flex items-center gap-1 text-[15px] font-semibold tracking-[-0.2px] text-ink-black hover:text-notion-blue"
            >
              {product.name}
              <ArrowUpRight
                size={13}
                className="text-black/30 transition-notion group-hover:text-notion-blue"
              />
            </OutboundLink>
            <span className="font-mono text-[12px] text-black/35">{product.domain}</span>
          </div>

          <p className="mt-1 line-clamp-1 text-[13px] leading-[1.45] text-graphite">
            {product.tagline}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Link
              href={`/category/${categorySlug(product.category)}`}
              className="transition-notion rounded-small bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-black/60 hover:bg-sky-tint hover:text-notion-blue"
            >
              {product.category}
            </Link>
            <span className="font-mono text-[11px] text-black/35">
              {timeAgo(product.createdAt)}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-black/35">
              <MousePointerClick size={11} />
              {compact(product.clickCount)} clicks
            </span>
            <Link
              href={`/product/${product.slug}`}
              className="transition-notion text-[11px] font-medium text-notion-blue hover:underline"
            >
              See details
            </Link>
          </div>
        </div>

        <div className="flex w-[124px] shrink-0 flex-col items-end justify-between gap-2">
          <span className="font-mono text-[18px] font-semibold tabular-nums text-money">
            {usd(product.bid)}
          </span>
          <Link
            href={`/claim?rank=${rank}`}
            className="transition-notion w-full rounded-small border border-hairline px-2 py-1.5 text-center font-mono text-[11px] text-black/60 hover:border-money hover:bg-money-tint hover:text-money"
          >
            Claim for {usd(claimPrice)}
          </Link>
        </div>
      </div>
    </article>
  );
}
