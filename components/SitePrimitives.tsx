import { ReactNode } from 'react';

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-16">
      {eyebrow && (
        <span className="pill mb-5 bg-sky-tint text-notion-blue">{eyebrow}</span>
      )}
      <h1 className="t-display-sm text-ink-black">{title}</h1>
      {children && <div className="t-editorial mt-5 max-w-2xl">{children}</div>}
    </header>
  );
}

export function StatCard({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-6">
      <div
        className="text-[40px] font-semibold leading-[1.04] tracking-[-1.4px]"
        style={{ color: accent ? 'var(--color-notion-blue)' : 'var(--color-ink-black)' }}
      >
        {value}
      </div>
      <p className="t-body-sm mt-2">{label}</p>
    </div>
  );
}

export function ContentPage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-[75vh] bg-paper-warmth">
      <div className="mx-auto max-w-[1100px] px-6 py-16 sm:py-20">{children}</div>
    </main>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="t-heading text-ink-black">{title}</h2>
        {subtitle && <p className="t-editorial mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
