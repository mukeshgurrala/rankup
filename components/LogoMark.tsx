export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-buttons bg-notion-blue text-[14px] font-semibold text-pure-white ${className}`}
      aria-label="RankUp logo"
    >
      R
    </span>
  );
}
