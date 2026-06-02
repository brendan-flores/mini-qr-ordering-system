-- Run this entire script in Supabase → SQL Editor → Run
-- Fixes: "Could not find the 'payment_method' column of 'orders' in the schema cache"

-- 1) Add payment_method column
alter table public.orders
  add column if not exists payment_method text;

-- 2) Backfill existing rows
update public.orders
set payment_method = 'cod'
where payment_method is null;

-- 3) Enforce NOT NULL + default
alter table public.orders
  alter column payment_method set default 'cod';

alter table public.orders
  alter column payment_method set not null;

-- 4) Allowed values
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cod', 'gcash'));

-- 5) Completed status (safe if you already ran patch-add-completed-status.sql)
alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (
    payment_status in ('Pending', 'Paid', 'Failed', 'Completed')
  );

-- After running: wait ~30s or refresh the app so PostgREST picks up the new column.
