-- Per-device order history: each phone/browser only sees its own orders.
alter table public.orders
  add column if not exists client_device_id text;

create index if not exists orders_client_device_id_idx
  on public.orders (client_device_id)
  where client_device_id is not null;
