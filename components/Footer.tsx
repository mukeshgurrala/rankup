import Link from 'next/link';
import { LogoMark } from './LogoMark';

const cols: { title: string; items: [string, string][] }[] = [
  {
    title: 'Boards',
    items: [
      ['All-time', '/'],
      ['Today', '/today'],
      ['Daily archive', '/daily'],
      ['Categories', '/categories'],
    ],
  },
  {
    title: 'About',
    items: [
      ['How it works', '/rules'],
      ['About RankUp', '/about'],
      ['Add a product', '/submit'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-paper-warmth">
      <div className="mx-auto max-w-page px-6 pb-16 pt-20">
        <div className="card p-6 sm:p-8">
          <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <LogoMark className="h-8 w-8" />
                <span className="text-[16px] font-semibold tracking-[-0.3px]">RankUp</span>
              </div>
              <p className="t-editorial mt-4 max-w-xs">
                A transparent leaderboard where verified support — not an algorithm — decides
                the order.
              </p>
            </div>

            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="t-caption font-medium uppercase text-black/40">{col.title}</h3>
                <ul className="mt-4 space-y-2">
                  {col.items.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="transition-notion text-[14px] leading-[1.43] text-black/60 hover:text-ink-black"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
            <p className="t-caption text-black/40">© {new Date().getFullYear()} RankUp</p>
            <p className="t-caption text-black/40">Payments verified server-side</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
