'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { StartupLogo } from './StartupLogo';
import type { RazorpaySuccessHandlerArgs, RazorpayOptions } from '@/global';

type Currency = 'INR' | 'USD';

// Boost amount is fully custom, moving in ₹1 / $1 increments ($1 = ₹25 baseline).
// Upper bound only reflects the payment API's hard cap (₹5,00,000) so checkout never fails.
const boostRange: Record<Currency, { min: number; max: number; step: number; start: number }> = {
  INR: { min: 25, max: 500000, step: 1, start: 25 },
  USD: { min: 1, max: 20000, step: 1, start: 1 },
};

function clampAmount(value: number, currency: Currency) {
  const r = boostRange[currency];
  return Math.min(r.max, Math.max(r.min, Math.round(value)));
}

function formatBoost(amount: number, currency: Currency) {
  return currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount}`;
}

// Razorpay orders are always created in INR (USD orders fail unless International
// is enabled on the account). International tiers convert at the $1 = ₹25 baseline.
const USD_TO_INR = 25;

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
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
  const [currency, setCurrency] = useState<Currency>('INR');
  const [amount, setAmount] = useState(boostRange.INR.start);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [boostNumber, setBoostNumber] = useState(1);
  const [startupId, setStartupId] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [form, setForm] = useState({
    url: initialUrl.replace(/^https?:\/\/\/+/, 'https://'),
    name: '',
    category: initialCategory || 'AI',
  });

  useEffect(() => {
    const storageKey = 'boostpad-user-id';
    const storedId = localStorage.getItem(storageKey) || crypto.randomUUID();
    localStorage.setItem(storageKey, storedId);
    setVisitorEmail(`${storedId}@users.boostpad.local`);
  }, []);

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

  async function loadCurrentPrice(): Promise<number | null> {
    if (!visitorEmail) return null;
    setPriceLoading(true);
    try {
      const response = await fetch(`/api/boost-price?email=${encodeURIComponent(visitorEmail)}`);
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
  }

  useEffect(() => {
    if (visitorEmail) void loadCurrentPrice();
  }, [visitorEmail]);

  const range = boostRange[currency];
  const bumpAmount = (dir: 1 | -1) => setAmount((a) => clampAmount(a + dir * range.step, currency));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      let id = startupId;

      if (!visitorEmail) throw new Error('Could not identify this browser');

      const currentAmount = await loadCurrentPrice();
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
        name: 'BoostPad',
        description: `Rank boost for ${form.name}`,
        order_id: order.order_id,
        theme: {
          color: '#fb923c',
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
              body: JSON.stringify({
                ...payment,
                startupId: id,
              }),
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
      <div className="card p-10 text-center shadow-brutal">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fb923c] text-white">
          <Check size={32} />
        </div>
        <h2 className="mt-5 text-3xl font-black">
          {preview ? 'Preview Mode Completed' : 'Your Startup is Live & Boosted!'}
        </h2>
        <p className="mt-2 text-[#817a75]">
          {preview
            ? 'Running in preview mode without live gateway keys. With live keys, verified boosts instantly update leaderboard ranks.'
            : `Your verified boost of ${formatBoost(amount, currency)} has been confirmed and added to the public leaderboard.`}
        </p>
        <Link href="/" className="btn btn-primary mt-7">
          View Leaderboard <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card overflow-hidden shadow-brutal">
      <div className="border-b border-[#eee5df] bg-[#fff7ed] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#fb923c]">01 / Publish</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">One verified rank.</h2>
            <p className="mt-2 max-w-md text-[#817a75]">Put your product in front of people already looking for what you built.</p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#171717] text-xl font-black text-white sm:grid">↗</div>
        </div>
      </div>

      <div className="space-y-7 p-6 sm:p-9">
        <section className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-black uppercase tracking-[.12em] text-[#817a75]">Website</label>
            <input
              className="field"
              required
              placeholder="https://yourstartup.com"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
            />
            {domain && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#f4f1ee] p-3">
                <StartupLogo domain={domain} name={form.name || domain} className="h-14 w-14" />
                <div>
                  <b>Logo preview</b>
                  <p className="text-sm text-[#817a75]">{domain}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-[1.2fr_.8fr]">
            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-[.12em] text-[#817a75]">Name</label>
              <input
                className="field"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Acme AI"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-[.12em] text-[#817a75]">Category</label>
              <select
                className="field"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {['AI', 'Design', 'Fintech', 'Productivity', 'Climate', 'Edtech', 'Developer Tools', 'Marketing', 'Other'].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  )
                )}
              </select>
            </div>
          </div>

        </section>

        <section className="border-t border-[#eee5df] pt-7">
          <div className="flex items-end justify-between gap-4 rounded-2xl bg-[#171717] p-5 text-white sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#fdba74]">Boost {boostNumber}</p>
              <p className="mt-2 text-sm text-[#d6d3d1]">{priceLoading ? 'Updating price…' : 'Your current publishing price'}</p>
            </div>
            <p className="text-4xl font-black tracking-tight">₹{amount.toLocaleString('en-IN')}</p>
          </div>
        </section>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800">
            {error}
          </div>
        )}

        <button disabled={busy || priceLoading} className="btn btn-primary w-full py-4 text-base">
          {busy ? (
            <>
              <Loader2 className="animate-spin" />
              Preparing secure checkout…
            </>
          ) : (
            <>
              Publish & boost for {formatBoost(amount, currency)}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
