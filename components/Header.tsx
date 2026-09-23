'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './LogoMark';
import { LiveBadge } from './LiveBadge';

const links: [string, string][] = [
  ['Daily', '/?board=today'],
  ['Categories', '/categories'],
  ['About', '/about'],
  ['Rules', '/rules'],
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="elev-nav sticky top-0 z-50 border-b border-hairline bg-paper-warmth/90 backdrop-blur">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-[-0.3px] text-ink-black"
            >
              <LogoMark className="h-7 w-7" />
              RankUp
            </Link>
            <LiveBadge />
          </div>

          <nav className="flex items-center gap-1">
            {links.map(([label, href]) => {
              const active = pathname === href.split('?')[0] && href !== '/?board=today';
              return (
                <Link
                  key={label}
                  href={href}
                  className="transition-notion hidden rounded-buttons px-3 py-2 text-[13px] font-medium hover:bg-black/[0.04] sm:block"
                  style={{ color: active ? 'var(--color-notion-blue)' : 'rgba(0,0,0,0.54)' }}
                >
                  {label}
                </Link>
              );
            })}
            <Link href="/claim?rank=1" className="btn btn-primary ml-1">
              Claim a rank
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
