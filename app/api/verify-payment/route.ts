import { z } from 'zod';
import { verifyRazorpaySignature, isRazorpayConfigured } from '@/lib/razorpay';
import { admin } from '@/lib/server';

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Payment signature is required'),
  startupId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = verifyPaymentSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid verification payload',
        },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    if (!isRazorpayConfigured() || razorpay_order_id.startsWith('order_mock_')) {
      return Response.json({
        success: false,
        error: 'Payment gateway is not configured. No boost was created.',
      }, { status: 503 });
    }

    // Secure HMAC-SHA256 signature verification
    const isValid = verifyRazorpaySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return Response.json(
        {
          success: false,
          error: 'Payment signature verification failed. Invalid transaction.',
        },
        { status: 400 }
      );
    }

    const db = admin();
    if (!db) {
      return Response.json({ success: false, error: 'Database is not configured. No boost was created.' }, { status: 503 });
    }

    const { data: paymentRecord, error: lookupError } = await db
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (lookupError) {
      console.error('[API/verify-payment] Payment lookup error:', lookupError);
      return Response.json({ success: false, error: 'Could not find payment record.' }, { status: 500 });
    }

    if (!paymentRecord) {
      return Response.json({ success: false, error: 'Payment order was not prepared. No boost was created.' }, { status: 404 });
    }

    if (paymentRecord.status === 'paid') {
      return Response.json({ success: true, idempotent: true, message: 'Payment was already verified' });
    }

    const { error: rpcError } = await db.rpc('verify_payment_and_create_boost', {
      p_payment_id: paymentRecord.id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_signature: razorpay_signature,
    });

    if (rpcError) {
      console.error('[API/verify-payment] Database RPC error:', rpcError);
      return Response.json(
        { success: false, error: 'Payment was verified with Razorpay, but recording to database failed.' },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal verification error';
    console.error('[API/verify-payment] Error:', err);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
