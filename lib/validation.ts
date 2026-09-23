import { z } from 'zod';
import { CATEGORIES } from './categories';

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  url: z
    .string()
    .url('Invalid URL format')
    .refine((v) => {
      try {
        return ['http:', 'https:'].includes(new URL(v).protocol);
      } catch {
        return false;
      }
    }, 'Only http and https protocols are allowed'),
  tagline: z
    .string()
    .trim()
    .min(5, 'Tagline must be at least 5 characters')
    .max(120, 'Tagline must be 120 characters or fewer'),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Choose a valid category' }),
  }),
  founderEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

/** Bids are whole US dollars. */
export const bidAmountSchema = z
  .number()
  .int('Bid must be a whole dollar amount')
  .min(1, 'Minimum bid is $1')
  .max(100000, 'Bid exceeds the $100,000 maximum');

export const normalizeUrl = (value: string) => {
  const raw = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const u = new URL(raw);
  if (!['http:', 'https:'].includes(u.protocol)) {
    throw new Error('Unsafe URL protocol');
  }
  u.hash = '';
  return {
    url: u.toString(),
    domain: u.hostname.toLowerCase().replace(/^www\./, ''),
  };
};
