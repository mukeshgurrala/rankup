import 'server-only';
import { admin } from './server';
import { LAUNCH_DATE, type Activity, type PlatformStats, type Product } from './data';

type BoardRow = {
  id: string;
  slug: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  tagline: string | null;
  category: string;
  logo_url: string | null;
  click_count: number | null;
  created_at: string;
  bid: number;
  total_paid: number;
  bid_count: number;
  last_bid_at: string | null;
};

const map = (row: BoardRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  url: row.url,
  domain: row.domain,
  description: row.description,
  tagline: row.tagline || row.description,
  category: row.category,
  logo: row.logo_url || undefined,
  bid: Number(row.bid || 0),
  totalPaid: Number(row.total_paid || 0),
  bidCount: Number(row.bid_count || 0),
  clickCount: Number(row.click_count || 0),
  createdAt: row.created_at,
  lastBidAt: row.last_bid_at || undefined,
});

export type Board = 'all-time' | 'today';

const viewFor = (board: Board) => (board === 'today' ? 'product_board_today' : 'product_board');

export type BoardPage = {
  products: Product[];
  total: number;
  /** Absolute rank of the first row on this page (1-based). */
  offset: number;
};

/**
 * Rank is a pure sort: highest standing bid first, earliest listing breaking ties.
 * Pagination keeps absolute rank numbers stable across pages.
 */
export async function getBoard({
  board = 'all-time',
  category,
  page = 1,
  pageSize = 50,
}: {
  board?: Board;
  category?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<BoardPage> {
  const db = admin();
  if (!db) return { products: [], total: 0, offset: 0 };

  const from = (page - 1) * pageSize;
  let query = db
    .from(viewFor(board))
    .select('*', { count: 'exact' })
    .order('bid', { ascending: false })
    .order('created_at', { ascending: true })
    .range(from, from + pageSize - 1);

  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;
  if (error) {
    console.error('[queries] board failed:', error.code, error.message);
    return { products: [], total: 0, offset: 0 };
  }

  return {
    products: (data as BoardRow[]).map(map),
    total: count ?? 0,
    offset: from,
  };
}

/** Top N rows of a board — used by the sidebar widget. */
export async function getTopProducts(board: Board, limit = 6): Promise<Product[]> {
  const db = admin();
  if (!db) return [];
  const { data, error } = await db
    .from(viewFor(board))
    .select('*')
    .order('bid', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data as BoardRow[]).map(map);
}

/** The single highest standing bid — the price floor for claiming #1. */
export async function getTopBid(board: Board = 'all-time'): Promise<number> {
  const top = await getTopProducts(board, 1);
  return top[0]?.bid ?? 0;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = admin();
  if (!db) return null;
  const { data, error } = await db.from('product_board').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return map(data as BoardRow);
}

/** A product's absolute rank on the all-time board. */
export async function getRankOf(product: Product): Promise<number> {
  const db = admin();
  if (!db) return 0;
  const { count, error } = await db
    .from('product_board')
    .select('id', { count: 'exact', head: true })
    .gt('bid', product.bid);
  if (error) return 0;
  return (count ?? 0) + 1;
}

export async function getActivity(limit = 12): Promise<Activity[]> {
  const db = admin();
  if (!db) return [];
  const { data, error } = await db
    .from('bid_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (
    data as {
      id: string;
      name: string;
      slug: string;
      domain: string;
      category: string;
      amount: number;
      rank_claimed: number | null;
      created_at: string;
    }[]
  ).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    domain: r.domain,
    category: r.category,
    amount: Number(r.amount),
    rankClaimed: r.rank_claimed,
    createdAt: r.created_at,
  }));
}

/** Per-category counts, so the category page shows real listing numbers. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const db = admin();
  if (!db) return {};
  const { data, error } = await db.from('product_board').select('category');
  if (error || !data) return {};
  const counts: Record<string, number> = {};
  for (const row of data as { category: string }[]) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}

function daysSinceLaunch() {
  const ms = Date.now() - new Date(LAUNCH_DATE).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * Every figure here is counted from our own tables. Nothing is estimated or
 * seeded — an empty platform honestly reports zeros.
 */
export async function getStats(): Promise<PlatformStats> {
  const db = admin();
  const empty: PlatformStats = {
    visitors: 0,
    visitorsToday: 0,
    online: 0,
    revenue: 0,
    products: 0,
    bids: 0,
    daysSinceLaunch: daysSinceLaunch(),
  };
  if (!db) return empty;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();

  const [visitors, today, online, products, bidRows] = await Promise.all([
    db.from('site_sessions').select('session_id', { count: 'exact', head: true }),
    db
      .from('site_sessions')
      .select('session_id', { count: 'exact', head: true })
      .gte('last_seen', startOfDay.toISOString()),
    db
      .from('site_sessions')
      .select('session_id', { count: 'exact', head: true })
      .gte('last_seen', fiveMinAgo),
    db.from('startups').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('bids').select('amount').eq('status', 'paid'),
  ]);

  const amounts = (bidRows.data as { amount: number }[] | null) ?? [];

  return {
    visitors: visitors.count ?? 0,
    visitorsToday: today.count ?? 0,
    online: online.count ?? 0,
    revenue: amounts.reduce((sum, r) => sum + Number(r.amount), 0),
    products: products.count ?? 0,
    bids: amounts.length,
    daysSinceLaunch: daysSinceLaunch(),
  };
}
