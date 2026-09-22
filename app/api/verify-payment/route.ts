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

    // Persist verified boost to Supabase if database is available
    const db = admin();
    if (db) {
      // Find the payment record associated with this Razorpay order
      const { data: paymentRecord } = await db
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();

      if (paymentRecord) {
        // Idempotency check: if already processed, return success immediately
        if (paymentRecord.status === 'paid') {
          return Response.json({
            success: true,
            idempotent: true,
            message: 'Payment was already verified',
          });
        }

        // Execute transactional RPC to mark payment paid and insert boost record
        const { error: rpcError } = await db.rpc('verify_payment_and_create_boost', {
          p_payment_id: paymentRecord.id,
          p_razorpay_payment_id: razorpay_payment_id,
          p_signature: razorpay_signature,
        });

        if (rpcError) {
          console.error('[API/verify-payment] Database RPC error:', rpcError);
          return Response.json(
            {
              success: false,
              error: 'Payment was verified with Razorpay, but recording to database failed.',
            },
            { status: 500 }
          );
        }
      }
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
