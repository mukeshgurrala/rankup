-- RankUp — pay-to-rank bidding model.
-- Rank is a pure sort by standing bid (highest first, earliest listing wins ties).
-- A product's standing bid is the highest verified bid it has ever paid.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- products --

alter table startups add column if not exists tagline text;
alter table startups add column if not exists click_count integer not null default 0;

update startups set tagline = coalesce(tagline, description);

-- -------------------------------------------------------------------- bids --

create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups(id) on delete cascade,
  payment_id uuid unique not null references payments(id),
  order_id text not null,
  amount integer not null check (amount > 0),        -- whole US dollars
  currency text not null default 'USD',
  rank_claimed integer,                               -- rank targeted at bid time
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists bids_startup_status_idx on bids (startup_id, status);
create index if not exists bids_created_idx on bids (created_at desc);

-- ------------------------------------------------------------------ clicks --

create table if not exists clicks (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists clicks_startup_idx on clicks (startup_id);

-- ---------------------------------------------------------------- sessions --

-- Real, first-party visitor counting. One row per browser session.
create table if not exists site_sessions (
  session_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create index if not exists site_sessions_last_seen_idx on site_sessions (last_seen desc);

-- ----------------------------------------------------------------- pricing --

alter table payments add column if not exists rank_claimed integer;
alter table payments add column if not exists amount_usd integer;

-- ------------------------------------------------------------------- views --

-- All-time board: standing bid = highest verified bid.
create or replace view product_board as
select
  s.id,
  s.slug,
  s.name,
  s.url,
  s.domain,
  s.description,
  coalesce(s.tagline, s.description) as tagline,
  s.category,
  s.logo_url,
  s.click_count,
  s.created_at,
  coalesce(max(b.amount) filter (where b.status = 'paid'), 0)::integer as bid,
  coalesce(sum(b.amount) filter (where b.status = 'paid'), 0)::integer as total_paid,
  count(b.id) filter (where b.status = 'paid')::integer as bid_count,
  max(b.created_at) filter (where b.status = 'paid') as last_bid_at
from startups s
left join bids b on b.startup_id = s.id
where s.status = 'active'
group by s.id
having coalesce(max(b.amount) filter (where b.status = 'paid'), 0) > 0
order by bid desc, s.created_at asc;

-- Today's board: standing bid = highest verified bid placed during the current UTC day.
create or replace view product_board_today as
select
  s.id,
  s.slug,
  s.name,
  s.url,
  s.domain,
  s.description,
  coalesce(s.tagline, s.description) as tagline,
  s.category,
  s.logo_url,
  s.click_count,
  s.created_at,
  coalesce(max(b.amount), 0)::integer as bid,
  coalesce(sum(b.amount), 0)::integer as total_paid,
  count(b.id)::integer as bid_count,
  max(b.created_at) as last_bid_at
from startups s
join bids b
  on b.startup_id = s.id
 and b.status = 'paid'
 and b.created_at >= date_trunc('day', now() at time zone 'utc')
where s.status = 'active'
group by s.id
order by bid desc, s.created_at asc;

-- Activity feed.
create or replace view bid_activity as
select
  b.id,
  b.amount,
  b.rank_claimed,
  b.created_at,
  s.name,
  s.slug,
  s.domain,
  s.category
from bids b
join startups s on s.id = b.startup_id
where b.status = 'paid' and s.status = 'active'
order by b.created_at desc;

-- --------------------------------------------------------------- functions --

-- Idempotent: verifies a payment and records the bid in one transaction.
create or replace function verify_payment_and_create_bid(
  p_payment_id uuid,
  p_razorpay_payment_id text,
  p_signature text
) returns void language plpgsql security definer as $$
declare
  p payments;
begin
  select * into p from payments where id = p_payment_id for update;
  if not found then
    raise exception 'payment not found';
  end if;
  if p.status = 'paid' then
    return;
  end if;

  update payments
     set status = 'paid',
         razorpay_payment_id = p_razorpay_payment_id,
         razorpay_signature = p_signature,
         verified_at = now()
   where id = p.id;

  insert into bids (startup_id, payment_id, order_id, amount, currency, rank_claimed, status)
  values (
    p.startup_id,
    p.id,
    p.razorpay_order_id,
    coalesce(p.amount_usd, p.amount),
    'USD',
    p.rank_claimed,
    'paid'
  )
  on conflict (payment_id) do nothing;
end;
$$;

create or replace function register_click(p_startup_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into clicks (startup_id) values (p_startup_id);
  update startups set click_count = click_count + 1 where id = p_startup_id;
end;
$$;

create or replace function touch_session(p_session_id text)
returns void language plpgsql security definer as $$
begin
  insert into site_sessions (session_id) values (p_session_id)
  on conflict (session_id) do update set last_seen = now();
end;
$$;

-- --------------------------------------------------------------------- RLS --

alter table bids enable row level security;
alter table clicks enable row level security;
alter table site_sessions enable row level security;

drop policy if exists "public paid bid read" on bids;
create policy "public paid bid read" on bids for select using (status = 'paid');
