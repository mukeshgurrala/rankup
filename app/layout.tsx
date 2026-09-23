import type { Metadata } from 'next';
// Self-hosted fonts (no network fetch at build time).
// Inter stands in for NotionInter; Source Serif 4 stands in for Lyon Text.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/source-serif-4/400.css';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: { default: 'RankUp — Claim your rank', template: '%s · RankUp' },
  description: 'The transparent, pay-to-rank product leaderboard.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
