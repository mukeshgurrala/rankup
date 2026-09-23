import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ContentPage, PageIntro } from '@/components/SitePrimitives';

const cats: [string, string][] = [
  ['AI & Automation', 'var(--color-marigold)'],
  ['SEO & Discovery', 'var(--color-sky-wash)'],
  ['Marketing & Growth', 'var(--color-coral)'],
  ['Games & Entertainment', 'var(--color-midnight-ink)'],
  ['Developer Tools', 'var(--color-sky-tint)'],
  ['Climate & Impact', 'var(--color-mocha)'],
  ['Learning & Education', 'var(--color-saffron)'],
];

export default function Categories() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Find your lane" title="Categories">
        Every category has its own focused ranking. Choose one to discover what is gaining verified
        momentum.
      </PageIntro>

      <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h2 className="t-heading-sm text-ink-black">Most active categories</h2>
          <p className="t-body-sm mt-1">
            Ranks appear here as the community adds and boosts products.
          </p>
        </div>
        <Link href="/submit" className="btn btn-ghost">
          Add a product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map(([name, color]) => (
          <Link
            key={name}
            href={`/submit?category=${encodeURIComponent(name)}`}
            className="transition-notion card group overflow-hidden hover:border-black/20"
          >
            <div className="h-24" style={{ background: color }} />
            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="t-heading-sm text-ink-black">{name}</h3>
                <ArrowUpRight
                  className="transition-notion shrink-0 text-black/40 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-notion-blue"
                  size={18}
                />
              </div>
              <p className="t-body-sm mt-2">No ranked products yet</p>
            </div>
          </Link>
        ))}
      </div>
    </ContentPage>
  );
}
