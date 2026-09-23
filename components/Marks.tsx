/**
 * Decorative marks system — character faces in colored circles plus abstract
 * squiggles/sparkles. Purely decorative punctuation: never informational.
 */

const MARK_COLORS = ['#097fe8', '#f64932', '#ffb110', '#62aef0'];

const FACES = ['◠', '◡', '•ᴗ•', '︶', '＾', '•‿•', '◔'];

export function CharacterMark({
  index = 0,
  size = 44,
  className = '',
}: {
  index?: number;
  size?: number;
  className?: string;
}) {
  const color = MARK_COLORS[index % MARK_COLORS.length];
  const face = FACES[index % FACES.length];
  return (
    <span
      aria-hidden
      className={`mark-spring grid shrink-0 place-items-center rounded-pills bg-pure-white ${className}`}
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        color,
        fontSize: size * 0.32,
        animationDelay: `${(index % 7) * 0.22}s`,
      }}
    >
      {face}
    </span>
  );
}

export function MarkRow({ count = 7, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CharacterMark key={i} index={i} size={i % 2 === 0 ? 44 : 40} />
      ))}
    </div>
  );
}

export function Squiggle({ color = '#f64932', className = '' }: { color?: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 64 16" width="64" height="16" fill="none" className={className}>
      <path
        d="M2 9c4-7 8 7 12 0s8 7 12 0 8 7 12 0 8 7 12 0"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle({ color = '#ffb110', className = '' }: { color?: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="22" height="22" fill="none" className={className}>
      <path
        d="M12 1.5c.7 5.2 4.6 9.1 9.8 9.8-5.2.7-9.1 4.6-9.8 9.8-.7-5.2-4.6-9.1-9.8-9.8 5.2-.7 9.1-4.6 9.8-9.8Z"
        fill={color}
      />
    </svg>
  );
}

export function Arrow({ color = '#097fe8', className = '' }: { color?: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 28" width="48" height="28" fill="none" className={className}>
      <path
        d="M2 22C10 6 28 2 44 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M36 4l8 4-4 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
