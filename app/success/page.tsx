import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export const metadata: Metadata = { title: 'Bid verified' };

export default function SuccessPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-paper-warmth px-5 py-16">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-pills bg-money text-pure-white">
          <Check size={24} />
        </div>
        <h1 className="t-heading mt-5 text-ink-black">Bid verified</h1>
        <p className="t-body mt-2">
          Your payment cleared and the leaderboard has been updated with your new position.
        </p>
        <Link href="/" className="btn btn-primary btn-lg mt-6">
          View the leaderboard <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
