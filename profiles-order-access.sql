-- Optional: let providers see customer name/phone ONLY on orders they fulfill.
-- Admins can read all profiles (is_admin bypasses RLS — no recursion).
-- Run after fix-profiles-rls.sql

drop policy if exists "profiles: provider read order customers" on public.profiles;
create policy "profiles: provider read order customers"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.orders o
      inner join public.profiles p on p.id = auth.uid()
      where o.customer_id = profiles.id
        and o.provider_id = p.provider_id
        and p.role = 'provider'
    )
  );

drop policy if exists "profiles: admin read all" on public.profiles;
create policy "profiles: admin read all"
  on public.profiles for select
  using ( public.is_admin() );
