-- Mini QR Ordering System — MySQL schema (for local MySQL / submission)
-- Import: mysql -u root -p < mysql/schema.sql
-- Or run in MySQL Workbench after creating database mini_qr_ordering

CREATE DATABASE IF NOT EXISTS mini_qr_ordering
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_qr_ordering;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category ENUM('Starters', 'Mains', 'Desserts', 'Beverages') NOT NULL,
  image_url TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  items JSON NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
  payment_status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
  payment_method ENUM('cod', 'gcash') NOT NULL DEFAULT 'cod',
  table_number VARCHAR(32) NULL,
  service_type ENUM('dine_in', 'takeout') NOT NULL DEFAULT 'dine_in',
  order_status ENUM(
    'received',
    'preparing',
    'serving',
    'served',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'received',
  client_device_id VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: username `admin`, password `admin12345` (change after first login)
INSERT INTO admin_users (id, username, password_hash)
SELECT * FROM (
  SELECT
    UUID() AS id,
    'admin' AS username,
    '$2b$10$2Cnh1ao0vnO6eFmYJtt51.Varug3aqr0loFAaSQT/gnk3V3llUkPW' AS password_hash
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM admin_users LIMIT 1);

-- Sample menu (runs only when table is empty)
INSERT INTO products (id, name, price, category, image_url)
SELECT * FROM (
  SELECT
    UUID() AS id,
    'Truffle Parmesan Fries' AS name,
    8.50 AS price,
    'Starters' AS category,
    'https://images.unsplash.com/photo-1682117650826-881357860ec9?auto=format&fit=crop&w=800&q=80' AS image_url
  UNION ALL SELECT
    UUID(),
    'Signature Wagyu Burger',
    18.00,
    'Mains',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  UNION ALL SELECT
    UUID(),
    'Dark Chocolate Lava Cake',
    9.00,
    'Desserts',
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'
  UNION ALL SELECT
    UUID(),
    'Iced Matcha Latte',
    5.50,
    'Beverages',
    'https://images.unsplash.com/photo-1717398804998-ad2d48822518?auto=format&fit=crop&w=800&q=80'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
