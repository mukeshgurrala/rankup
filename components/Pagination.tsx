import Link from 'next/link';
import { compact } from '@/lib/data';

/** Page numbers with ellipses, plus an "N–M of T" range label. */
export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params = {},
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  // Window of pages around the current one, with first/last always present.
  const window = new Set<number>([1, pages, page, page - 1, page + 1]);
  const list = [...window].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3"
      aria-label="Pagination"
    >
      <p className="font-mono text-[12px] text-black/40">
        {compact(first)}–{compact(last)} of {compact(total)}
      </p>

      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link href={href(page - 1)} className="transition-notion rounded-small border border-hairline px-2.5 py-1.5 font-mono text-[12px] text-black/60 hover:border-black/25">
            prev
          </Link>
        )}

        {list.map((p, i) => {
          const gap = i > 0 && p - list[i - 1] > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {gap && <span className="px-1 font-mono text-[12px] text-black/25">…</span>}
              {p === page ? (
                <span
                  aria-current="page"
                  className="rounded-small border border-notion-blue bg-sky-tint px-2.5 py-1.5 font-mono text-[12px] font-medium text-notion-blue"
                >
                  {p}
                </span>
              ) : (
                <Link
                  href={href(p)}
                  className="transition-notion rounded-small border border-hairline px-2.5 py-1.5 font-mono text-[12px] text-black/60 hover:border-black/25"
                >
                  {p}
                </Link>
              )}
            </span>
          );
        })}

        {page < pages && (
          <Link href={href(page + 1)} className="transition-notion rounded-small border border-hairline px-2.5 py-1.5 font-mono text-[12px] text-black/60 hover:border-black/25">
            next
          </Link>
        )}
      </div>
    </nav>
  );
}
