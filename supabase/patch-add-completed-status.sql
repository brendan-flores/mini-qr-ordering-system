-- Run in Supabase SQL Editor to allow "Completed" order status
alter table public.orders drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('Pending', 'Paid', 'Failed', 'Completed'));
