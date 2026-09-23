'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, RefreshCw } from 'lucide-react';
import { Favicon } from './Favicon';
import { CATEGORIES } from '@/lib/categories';
import { usd } from '@/lib/data';
import type { RazorpayOptions, RazorpaySuccessHandlerArgs } from '@/global';

type Price = {
  rank: number;
  occupied: boolean;
  currentBid: number;
  price: number;
  occupant: { name: string; slug: string } | null;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const src = 'https://checkout.razorpay.com/v1/checkout.js';
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

async function requestPrice(rank: number): Promise<Price> {
  const res = await fetch(`/api/bid-price?rank=${rank}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Could not load the current price');
  return data as Price;
}

export function ClaimFlow({
  initialRank,
  initialAmount,
  initialCategory,
  initialUrl,
}: {
  initialRank: number;
  initialAmount?: number;
  initialCategory?: string;
  initialUrl?: string;
}) {
  const [rank, setRank] = useState(initialRank);
  const [price, setPrice] = useState<Price | null>(null);
  const [amount, setAmount] = useState(initialAmount ?? 1);
  const [touchedAmount, setTouchedAmount] = useState(Boolean(initialAmount));
  const [priceLoading, setPriceLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ amount: number; rank: number } | null>(null);

  const [form, setForm] = useState({
    url: initialUrl ?? '',
    name: '',
    tagline: '',
    category: initialCategory && CATEGORIES.includes(initialCategory as never) ? initialCategory : '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

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

  const fetchPrice = useCallback(
    async (targetRank: number, adoptAmount: boolean) => {
      setPriceLoading(true);
      try {
        const data = await requestPrice(targetRank);
        setPrice(data);
        if (adoptAmount) setAmount(data.price);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load the current price');
        return null;
      } finally {
        setPriceLoading(false);
      }
    },
    []
  );

  // Load the opening price once. State is only touched from the async
  // continuation, never synchronously inside the effect body.
  useEffect(() => {
    let cancelled = false;
    requestPrice(initialRank)
      .then((data) => {
        if (cancelled) return;
        setPrice(data);
        if (!initialAmount) setAmount(data.price);
        setPriceLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load the current price');
        setPriceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialRank, initialAmount]);

  function changeRank(next: number) {
    const target = Math.max(1, next);
    setRank(target);
    setTouchedAmount(false);
    void fetchPrice(target, true);
  }

  const minimum = price?.price ?? 1;
  const belowMinimum = amount < minimum;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      // Re-check the price immediately before paying so the board can't have
      // moved underneath the bidder.
      const fresh = await fetchPrice(rank, false);
      if (!fresh) throw new Error('Could not confirm the current price');
      if (amount < fresh.price) {
        setAmount(fresh.price);
        throw new Error(
          `Rank #${rank} now needs at least ${usd(fresh.price)}. The amount has been updated.`
        );
      }

      // 1. Register (or reuse) the listing.
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          url: /^https?:/.test(form.url) ? form.url : `https://${form.url}`,
        }),
      });
      const productData = await productRes.json();
      if (!productRes.ok) {
        throw new Error(productData.error?.message || 'Could not register the listing');
      }
      const productId = productData.product.id;

      // 2. Create the order server-side.
      const orderRes = await fetch('/api/bids/create-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount, rank, productId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok || !order.success) {
        if (order.requiredAmount) setAmount(order.requiredAmount);
        throw new Error(order.error || 'Could not create the payment order');
      }

      // 3. Open checkout.
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error('Checkout failed to load');

      const options: RazorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'RankUp',
        description: `Rank #${rank} · ${usd(amount)} bid for ${form.name}`,
        order_id: order.order_id,
        theme: { color: '#0075de' },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (payment: RazorpaySuccessHandlerArgs) => {
          try {
            // 4. Verify server-side before anything is ranked.
            const verifyRes = await fetch('/api/bids/verify', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(payment),
            });
            const verified = await verifyRes.json();
            if (!verifyRes.ok || !verified.success) {
              setError('Payment verification failed. Please contact support.');
              return;
            }
            setResult({ amount: verified.amount ?? amount, rank: verified.rank ?? rank });
          } catch {
            setError('Payment verification failed. Please contact support.');
          } finally {
            setBusy(false);
          }
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-pills bg-money text-pure-white">
          <Check size={24} />
        </div>
        <h2 className="t-heading mt-5 text-ink-black">Bid verified</h2>
        <p className="t-body mx-auto mt-2 max-w-sm">
          {form.name} is live at{' '}
          <span className="font-mono font-medium text-ink-black">#{result.rank}</span> with a{' '}
          <span className="font-mono font-medium text-money">{usd(result.amount)}</span> standing
          bid.
        </p>
        <Link href="/" className="btn btn-primary btn-lg mt-6">
          View the leaderboard <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* ---- Rank & price ---- */}
      <section className="card overflow-hidden">
        <header className="border-b border-hairline px-5 py-3">
          <h2 className="text-[13px] font-semibold text-ink-black">1 · Choose your rank</h2>
        </header>

        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div>
              <label className="field-label" htmlFor="rank">
                Target rank
              </label>
              <input
                id="rank"
                type="number"
                min={1}
                step={1}
                value={rank}
                onChange={(e) => changeRank(Number(e.target.value) || 1)}
                className="field font-mono tabular-nums"
              />
            </div>

            <div className="rounded-buttons border border-hairline bg-paper-warmth p-4">
              {priceLoading ? (
                <p className="flex items-center gap-2 font-mono text-[12px] text-black/40">
                  <Loader2 size={13} className="animate-spin" /> checking the board…
                </p>
              ) : price?.occupied ? (
                <p className="text-[13px] leading-[1.5] text-graphite">
                  <span className="font-medium text-ink-black">{price.occupant?.name}</span> holds
                  #{rank} at{' '}
                  <span className="font-mono text-money">{usd(price.currentBid)}</span>. You need at
                  least <span className="font-mono font-medium text-money">{usd(price.price)}</span>{' '}
                  to take it.
                </p>
              ) : (
                <p className="text-[13px] leading-[1.5] text-graphite">
                  Rank #{rank} is unoccupied. The minimum bid is{' '}
                  <span className="font-mono font-medium text-money">{usd(1)}</span>.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="amount">
              Your bid (USD, whole dollars)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[14px] text-money">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  min={minimum}
                  step={1}
                  required
                  value={amount}
                  onChange={(e) => {
                    setTouchedAmount(true);
                    setAmount(Math.floor(Number(e.target.value)) || 0);
                  }}
                  className="field pl-7 font-mono tabular-nums"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setTouchedAmount(false);
                  void fetchPrice(rank, true);
                }}
                className="btn btn-text border border-hairline"
                title="Refresh the current price"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            {belowMinimum && touchedAmount && (
              <p className="mt-2 font-mono text-[11px] text-coral">
                minimum for #{rank} is {usd(minimum)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---- Product ---- */}
      <section className="card overflow-hidden">
        <header className="border-b border-hairline px-5 py-3">
          <h2 className="text-[13px] font-semibold text-ink-black">2 · Your product</h2>
        </header>

        <div className="space-y-4 p-5">
          <div>
            <label className="field-label" htmlFor="url">
              Website URL
            </label>
            <input
              id="url"
              required
              className="field"
              placeholder="https://yourproduct.com"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
            />
            {domain && (
              <div className="mt-2 flex items-center gap-2 rounded-small border border-hairline bg-paper-warmth px-3 py-2">
                <Favicon domain={domain} name={form.name || domain} size={20} />
                <span className="font-mono text-[11px] text-black/50">{domain}</span>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="name">
                Product name
              </label>
              <input
                id="name"
                required
                className="field"
                placeholder="Acme"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                required
                className="field"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                <option value="">Choose…</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="tagline">
              Tagline <span className="normal-case text-black/30">— one line, max 120 chars</span>
            </label>
            <input
              id="tagline"
              required
              maxLength={120}
              className="field"
              placeholder="The fastest way to ship your side project"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-buttons p-3 text-[13px] leading-[1.45]"
          style={{ background: 'rgba(246,73,50,0.08)', color: 'var(--color-vermillion)' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || priceLoading || belowMinimum}
        className="btn btn-primary btn-lg w-full"
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Opening secure checkout…
          </>
        ) : (
          <>
            Pay {usd(amount)} &amp; claim #{rank}
          </>
        )}
      </button>

      <p className="text-center font-mono text-[11px] leading-[1.5] text-black/40">
        One-time, non-refundable payment. Verified server-side before your rank changes.
      </p>
    </form>
  );
}
