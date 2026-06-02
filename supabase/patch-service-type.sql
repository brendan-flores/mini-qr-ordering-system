-- Run in Supabase SQL Editor (dine-in vs take-out)

alter table public.orders
  add column if not exists service_type text not null default 'dine_in';

alter table public.orders
  drop constraint if exists orders_service_type_check;

alter table public.orders
  add constraint orders_service_type_check
  check (service_type in ('dine_in', 'takeout'));

update public.orders
set service_type = 'dine_in'
where service_type is null;
