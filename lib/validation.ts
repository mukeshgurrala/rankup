import { z } from 'zod';

export const startupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be 80 characters or fewer'),
  url: z
    .string()
    .url('Invalid URL format')
    .refine((v) => {
      try {
        const parsed = new URL(v);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, 'Only http and https protocols are allowed'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(280, 'Description must be 280 characters or fewer').optional().default('A featured product on BoostPad.'),
  category: z.string().min(1, 'Category is required').max(40),
  founderName: z.string().trim().max(80).optional(),
  founderEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

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