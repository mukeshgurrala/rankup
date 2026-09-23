'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './LogoMark';

const links: [string, string][] = [
  ['Today', '/today'],
  ['Daily', '/daily'],
  ['Categories', '/categories'],
  ['About', '/about'],
  ['Rules', '/rules'],
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      <header className="elev-nav sticky top-0 z-50 bg-paper-warmth/90 backdrop-blur">
        <div className="mx-auto max-w-page px-6">
          <div className="flex h-16 items-center justify-between gap-6">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 text-[16px] font-semibold tracking-[-0.3px] text-ink-black"
            >
              <LogoMark className="h-8 w-8" />
              <span>RankUp</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {links.map(([label, href]) => {
                const active = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    className="transition-notion rounded-buttons px-4 py-3 text-[14px] font-medium leading-[1.43] hover:bg-black/[0.04]"
                    style={{ color: active ? 'var(--color-notion-blue)' : 'rgba(0,0,0,0.54)' }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/today" className="btn btn-text hidden sm:inline-flex">
                Browse
              </Link>
              <Link href="/submit" className="btn btn-primary">
                Add product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-hairline bg-paper-warmth md:hidden">
        <div className="flex gap-1 overflow-x-auto px-6 py-2 [scrollbar-width:none]">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="transition-notion shrink-0 rounded-buttons px-3 py-2 text-[14px] font-medium"
              style={{ color: pathname === href ? 'var(--color-notion-blue)' : 'rgba(0,0,0,0.54)' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
