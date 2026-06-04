-- Align product images with menu item names (safe for Workbench "safe updates" mode)
USE mini_qr_ordering;

SET @fries_id = (
  SELECT id FROM products WHERE name = 'Truffle Parmesan Fries' LIMIT 1
);
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1682117650826-881357860ec9?auto=format&fit=crop&w=800&q=80'
WHERE id = @fries_id;

SET @matcha_id = (
  SELECT id FROM products WHERE name = 'Iced Matcha Latte' LIMIT 1
);
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1717398804998-ad2d48822518?auto=format&fit=crop&w=800&q=80'
WHERE id = @matcha_id;
