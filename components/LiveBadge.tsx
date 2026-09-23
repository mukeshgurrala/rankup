'use client';

import { useEffect, useState } from 'react';

type Counts = { online: number; visitorsToday: number };

/**
 * Registers this browser session and shows the live counts. Numbers come from
 * our own sessions table — if it isn't reachable the badge stays hidden
 * rather than displaying a made-up figure.
 */
export function LiveBadge() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    const key = 'rankup-session-id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }

    let cancelled = false;
    const ping = async () => {
      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId: id }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCounts({ online: data.online, visitorsToday: data.visitorsToday });
      } catch {
        /* badge simply stays hidden */
      }
    };

    void ping();
    const timer = setInterval(ping, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (!counts) return null;

  return (
    <span className="hidden items-center gap-1.5 rounded-pills border border-hairline bg-pure-white px-2.5 py-1 font-mono text-[11px] text-black/50 sm:inline-flex">
      <span className="h-1.5 w-1.5 rounded-pills bg-money" aria-hidden />
      {counts.online} online · {counts.visitorsToday.toLocaleString('en-US')} today
    </span>
  );
}
