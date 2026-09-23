import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { MarkRow } from '@/components/Marks';

export default function Success() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-paper-warmth px-6 py-20">
      <div className="card max-w-lg p-8 text-center sm:p-12">
        <MarkRow count={3} className="mb-8" />
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-pills bg-notion-blue text-pure-white">
          <Check size={28} />
        </div>
        <h1 className="t-heading mt-6 text-ink-black">Boost verified</h1>
        <p className="t-editorial mx-auto mt-3 max-w-xs">
          Your support is live and the leaderboard has been updated.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-primary btn-lg">
            See the leaderboard <ArrowRight size={18} />
          </Link>
          <Link href="/submit" className="btn btn-ghost btn-lg">
            Boost again
          </Link>
        </div>
      </div>
    </main>
  );
}
