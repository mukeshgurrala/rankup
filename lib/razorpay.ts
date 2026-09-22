import 'server-only';
import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Read an env var and strip whitespace AND surrounding quotes.
 * .env.local values like RAZORPAY_KEY_ID="rzp_test_x" otherwise break auth.
 */
function readEnv(name: string): string {
  return (process.env[name] ?? '').trim().replace(/^["']+|["']+$/g, '');
}

/**
 * Get an authenticated Razorpay instance.
 * Credentials are kept strictly on the server.
 */
export function getRazorpayClient(): Razorpay | null {
  const key_id = readEnv('RAZORPAY_KEY_ID');
  const key_secret = readEnv('RAZORPAY_KEY_SECRET');

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Returns whether Razorpay credentials are fully configured.
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(readEnv('RAZORPAY_KEY_ID') && readEnv('RAZORPAY_KEY_SECRET'));
}

/**
 * Securely verifies the payment signature using HMAC-SHA256
 * and constant-time string comparison to prevent timing attacks.
 */
export function verifyRazorpaySignature(params: {
  order_id: string;
  payment_id: string;
  signature: string;
}): boolean {
  const secret = readEnv('RAZORPAY_KEY_SECRET');
  if (!secret) {
    return false;
  }

  const { order_id, payment_id, signature } = params;
  if (!order_id || !payment_id || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${order_id}|${payment_id}`)
    .digest('hex');

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}
