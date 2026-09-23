'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Favicon } from './Favicon';
import { timeAgo, usd, type Activity } from '@/lib/data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Latest verified bids. Subscribes to Supabase Realtime when public
 * credentials exist; otherwise it renders the server snapshot as-is.
 */
export function ActivityFeed({ initial }: { initial: Activity[] }) {
  const [items, setItems] = useState(initial);
  const [live, setLive] = useState(false);
  const [seenInitial, setSeenInitial] = useState(initial);

  // Adopt a fresh server snapshot during render rather than in an effect.
  if (initial !== seenInitial) {
    setSeenInitial(initial);
    setItems(initial);
  }

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;

    const client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false },
    });

    const channel = client
      .channel('bids-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, () => {
        // A new bid landed — pull the authoritative, joined rows back.
        void fetch('/api/activity')
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d?.activity && setItems(d.activity))
          .catch(() => {});
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink-black">Latest activity</h2>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-black/40">
          <span
            className={`h-1.5 w-1.5 rounded-pills ${live ? 'bg-money' : 'bg-black/20'}`}
            aria-hidden
          />
          {live ? 'live' : 'snapshot'}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-[13px] text-black/40">
          No bids yet. The first verified bid appears here instantly.
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-2.5 px-4 py-2.5">
              <Favicon domain={a.domain} name={a.name} size={20} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${a.slug}`}
                  className="block truncate text-[13px] font-medium text-ink-black hover:text-notion-blue"
                >
                  {a.name}
                </Link>
                <span className="font-mono text-[11px] text-black/35">
                  {a.rankClaimed ? `claimed #${a.rankClaimed} · ` : ''}
                  {timeAgo(a.createdAt)}
                </span>
              </div>
              <span className="font-mono text-[13px] font-medium tabular-nums text-money">
                {usd(a.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
