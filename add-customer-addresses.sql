-- =============================================================
-- ECOFLUFFA — Customer Addresses Migration
-- Run in Supabase SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- CUSTOMER_ADDRESSES  (saved pickup locations per customer)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.customer_addresses (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  label      text not null default '',   -- e.g. "Home", "Office"
  address    text not null,              -- full address string
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.customer_addresses enable row level security;

-- Customer can only see/manage their own addresses
create policy "customer_addresses: owner read"
  on public.customer_addresses for select
  using ( auth.uid() = user_id );

create policy "customer_addresses: owner insert"
  on public.customer_addresses for insert
  with check ( auth.uid() = user_id );

create policy "customer_addresses: owner update"
  on public.customer_addresses for update
  using ( auth.uid() = user_id );

create policy "customer_addresses: owner delete"
  on public.customer_addresses for delete
  using ( auth.uid() = user_id );
