/** The canonical category list. Slugs are derived and used in URLs. */
export const CATEGORIES = [
  'Leaderboards & Attention Markets',
  'SEO & AI Visibility',
  'Marketing & Advertising',
  'Productivity & Personal Tools',
  'AI Agents & Infrastructure',
  'Crypto / Web3 & Investing',
  'Developer Tools',
  'Health / Fitness & Wellness',
  'Games & Entertainment',
  'Business / Finance & Legal',
  'Ecommerce & Retail',
  'Travel / Local & Lifestyle',
  'Directories / Launch & Discovery',
  'Agencies / Studios & Services',
  'AI Media Generation',
  'Social Media & Creator Tools',
  'Education & Learning',
  'People & Profiles',
  'Design & Creative',
  'Hiring / Jobs & Careers',
  'Domains & Web Assets',
  'Security / Privacy & Compliance',
  'Sales & Lead Generation',
  'Media & News',
  'Real Estate & Property',
  'Writing & Content',
  'Audio / Voice & Podcasting',
  'Analytics',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const categorySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[/&]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const categoryFromSlug = (slug: string): Category | null =>
  CATEGORIES.find((c) => categorySlug(c) === slug) ?? null;

export const isCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value);
