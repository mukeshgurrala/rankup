import { ContentPage, PageIntro } from '@/components/SitePrimitives';

const rules: [string, string][] = [
  ['All-time', 'Your complete verified boost total. It does not expire.'],
  [
    'Today',
    'Boosts made during the current UTC calendar day. This board resets at midnight UTC.',
  ],
  ['Daily archive', 'Closed daily boards preserve the final order for transparent history.'],
  [
    'Categories',
    'A product appears in the category selected during submission. The same verified boost determines its category rank.',
  ],
];

const integrity = [
  'Only server-verified payments create boosts.',
  'Duplicate verification cannot create a second boost.',
  'Refunded boosts are removed from ranking totals.',
  'Unsafe or duplicate product domains may be rejected.',
];

export default function Rules() {
  return (
    <ContentPage>
      <PageIntro eyebrow="Simple on purpose" title="Rules">
        RankUp is a public product leaderboard. Rank is based on verified support — nothing else.
        No secret score, purchased reviews, or hidden placement.
      </PageIntro>

      <section>
        <h2 className="t-heading text-ink-black">How the boards work</h2>
        <div className="mt-6 space-y-2">
          {rules.map(([title, body], i) => (
            <div key={title} className="card grid gap-4 p-6 sm:grid-cols-[40px_1fr]">
              <span className="grid h-10 w-10 place-items-center rounded-pills bg-sky-tint text-[14px] font-medium text-notion-blue">
                {i + 1}
              </span>
              <div>
                <h3 className="t-heading-sm text-ink-black">{title}</h3>
                <p className="t-body mt-2">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="card-accent mt-6 p-6 sm:p-8"
        style={{ background: 'var(--color-midnight-ink)' }}
      >
        <h2 className="t-heading text-pure-white">Payment integrity</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {integrity.map((line) => (
            <li
              key={line}
              className="flex gap-3 rounded-buttons bg-white/[0.06] p-4 text-[14px] leading-[1.43] text-white/80"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-pills bg-sky-wash" />
              {line}
            </li>
          ))}
        </ul>
      </section>
    </ContentPage>
  );
}
