import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';
import { CATEGORIES, categorySlug } from '@/lib/categories';
import { getCategoryCounts } from '@/lib/queries';
import { compact } from '@/lib/data';

export const metadata: Metadata = { title: 'Categories' };
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const counts = await getCategoryCounts();

  return (
    <ContentPage>
      <PageIntro eyebrow="Browse" title="Categories">
        Every category has its own ranked board. Counts are live listings with a verified standing
        bid.
      </PageIntro>

      <div className="card divide-y divide-hairline overflow-hidden">
        {CATEGORIES.map((name) => {
          const count = counts[name] ?? 0;
          return (
            <Link
              key={name}
              href={`/category/${categorySlug(name)}`}
              className="transition-notion flex items-center justify-between gap-4 px-4 py-3 hover:bg-black/[0.02]"
            >
              <span className="text-[14px] text-ink-black">{name}</span>
              <span className="font-mono text-[12px] tabular-nums text-black/40">
                {count > 0 ? `${compact(count)} listed` : '—'}
              </span>
            </Link>
          );
        })}
      </div>
    </ContentPage>
  );
}
