import { startups } from '@/lib/data';
import { admin, error, slugify } from '@/lib/server';
import { normalizeUrl, startupSchema } from '@/lib/validation';

export async function GET() {
  const db = admin();
  if (!db) {
    return Response.json({ startups });
  }

  const { data, error: e } = await db
    .from('startup_leaderboard')
    .select('*')
    .order('total', { ascending: false })
    .order('created_at', { ascending: true });

  if (e) {
    return error('Could not load startups', 500, 'DATABASE_ERROR');
  }

  return Response.json({ startups: data });
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const input = startupSchema.parse(raw);
    const norm = normalizeUrl(input.url);
    const db = admin();

    const desc = input.description || `Discover ${input.name} on BoostPad.`;
    const logoUrl = `https://unavatar.io/${norm.domain}`;

    // Offline / Preview mode if Supabase credentials are not set
    if (!db) {
      return Response.json(
        {
          startup: {
            id: `preview_${crypto.randomUUID()}`,
            slug: slugify(input.name),
            name: input.name,
            url: norm.url,
            domain: norm.domain,
            description: desc,
            category: input.category,
            founder_name: input.founderName || null,
            founder_email: input.founderEmail || null,
            logo_url: logoUrl,
          },
          preview: true,
        },
        { status: 201 }
      );
    }

    const { data, error: e } = await db
      .from('startups')
      .insert({
        name: input.name,
        slug: `${slugify(input.name)}-${crypto.randomUUID().slice(0, 6)}`,
        url: norm.url,
        domain: norm.domain,
        description: desc,
        category: input.category,
        founder_name: input.founderName || null,
        founder_email: input.founderEmail || null,
        logo_url: logoUrl,
        status: 'active',
      })
      .select('id,slug,name,url,domain,description,category,logo_url')
      .single();

    if (e) {
      if (e.code === '23505') {
        return error('This domain is already listed on BoostPad', 409, 'DUPLICATE_DOMAIN');
      }
      return error('Could not create startup record', 500, 'DATABASE_ERROR');
    }

    return Response.json({ startup: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Please check the submitted fields';
    return error(message, 400, 'VALIDATION_ERROR');
  }
}