-- Run in Supabase SQL Editor (updates kitchen workflow: ready → serving)

update public.orders
set order_status = 'serving'
where order_status = 'ready';

alter table public.orders
  drop constraint if exists orders_order_status_check;

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
