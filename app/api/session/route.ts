import { z } from 'zod';
import { admin } from '@/lib/server';
import { getStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const schema = z.object({ sessionId: z.string().min(8).max(64) });

/**
 * First-party visitor counting: records this browser session and returns the
 * live counts. Every number is derived from our own table — no estimates.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  const db = admin();

  if (parsed.success && db) {
    const { error } = await db.rpc('touch_session', { p_session_id: parsed.data.sessionId });
    if (error) console.error('[API/session] error:', error.code);
  }

  const stats = await getStats();
  return Response.json({
    online: stats.online,
    visitorsToday: stats.visitorsToday,
    visitors: stats.visitors,
  });
}
