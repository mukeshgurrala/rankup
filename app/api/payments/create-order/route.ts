import { z } from 'zod';
import { getRazorpayClient, isRazorpayConfigured } from '@/lib/razorpay';
import { admin, error } from '@/lib/server';

const schema = z.object({
  startupId: z.string().min(1),
  amount: z.number().int().min(1).max(500000),
});

export async function POST(req: Request) {
  try {
    const x = schema.parse(await req.json());

    if (x.startupId.startsWith('preview_') || !isRazorpayConfigured()) {
      return Response.json({ preview: true, amount: x.amount, currency: 'INR' });
    }

    const db = admin();
    if (!db) return error('Database is not configured', 503);

    const { data: s } = await db
      .from('startups')
      .select('id,status')
      .eq('id', x.startupId)
      .eq('status', 'active')
      .single();

    if (!s) return error('Active startup not found', 404);

    const rz = getRazorpayClient();
    if (!rz) return error('Payment gateway unavailable', 503);

    const order = await rz.orders.create({
      amount: x.amount * 100,
      currency: 'INR',
      receipt: `boost_${Date.now()}`,
    });

    const { error: e } = await db.from('payments').insert({
      startup_id: s.id,
      razorpay_order_id: order.id,
      amount: x.amount,
      currency: 'INR',
      status: 'created',
    });

    if (e) return error('Could not save payment', 500);

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    return error('Invalid order request');
  }
}