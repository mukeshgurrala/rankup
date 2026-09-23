import { compact, usd, type PlatformStats } from '@/lib/data';

/**
 * Public stats. Every figure is counted from our own tables, so a new
 * platform honestly shows zeros rather than inflated numbers.
 */
export function StatsBar({ stats }: { stats: PlatformStats }) {
  const items: [string, string][] = [
    ['Visitors', compact(stats.visitors)],
    ['Revenue', usd(stats.revenue)],
    ['Products', compact(stats.products)],
    ['Bids placed', compact(stats.bids)],
    ['Days live', compact(stats.daysSinceLaunch)],
  ];

  return (
    <div className="card divide-y divide-hairline sm:flex sm:divide-x sm:divide-y-0">
      {items.map(([label, value]) => (
        <div key={label} className="flex-1 px-4 py-3">
          <div className="font-mono text-[18px] font-semibold tabular-nums text-ink-black">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.12px] text-black/40">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
