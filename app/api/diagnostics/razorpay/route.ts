import { readFileSync } from 'fs';
import path from 'path';
import { getRazorpayClient, isRazorpayConfigured, verifyRazorpaySignature } from '@/lib/razorpay';

/**
 * Read-only diagnostic for payment setup. Never returns secret values —
 * only masked key prefixes and raw gateway error messages.
 * Development only — never exposed in production builds.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Diagnostics are disabled in production' }, { status: 404 });
  }

  const report: Record<string, unknown> = {};

  // 1. Which Razorpay env vars exist, and how they are formatted
  for (const name of ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) {
    const raw = process.env[name];
    if (raw === undefined) {
      report[name] = 'MISSING';
      continue;
    }
    const trimmed = raw.trim();
    const quoted = raw !== trimmed || /^["']|["']$/.test(raw);
    const unquoted = trimmed.replace(/^["']+|["']+$/g, '');
    report[name] = {
      present: true,
      quoted_in_env: quoted,
      length: unquoted.length,
      preview: unquoted.slice(0, 12) + '…',
      mode: unquoted.startsWith('rzp_live') ? 'LIVE' : unquoted.startsWith('rzp_test') ? 'TEST' : 'UNKNOWN_PREFIX',
    };
  }

  // 2. .env.local file syntax check (quotes/spacing issues Next.js may or may not strip)
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const lines = readFileSync(envPath, 'utf-8').split(/\r?\n/);
    report.env_local_lines = lines
      .filter((l) => l.trim() && !l.trim().startsWith('#'))
      .map((l) => {
        const key = l.split('=')[0]?.trim() || '?';
        const value = l.slice(l.indexOf('=') + 1);
        return {
          key,
          value_quoted: /^["'].*["']\s*$/.test(value),
          value_has_spaces: value !== value.trim(),
          key_id_prefix: key === 'RAZORPAY_KEY_ID' ? value.trim().slice(0, 12) + '…' : undefined,
        };
      })
      .filter((l) => l.key.startsWith('RAZORPAY') || l.key.startsWith('SUPABASE'));
  } catch {
    report.env_local_lines = 'could not read .env.local';
  }

  // 3. Functional test: try creating a tiny ₹1 order with the live client
  if (!isRazorpayConfigured()) {
    report.functional_test = 'SKIPPED — keys not configured';
  } else {
    const rzp = getRazorpayClient();
    try {
      const order = await rzp!.orders.create({ amount: 100, currency: 'INR', receipt: `diag_${Date.now()}` });
      report.functional_test = { ok: true, order_id: order.id };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; error?: unknown; message?: string };
      report.functional_test = {
        ok: false,
        http_status: e.statusCode ?? null,
        gateway_error: e.error ?? null,
        message: e.message ?? String(err),
        hint:
          e.statusCode === 401
            ? 'KEY_ID / KEY_SECRET are invalid for this mode (test vs live mismatch, or wrong secret)'
            : e.statusCode === 403
              ? 'Key is valid but lacks permission — account/KYC may not be activated'
              : null,
      };
    }
  }

  report.signature_helper_available = typeof verifyRazorpaySignature === 'function';

  return Response.json(report, { status: 200 });
}
