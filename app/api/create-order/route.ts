import { z } from 'zod';
import { getRazorpayClient, isRazorpayConfigured } from '@/lib/razorpay';
import { admin } from '@/lib/server';

const createOrderSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be at least 1').max(500000, 'Amount exceeds maximum limit'),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string()).optional(),
  startupId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = createOrderSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid order parameters',
        },
        { status: 400 }
      );
    }

    const { amount, currency, receipt, notes, startupId } = parsed.data;

    // A boost order must always come from Razorpay. Preview orders must not
    // be able to reach the leaderboard without a verified payment.
    if (!isRazorpayConfigured()) {
      return Response.json({
        success: false,
        error: 'Payment gateway is not configured. No boost was created.',
      }, { status: 503 });
    }

    const rzp = getRazorpayClient();
    if (!rzp) {
      return Response.json(
        { success: false, error: 'Payment gateway is temporarily unavailable' },
        { status: 503 }
      );
    }

    // Convert to subunit: INR amounts are multiplied by 100 to get paise
    const amountInSubunits = Math.round(amount * 100);
    const orderReceipt = receipt || `rcpt_${Date.now().toString().slice(-8)}`;

    const order = await rzp.orders.create({
      amount: amountInSubunits,
      currency,
      receipt: orderReceipt,
      notes: {
        ...notes,
        ...(startupId ? { startup_id: startupId } : {}),
      },
    });

    // If a startupId is provided and Supabase is configured, record the pending payment
    if (startupId && !startupId.startsWith('preview_')) {
      const db = admin();
      if (db) {
        await db.from('payments').insert({
          startup_id: startupId,
          razorpay_order_id: order.id,
          amount,
          currency,
          status: 'created',
        });
      }
    }

    return Response.json(
      {
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']+|["']+$/g, ''),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // Surface the real Razorpay gateway error (auth failures, KYC issues, etc.)
    const e = err as { statusCode?: number; error?: unknown; message?: string };
    const detail = e.error ? JSON.stringify(e.error) : e.message || 'Failed to create payment order';
    console.error('[API/create-order] Error:', err);
    return Response.json({ success: false, error: `Payment gateway error: ${detail}` }, { status: 500 });
  }
}
