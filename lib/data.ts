export type Product = {
  id: string;
  slug: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  tagline: string;
  category: string;
  logo?: string;
  /** Standing bid in whole US dollars — this is what determines rank. */
  bid: number;
  /** Lifetime verified spend in dollars. */
  totalPaid: number;
  bidCount: number;
  clickCount: number;
  createdAt: string;
  lastBidAt?: string;
};

export type Activity = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  category: string;
  amount: number;
  rankClaimed: number | null;
  createdAt: string;
};

export type PlatformStats = {
  visitors: number;
  visitorsToday: number;
  online: number;
  revenue: number;
  products: number;
  bids: number;
  daysSinceLaunch: number;
};

/** Launch date — used for the "days since launch" stat. */
export const LAUNCH_DATE = '2026-09-23T00:00:00.000Z';

/** Bids are whole dollars, so no cents are ever displayed. */
export const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export const compact = (n: number) => new Intl.NumberFormat('en-US').format(n);

/** Favicon served from the product's own domain, per spec. */
export const faviconUrl = (domain: string, size = 128) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;

/** Outbound links carry UTM attribution back to RankUp. */
export function outboundUrl(rawUrl: string) {
  try {
    const u = new URL(rawUrl);
    u.searchParams.set('utm_source', 'rankup');
    u.searchParams.set('utm_medium', 'leaderboard');
    return u.toString();
  } catch {
    return rawUrl;
  }
}

/** "2 weeks ago", "last month" — compact relative time for scanning. */
export function timeAgo(iso: string, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(1, Math.round((now - then) / 1000));

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
    [Infinity, 'year'],
  ];

  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  let prev = 1;
  for (const [limit, unit] of units) {
    if (secs < limit) return fmt.format(-Math.floor(secs / prev), unit);
    prev = limit === 60 ? 60 : limit;
  }
  return '';
}

/** The price to take a given rank: $1 more than whoever holds it. */
export const priceToClaim = (currentBid: number) => currentBid + 1;

/** Price to take the top spot on an empty or populated board. */
export const priceForTop = (topBid: number | undefined) => (topBid ? topBid + 1 : 1);

export const PAGE_SIZE = 50;

/** Fixed conversion used only at checkout — the product is priced in USD. */
export const USD_TO_INR = 90;
