-- Run in Supabase → SQL Editor (safe to re-run)
update public.products
set image_url = 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'
where name = 'Dark Chocolate Lava Cake'
  and (image_url is null or trim(image_url) = '');
