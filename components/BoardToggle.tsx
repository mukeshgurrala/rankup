import Link from 'next/link';
import type { Board } from '@/lib/queries';

/** All-time vs Today switch. */
export function BoardToggle({ board, basePath = '/' }: { board: Board; basePath?: string }) {
  const options: [Board, string][] = [
    ['all-time', 'All-time'],
    ['today', 'Today'],
  ];

  return (
    <div className="inline-flex rounded-buttons border border-hairline bg-pure-white p-0.5">
      {options.map(([value, label]) => {
        const active = board === value;
        return (
          <Link
            key={value}
            href={value === 'all-time' ? basePath : `${basePath}?board=today`}
            aria-current={active ? 'true' : undefined}
            className={`transition-notion rounded-[6px] px-3 py-1.5 text-[13px] font-medium ${
              active ? 'bg-ink-black text-pure-white' : 'text-black/50 hover:text-ink-black'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
