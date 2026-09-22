import { z } from 'zod';
import { verifyRazorpaySignature, isRazorpayConfigured } from '@/lib/razorpay';
import { admin, error } from '@/lib/server';

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const x = schema.parse(await req.json());

    if (!isRazorpayConfigured()) {
      return error('Payments are not configured', 503);
    }

    const isValid = verifyRazorpaySignature({
      order_id: x.razorpay_order_id,
      payment_id: x.razorpay_payment_id,
      signature: x.razorpay_signature,
    });

    if (!isValid) {
      return error('Invalid payment signature', 400, 'INVALID_SIGNATURE');
    }

    const db = admin();
    if (!db) return error('Database is not configured', 503);

    const { data: p } = await db
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', x.razorpay_order_id)
      .single();

    if (!p) return error('Payment order not found', 404);

    if (p.status === 'paid') {
      return Response.json({ verified: true, paymentId: p.id, idempotent: true });
    }

    const { error: e } = await db.rpc('verify_payment_and_create_boost', {
      p_payment_id: p.id,
      p_razorpay_payment_id: x.razorpay_payment_id,
      p_signature: x.razorpay_signature,
    });

    if (e) return error('Payment could not be recorded', 500);

    return Response.json({ verified: true, paymentId: p.id });
  } catch {
    return error('Invalid verification request');
  }
}