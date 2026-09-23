import { z } from 'zod';
import { admin } from '@/lib/server';

export const dynamic = 'force-dynamic';

const schema = z.object({ productId: z.string().uuid() });

/** Records an outbound click. Fire-and-forget from the client. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const db = admin();
  if (!db) return Response.json({ ok: false }, { status: 503 });

  const { error } = await db.rpc('register_click', { p_startup_id: parsed.data.productId });
  if (error) {
    console.error('[API/click] error:', error.code);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true });
}
