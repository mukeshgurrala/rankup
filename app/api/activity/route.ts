import { getActivity } from '@/lib/queries';

export const dynamic = 'force-dynamic';

/** Snapshot of the latest verified bids, used to refresh the live feed. */
export async function GET() {
  return Response.json({ activity: await getActivity(12) });
}
