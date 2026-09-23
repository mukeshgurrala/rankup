import { admin, error } from '@/lib/server';
import { priceToClaim } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * The live price to claim a rank: $1 more than whoever currently holds it.
 * `rank` is 1-based. Claiming a rank below the last occupied position costs $1.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const rank = Math.max(1, Number(params.get('rank') ?? '1') || 1);

  const db = admin();
  if (!db) return error('Database is not configured', 503, 'DATABASE_ERROR');

  const { data, error: queryError } = await db
    .from('product_board')
    .select('bid, name, slug')
    .order('bid', { ascending: false })
    .order('created_at', { ascending: true })
    .range(rank - 1, rank - 1);

  if (queryError) {
    console.error('[API/bid-price] Query error:', queryError);
    return error('Could not calculate the bid price', 500, 'DATABASE_ERROR');
  }

  const occupant = (data as { bid: number; name: string; slug: string }[])?.[0];

  return Response.json({
    rank,
    occupied: Boolean(occupant),
    currentBid: occupant?.bid ?? 0,
    price: occupant ? priceToClaim(occupant.bid) : 1,
    occupant: occupant ? { name: occupant.name, slug: occupant.slug } : null,
    currency: 'USD',
  });
}
