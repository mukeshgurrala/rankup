'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

/**
 * Top-of-page "Claim #1" entry point: dollar amount + category, handing off
 * to the full claim flow.
 */
export function ClaimBar({ minimum }: { minimum: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(minimum));
  const [category, setCategory] = useState('');

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({ rank: '1', amount });
    if (category) q.set('category', category);
    router.push(`/claim?${q}`);
  }

  return (
    <form onSubmit={go} className="card p-3">
      <div className="grid gap-2 sm:grid-cols-[150px_1fr_auto]">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[14px] text-money">
            $
          </span>
          <input
            type="number"
            min={minimum}
            step={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Bid amount in dollars"
            className="field pl-7 font-mono tabular-nums"
          />
        </div>

        <div className="relative">
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
            className="field appearance-none pr-9"
          >
            <option value="">Choose a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Claim rank
        </button>
      </div>
      <p className="mt-2 px-1 font-mono text-[11px] text-black/40">
        Claim #1 for ${minimum} — always $1 more than the current leader. One-time,
        non-refundable.
      </p>
    </form>
  );
}
