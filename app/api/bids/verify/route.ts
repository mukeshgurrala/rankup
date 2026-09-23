import { z } from 'zod';
import { isRazorpayConfigured, verifyRazorpaySignature } from '@/lib/razorpay';
import { admin } from '@/lib/server';

export const dynamic = 'force-dynamic';

const schema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Payment signature is required'),
});

function fail(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Verifies the Razorpay signature server-side, then records the bid inside a
 * single database transaction. Replaying the same payment is a no-op.
 */
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || 'Invalid verification payload');
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    if (!isRazorpayConfigured()) {
      return fail('Payment gateway is not configured. No bid was recorded.', 503);
    }

    const isValid = verifyRazorpaySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!isValid) {
      return fail('Payment signature verification failed. Invalid transaction.');
    }

    const db = admin();
    if (!db) return fail('Database is not configured. No bid was recorded.', 503);

    const { data: payment, error: lookupError } = await db
      .from('payments')
      .select('id,status,amount_usd,rank_claimed,startup_id')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (lookupError) {
      console.error('[API/bids/verify] Lookup error:', lookupError);
      return fail('Could not find the payment record.', 500);
    }
    if (!payment) {
      return fail('This order was never prepared. No bid was recorded.', 404);
    }
    if (payment.status === 'paid') {
      return Response.json({ success: true, idempotent: true, amount: payment.amount_usd });
    }

    const { error: rpcError } = await db.rpc('verify_payment_and_create_bid', {
      p_payment_id: payment.id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_signature: razorpay_signature,
    });

    if (rpcError) {
      console.error('[API/bids/verify] RPC error:', rpcError);
      return fail('Payment verified with the gateway, but recording the bid failed.', 500);
    }

    // Report the rank the bid actually landed on.
    const { count } = await db
      .from('product_board')
      .select('id', { count: 'exact', head: true })
      .gt('bid', payment.amount_usd ?? 0);

    return Response.json({
      success: true,
      amount: payment.amount_usd,
      rank: (count ?? 0) + 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal verification error';
    console.error('[API/bids/verify] Error:', err);
    return fail(message, 500);
  }
}
