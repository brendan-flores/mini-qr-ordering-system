-- Run in Supabase → SQL Editor for project btgsbrzokbvfzfnzmqeq

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  category text not null check (
    category in ('Starters', 'Mains', 'Desserts', 'Beverages')
  ),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total_amount numeric not null check (total_amount > 0),
  payment_status text not null check (
    payment_status in ('Pending', 'Paid', 'Failed')
  ),
  created_at timestamptz not null default now()
);

-- Sample menu (optional)
insert into public.products (name, price, category, image_url)
select v.name, v.price, v.category, v.image_url
from (
  values
    (
      'Truffle Parmesan Fries',
      8.50,
      'Starters',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIvq1GedBnLXTMGgj9Xqxu4rbw7QB_Yf71niOJnroKL0uLisJHsloyruwUkmQzC5dW9VWxCFuZ39Qn2RtqzLgz-26TFGwm08AQvRfsciFcHluIoM4mGNG8aipwxy7uIkXzbsbfV1MPPj_eLiS9AfmdJfB1itzfZeT5NlygNixvVhCyzjXfRBU2bessoJWiExQGP2_0NRnFA5R3Dlcma0zuPeRlP7CnqgbjPNVcx7-HUheAaShIN2pkG-ogcyaMXwF-3uRQh-hcsCpO'
    ),
    (
      'Signature Wagyu Burger',
      18.00,
      'Mains',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Z9Rr9xd8l0DE3mvuER9CaU6IGfrZG19dQ3p7OjuXCCsOwRYkVd4kfNa3YsLMoy0mwT52bs57J6R_Lzd1-jxOEBawVPP3VXrXfnNngX9h1nJ_yqqcqt36Gz5nkDG_bmO_Y6hecQOVKHbfkkn1cBCmQUBkjLWhyf6FkfT-R-5dTL2fyd7uOqBMIPQ6nuyx-yP29V6QYMZJx2ZYeNL1IA1YFPDcavCNKUH_MQdeJ7phbIYKVagAkIyIW4buZFoDBIfa4EX8DntULed8'
    ),
    (
      'Dark Chocolate Lava Cake',
      9.00,
      'Desserts',
      'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'
    ),
    (
      'Iced Matcha Latte',
      5.50,
      'Beverages',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDopa19h4ZBg6GK_OPv5TdXo0lvG0Bgli2NhJnVNvCnzoJ8lAfkYJEJBg8w4dBSIbyMbgS_WScAq3KA-l1mH0zFXO8lcBHrQUtjMjtUEg3Z2VqLOcsNpdThpWcPjmpapU4PtBgrxT7atwRn-xzqlWXD7auCe56oDZZjf44n7Kf56cI3FVhedd5FycRj5D29Z2KkD-oGzV1Eh63_tk_GUA410o0afR_rihfoq8ZCsjhnf_8C_44RtFESGZLwm_k3zw84xeQ6FGzVgDx4'
    )
) as v(name, price, category, image_url)
where not exists (select 1 from public.products limit 1);
