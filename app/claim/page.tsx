import type { Metadata } from 'next';
import { ClaimFlow } from '@/components/ClaimFlow';

export const metadata: Metadata = { title: 'Claim a rank' };
export const dynamic = 'force-dynamic';

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ rank?: string; amount?: string; category?: string; url?: string }>;
}) {
  const sp = await searchParams;
  const rank = Math.max(1, Number(sp.rank ?? '1') || 1);
  const amount = sp.amount ? Math.max(1, Math.floor(Number(sp.amount))) : undefined;

  return (
    <main className="min-h-[80vh] bg-paper-warmth">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <header className="mb-6">
          <h1 className="t-heading text-ink-black">Claim rank #{rank}</h1>
          <p className="t-editorial mt-2">
            Bid at least a dollar more than the product currently holding the spot. Payment is
            one-time and non-refundable.
          </p>
        </header>

        <ClaimFlow
          initialRank={rank}
          initialAmount={Number.isFinite(amount) ? amount : undefined}
          initialCategory={sp.category}
          initialUrl={sp.url}
        />
      </div>
    </main>
  );
}
