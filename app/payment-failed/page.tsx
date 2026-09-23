import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';
import { CharacterMark } from '@/components/Marks';

export default function Failed() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-paper-warmth px-6 py-20">
      <div className="card max-w-lg p-8 text-center sm:p-12">
        <div className="mx-auto w-fit">
          <CharacterMark index={1} size={48} />
        </div>
        <h1 className="t-heading mt-6 text-ink-black">Payment not completed</h1>
        <p className="t-editorial mx-auto mt-3 max-w-sm">
          No boost was created and you were not charged. You can safely try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/submit" className="btn btn-primary btn-lg">
            <RefreshCcw size={18} /> Try again
          </Link>
          <Link href="/" className="btn btn-text btn-lg">
            Back to board
          </Link>
        </div>
      </div>
    </main>
  );
}
