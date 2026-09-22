export type Startup = {
  id: string;
  slug: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  category: string;
  logo?: string;
  total: number;
  createdAt: string;
};

// No seeded listings: the directory starts clean and is populated by public submissions.
export const startups: Startup[] = [];

export const money = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
