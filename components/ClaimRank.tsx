'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CATEGORIES = [
  'AI',
  'Marketing',
  'SEO',
  'Productivity',
  'Agents',
  'Crypto',
  'Developer',
  'Other',
];

export function ClaimRank() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (url) q.set('url', url);
    if (category) q.set('category', category);
    router.push(`/submit?${q}`);
  }

  return (
    <form
      onSubmit={go}
      className="elev-mockup mx-auto mt-14 max-w-3xl rounded-cards border border-hairline bg-pure-white p-4"
    >
      <div className="grid gap-2 md:grid-cols-[1fr_200px_auto]">
        <input
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="field"
          placeholder="https://yourproduct.com"
          aria-label="Product URL"
        />
        <div className="relative">
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field appearance-none pr-9"
            aria-label="Category"
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
            size={15}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Claim rank
        </button>
      </div>
      <p className="t-caption mt-3 px-1 text-black/40">
        No account required · minimum verified boost is $1
      </p>
    </form>
  );
}
