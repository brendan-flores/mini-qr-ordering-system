-- Run in Supabase → SQL Editor to enable instant order status updates in the app.
-- Also add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env / Vercel.

alter table public.orders replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;

-- Realtime respects RLS. Allow anon SELECT so browser clients receive change events.
-- Writes still go through your Next.js API (service role).
alter table public.orders enable row level security;

drop policy if exists "orders_realtime_select" on public.orders;
create policy "orders_realtime_select"
  on public.orders
  for select
  to anon, authenticated
  using (true);
