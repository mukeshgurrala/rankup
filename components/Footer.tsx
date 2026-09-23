import Link from 'next/link';
import { LogoMark } from './LogoMark';

const nav: [string, string][] = [
  ['Rules', '/rules'],
  ['FAQ', '/faq'],
  ['Terms', '/terms'],
  ['Privacy', '/privacy'],
  ['Imprint', '/imprint'],
  ['Live stats', '/stats'],
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-paper-warmth">
      <div className="mx-auto max-w-[1180px] px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-[14px] font-semibold text-ink-black">
            <LogoMark className="h-6 w-6" />
            RankUp
          </Link>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {nav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="transition-notion font-mono text-[12px] text-black/50 hover:text-ink-black"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
          <p className="font-mono text-[11px] text-black/40">
            Built by{' '}
            <a
              href="https://github.com/mukeshgurrala"
              target="_blank"
              rel="noopener noreferrer"
              className="text-notion-blue hover:underline"
            >
              @mukeshgurrala
            </a>
          </p>
          <p className="font-mono text-[11px] text-black/40">
            All bids are one-time and non-refundable
          </p>
        </div>
      </div>
    </footer>
  );
}
