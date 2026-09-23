'use client';

import { ReactNode } from 'react';
import { outboundUrl } from '@/lib/data';

/**
 * Outbound product link. Appends UTM attribution and records the click
 * without delaying navigation.
 */
export function OutboundLink({
  productId,
  url,
  className = '',
  children,
}: {
  productId: string;
  url: string;
  className?: string;
  children: ReactNode;
}) {
  function track() {
    const body = JSON.stringify({ productId });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/click', new Blob([body], { type: 'application/json' }));
    } else {
      void fetch('/api/click', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }

  return (
    <a
      href={outboundUrl(url)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={track}
      onAuxClick={track}
      className={className}
    >
      {children}
    </a>
  );
}
