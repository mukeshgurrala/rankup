/* eslint-disable @next/next/no-img-element -- favicons come from a third-party host with a runtime fallback */
'use client';

import { useState } from 'react';
import { faviconUrl } from '@/lib/data';

export function Favicon({
  domain,
  name,
  size = 32,
  className = '',
}: {
  domain: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-small border border-hairline bg-pure-white text-[11px] font-medium text-black/50 ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        initials
      ) : (
        <img
          src={faviconUrl(domain, 128)}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
