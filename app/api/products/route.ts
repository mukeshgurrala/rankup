import { admin, error, slugify } from '@/lib/server';
import { normalizeUrl, productSchema } from '@/lib/validation';
import { faviconUrl } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Register a product. A listing only reaches the board once a bid is verified. */
export async function POST(req: Request) {
  try {
    const input = productSchema.parse(await req.json());
    const norm = normalizeUrl(input.url);
    const db = admin();

    if (!db) {
      return error('Database is not configured. No listing was created.', 503, 'DATABASE_ERROR');
    }

    // Re-use an existing listing for this domain so a repeat bid raises the
    // same product rather than creating a duplicate entry.
    const { data: existing } = await db
      .from('startups')
      .select('id,slug,name,url,domain,category')
      .eq('domain', norm.domain)
      .maybeSingle();

    if (existing) {
      return Response.json({ product: existing, existing: true }, { status: 200 });
    }

    const { data, error: e } = await db
      .from('startups')
      .insert({
        name: input.name,
        slug: `${slugify(input.name)}-${crypto.randomUUID().slice(0, 6)}`,
        url: norm.url,
        domain: norm.domain,
        description: input.tagline,
        tagline: input.tagline,
        category: input.category,
        founder_email: input.founderEmail?.trim().toLowerCase() || null,
        logo_url: faviconUrl(norm.domain),
        status: 'active',
      })
      .select('id,slug,name,url,domain,category')
      .single();

    if (e) {
      if (e.code === '23505') {
        return error('This domain is already listed on RankUp', 409, 'DUPLICATE_DOMAIN');
      }
      console.error('[API/products] Insert error:', e);
      return error('Could not create the listing', 500, 'DATABASE_ERROR');
    }

    return Response.json({ product: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Please check the submitted fields';
    return error(message, 400, 'VALIDATION_ERROR');
  }
}
