-- Run in Supabase SQL Editor (safe to re-run)
-- Moves "Completed" from payment_status to order_status (kitchen)
--
-- IMPORTANT: Drop constraints BEFORE updating rows, or updates fail.

-- 1) Drop old checks so new values are allowed during migration
alter table public.orders
  drop constraint if exists orders_order_status_check;

alter table public.orders
  drop constraint if exists orders_payment_status_check;

-- 2) Ensure order_status column exists
alter table public.orders
  add column if not exists order_status text not null default 'received';

-- 3) Normalize legacy kitchen values
update public.orders
set order_status = 'serving'
where order_status = 'ready';

-- 4) Move payment "Completed" → kitchen "completed" + payment "Paid"
update public.orders
set order_status = 'completed'
where payment_status = 'Completed'
  and coalesce(order_status, 'received') not in ('cancelled', 'completed');

update public.orders
set payment_status = 'Paid'
where payment_status = 'Completed';

-- 5) Re-add constraints with the new allowed values
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('Pending', 'Paid', 'Failed'));

alter table public.orders
  add constraint orders_order_status_check
  check (
    order_status in (
      'received',
      'preparing',
      'serving',
      'served',
      'completed',
      'cancelled'
    )
  );
