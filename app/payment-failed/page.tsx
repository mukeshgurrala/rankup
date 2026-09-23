import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';

export const metadata: Metadata = { title: 'Payment not completed' };

export default function PaymentFailedPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-paper-warmth px-5 py-16">
      <div className="card max-w-md p-8 text-center">
        <h1 className="t-heading text-ink-black">Payment not completed</h1>
        <p className="t-body mt-2">
          No bid was recorded and you were not charged. Your rank is unchanged, so it is safe to
          try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/claim?rank=1" className="btn btn-primary btn-lg">
            <RefreshCcw size={16} /> Try again
          </Link>
          <Link href="/" className="btn btn-text btn-lg">Back to the board</Link>
        </div>
      </div>
    </main>
  );
}
