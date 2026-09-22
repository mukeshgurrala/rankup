'use client';

import React, { useState } from 'react';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import type { RazorpaySuccessHandlerArgs, RazorpayOptions } from '@/global';

export interface RazorpayCheckoutProps {
  amount: number; // in INR
  currency?: string;
  startupId?: string;
  productName?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (paymentData: RazorpaySuccessHandlerArgs) => void;
  onFailure?: (error: string) => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Loads the Razorpay checkout.js script asynchronously if not already loaded.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckout({
  amount,
  currency = 'INR',
  startupId,
  productName = 'BoostPad Rank Boost',
  description = 'Boost your product visibility on the leaderboard',
  prefill,
  onSuccess,
  onFailure,
  buttonText,
  className = '',
  disabled = false,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay Checkout SDK. Please check your connection.');
      }

      // Step 2: Request server to create an order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          startupId,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create Razorpay order');
      }

      if (orderData.preview) {
        throw new Error('Payment gateway is not configured. No boost was created.');
      }

      // Step 3: Configure Razorpay Checkout Modal options
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount, // in paise
        currency: orderData.currency,
        name: productName,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || '',
          email: prefill?.email || '',
          contact: prefill?.contact || '',
        },
        theme: {
          color: '#fb923c', // BoostPad accent color
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            console.log('Checkout modal was closed by user');
          },
        },
        handler: async (response: RazorpaySuccessHandlerArgs) => {
          try {
            // Step 4: Verify payment on server using HMAC-SHA256
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                startupId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              const err = verifyData.error || 'Payment signature verification failed';
              setErrorMessage(err);
              onFailure?.(err);
              return;
            }

            // Payment successfully verified
            onSuccess?.(response);
          } catch (err: unknown) {
            const errStr = err instanceof Error ? err.message : 'Error verifying payment';
            setErrorMessage(errStr);
            onFailure?.(errStr);
          } finally {
            setIsLoading(false);
          }
        },
      };

      // Step 5: Open Razorpay Checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during checkout';
      setErrorMessage(message);
      onFailure?.(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading || disabled}
        className={
          className ||
          'inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fb923c] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ea580c] disabled:opacity-60 disabled:hover:translate-y-0'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            <span>{buttonText || `Pay ₹${amount.toLocaleString('en-IN')}`}</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </div>
  );
}
