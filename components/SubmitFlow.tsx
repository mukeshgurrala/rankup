'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { StartupLogo } from './StartupLogo';
import { CharacterMark } from './Marks';
import type { RazorpaySuccessHandlerArgs, RazorpayOptions } from '@/global';

// Razorpay orders are always created in INR (USD orders fail unless International
// is enabled on the account). Boost amount moves in ₹1 increments from ₹25.
const START_AMOUNT = 25;

const CATEGORIES = [
  'AI',
  'Design',
  'Fintech',
  'Productivity',
  'Climate',
  'Edtech',
  'Developer Tools',
  'Marketing',
  'Other',
];

function formatBoost(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function SubmitFlow({
  initialUrl = '',
  initialCategory = 'AI',
}: {
  initialUrl?: string;
  initialCategory?: string;
}) {
  const [amount, setAmount] = useState(START_AMOUNT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [boostNumber, setBoostNumber] = useState(1);
  const [startupId, setStartupId] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [form, setForm] = useState({
    url: initialUrl.replace(/^https?:\/\/\/+/, 'https://'),
    name: '',
    category: initialCategory || 'AI',
  });

  const domain = useMemo(() => {
    try {
      return new URL(/^https?:/.test(form.url) ? form.url : `https://${form.url}`).hostname.replace(
        /^www\./,
        ''
      );
    } catch {
      return '';
    }
  }, [form.url]);

  const set = (k: string, v: string) => setForm((x) => ({ ...x, [k]: v }));

  const loadCurrentPrice = useCallback(async (email: string): Promise<number | null> => {
    if (!email) return null;
    setPriceLoading(true);
    try {
      const response = await fetch(`/api/boost-price?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Could not calculate boost price');
      setAmount(result.amount);
      setBoostNumber(result.boostNumber);
      return result.amount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not calculate boost price');
      return null;
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    const storageKey = 'boostpad-user-id';
    const storedId = localStorage.getItem(storageKey) || crypto.randomUUID();
    localStorage.setItem(storageKey, storedId);
    const email = `${storedId}@users.boostpad.local`;

    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      setVisitorEmail(email);
      await loadCurrentPrice(email);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadCurrentPrice]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      let id = startupId;

      if (!visitorEmail) throw new Error('Could not identify this browser');

      const currentAmount = await loadCurrentPrice(visitorEmail);
      if (!currentAmount) throw new Error('Could not calculate the current boost price');

      // 1. Submit or retrieve startup record
      if (!id) {
        const response = await fetch('/api/startups', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...form,
            founderEmail: visitorEmail,
            url: /^https?:/.test(form.url) ? form.url : `https://${form.url}`,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error?.message || 'Could not register startup');
        }
        id = result.startup.id;
        setStartupId(id);
      }

      // 2. Create Razorpay order on server
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amount: currentAmount,
          currency: 'INR',
          startupId: id,
          boosterEmail: visitorEmail,
        }),
      });

      const order = await orderResponse.json();
      if (!orderResponse.ok || !order.success) {
        throw new Error(order.error || 'Could not create payment order');
      }

      if (order.preview) {
        throw new Error('Payment gateway is not configured. No boost was created.');
      }

      // 3. Load SDK & trigger Razorpay Modal
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK failed to load');
      }

      const options: RazorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'RankUp',
        description: `Rank boost for ${form.name}`,
        order_id: order.order_id,
        theme: {
          color: '#0075de',
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
        handler: async (payment: RazorpaySuccessHandlerArgs) => {
          try {
            // 4. Server-side verification
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ ...payment, startupId: id }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              setError('Payment verification failed. Please contact support.');
              return;
            }

            setDone(true);
          } catch {
            setError('Payment verification failed. Please contact support.');
          } finally {
            setBusy(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-pills bg-notion-blue text-pure-white">
          <Check size={28} />
        </div>
        <h2 className="t-heading mt-6 text-ink-black">Your product is live &amp; boosted</h2>
        <p className="t-editorial mx-auto mt-3 max-w-sm">
          Your verified boost of {formatBoost(amount)} has been confirmed and added to the public
          leaderboard.
        </p>
        <Link href="/" className="btn btn-primary btn-lg mt-7">
          View leaderboard <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card overflow-hidden">
      <div
        className="flex items-start justify-between gap-5 p-6 sm:p-8"
        style={{ background: 'var(--color-sky-tint)' }}
      >
        <div>
          <span className="pill bg-pure-white text-ink-black">01 — Publish</span>
          <h2 className="t-heading mt-4 text-ink-black">One verified rank.</h2>
          <p className="t-body mt-2 max-w-sm">
            Put your product in front of people already looking for what you built.
          </p>
        </div>
        <CharacterMark index={0} size={44} className="hidden sm:grid" />
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <label className="field-label" htmlFor="sf-url">
            Website
          </label>
          <input
            id="sf-url"
            className="field"
            required
            placeholder="https://yourproduct.com"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
          />
          {domain && (
            <div className="mt-3 flex items-center gap-3 rounded-buttons border border-hairline bg-paper-warmth p-3">
              <StartupLogo domain={domain} name={form.name || domain} className="h-11 w-11" />
              <div>
                <p className="text-[14px] font-medium leading-[1.43]">Logo preview</p>
                <p className="t-caption text-black/40">{domain}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-[1.2fr_.8fr]">
          <div>
            <label className="field-label" htmlFor="sf-name">
              Name
            </label>
            <input
              id="sf-name"
              className="field"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Acme AI"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="sf-cat">
              Category
            </label>
            <select
              id="sf-cat"
              className="field"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-hairline pt-6">
          <div
            className="flex items-end justify-between gap-4 rounded-cards p-5 sm:p-6"
            style={{ background: 'var(--color-midnight-ink)' }}
          >
            <div>
              <span className="pill bg-white/10 text-pure-white">Boost {boostNumber}</span>
              <p className="mt-3 text-[14px] leading-[1.43] text-white/70">
                {priceLoading ? 'Updating price…' : 'Your current publishing price'}
              </p>
            </div>
            <p className="text-[40px] font-semibold leading-[1.04] tracking-[-1.4px] text-pure-white">
              {formatBoost(amount)}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-buttons p-4 text-[14px] leading-[1.43]"
            style={{ background: 'rgba(246,73,50,0.1)', color: 'var(--color-vermillion)' }}
          >
            {error}
          </div>
        )}

        <button disabled={busy || priceLoading} className="btn btn-primary btn-lg w-full">
          {busy ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Preparing secure checkout…
            </>
          ) : (
            <>
              Publish &amp; boost for {formatBoost(amount)}
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="t-caption text-center text-black/40">
          Payments are verified server-side before any rank changes.
        </p>
      </div>
    </form>
  );
}
