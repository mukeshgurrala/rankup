import { z } from 'zod';
import { getRazorpayClient, isRazorpayConfigured } from '@/lib/razorpay';
import { admin } from '@/lib/server';
import { USD_TO_INR, priceToClaim } from '@/lib/data';
import { bidAmountSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const schema = z.object({
  amount: bidAmountSchema, // whole US dollars
  rank: z.number().int().min(1).max(100000),
  productId: z.string().uuid('A saved listing is required before payment'),
});

function fail(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return Response.json({ success: false, error: message, ...extra }, { status });
}

/**
 * Creates a Razorpay order for a bid. The bid is denominated in USD; Razorpay
 * is charged the INR equivalent because the account is domestic-only.
 * The server re-checks the price so a stale client can never underpay.
 */
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || 'Invalid bid parameters');
    }
    const { amount, rank, productId } = parsed.data;

    if (!isRazorpayConfigured()) {
      return fail('Payment gateway is not configured. No bid was placed.', 503);
    }
    const db = admin();
    if (!db) return fail('Database is not configured. No bid was placed.', 503);

    // Authoritative price check against the live board.
    const { data: occupantRows, error: occErr } = await db
      .from('product_board')
      .select('bid')
      .order('bid', { ascending: false })
      .order('created_at', { ascending: true })
      .range(rank - 1, rank - 1);

    if (occErr) {
      console.error('[API/bids/create-order] Price lookup failed:', occErr);
      return fail('Could not verify the current bid price', 500);
    }

    const occupantBid = (occupantRows as { bid: number }[])?.[0]?.bid ?? 0;
    const required = occupantBid ? priceToClaim(occupantBid) : 1;

    if (amount < required) {
      return fail(
        `Rank #${rank} now requires at least $${required}. The board moved while you were bidding.`,
        409,
        { requiredAmount: required, rank }
      );
    }

    const rzp = getRazorpayClient();
    if (!rzp) return fail('Payment gateway is temporarily unavailable', 503);

    const inrAmount = amount * USD_TO_INR;
    const order = await rzp.orders.create({
      amount: inrAmount * 100, // paise
      currency: 'INR',
      receipt: `bid_${Date.now().toString().slice(-10)}`,
      notes: { product_id: productId, rank: String(rank), usd: String(amount) },
    });

    const { error: paymentError } = await db.from('payments').insert({
      startup_id: productId,
      razorpay_order_id: order.id,
      amount: inrAmount,
      amount_usd: amount,
      rank_claimed: rank,
      currency: 'INR',
      status: 'created',
    });

    if (paymentError) {
      console.error('[API/bids/create-order] Payment record error:', paymentError);
      return fail('Could not prepare the payment record. No bid was placed.', 500);
    }

    return Response.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      usd: amount,
      key_id: (process.env.RAZORPAY_KEY_ID ?? '').trim().replace(/^["']+|["']+$/g, ''),
    });
  } catch (err: unknown) {
    const e = err as { error?: unknown; message?: string };
    const detail = e.error ? JSON.stringify(e.error) : e.message || 'Failed to create the order';
    console.error('[API/bids/create-order] Error:', err);
    return fail(`Payment gateway error: ${detail}`, 500);
  }
}
