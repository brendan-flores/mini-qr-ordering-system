-- Run in Supabase SQL Editor

alter table public.orders
  add column if not exists table_number text;

alter table public.orders
  add column if not exists order_status text not null default 'received';

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

update public.orders set table_number = '1' where table_number is null;
