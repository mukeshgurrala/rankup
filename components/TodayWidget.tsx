import Link from 'next/link';
import { Favicon } from './Favicon';
import { usd, type Product } from '@/lib/data';

/** Compact "Today's ranking" sidebar widget — top daily bidders. */
export function TodayWidget({ products }: { products: Product[] }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink-black">Today’s ranking</h2>
        <Link
          href="/?board=today"
          className="transition-notion font-mono text-[11px] text-notion-blue hover:underline"
        >
          see all
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="px-4 py-6 text-[13px] text-black/40">
          No bids today yet. The first one takes the top spot.
        </p>
      ) : (
        <ol className="divide-y divide-hairline">
          {products.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2.5 px-4 py-2.5">
              <span className="w-4 shrink-0 font-mono text-[11px] tabular-nums text-black/35">
                {i + 1}
              </span>
              <Favicon domain={p.domain} name={p.name} size={20} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${p.slug}`}
                  className="block truncate text-[13px] font-medium text-ink-black hover:text-notion-blue"
                >
                  {p.name}
                </Link>
                <p className="truncate text-[11px] text-black/40">{p.tagline}</p>
              </div>
              <span className="font-mono text-[13px] font-medium tabular-nums text-money">
                {usd(p.bid)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
