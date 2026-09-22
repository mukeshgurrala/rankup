import { z } from 'zod';
import { admin, error } from '@/lib/server';

const querySchema = z.string().email('A valid email address is required');

export async function GET(req: Request) {
  const email = querySchema.safeParse(new URL(req.url).searchParams.get('email')?.trim().toLowerCase());
  if (!email.success) return error('A valid email address is required');

  const db = admin();
  if (!db) return error('Database is not configured', 503, 'DATABASE_ERROR');

  const { count, error: queryError } = await db
    .from('payments')
    .select('id, startups!inner(founder_email)', { count: 'exact', head: true })
    .eq('startups.founder_email', email.data)
    .eq('status', 'paid');

  if (queryError) {
    console.error('[API/boost-price] Query error:', queryError);
    return error('Could not calculate boost price', 500, 'DATABASE_ERROR');
  }

  return Response.json({ amount: 25 + (count ?? 0), currency: 'INR', boostNumber: (count ?? 0) + 1 });
}