import { SubmitFlow } from '@/components/SubmitFlow';
import { MarkRow } from '@/components/Marks';

export default async function Submit({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; category?: string }>;
}) {
  const query = await searchParams;

  return (
    <main className="min-h-[85vh] bg-paper-warmth">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <MarkRow count={5} className="mb-8" />
          <h1 className="t-display-sm text-ink-black">
            Add your{' '}
            <span className="highlight-pill" style={{ background: 'var(--color-marigold)' }}>
              product
            </span>
          </h1>
          <p className="t-editorial mx-auto mt-5 max-w-md">
            Submit and boost from one simple page. No account, no waiting for approval.
          </p>
        </div>

        <SubmitFlow initialUrl={query.url || ''} initialCategory={query.category || 'AI'} />
      </div>
    </main>
  );
}
