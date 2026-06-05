-- =============================================================================
-- BrenCravings — single database schema (local, LAN, Railway, Vercel)
-- Run the ENTIRE file in MySQL Workbench → Execute (⚡)
-- =============================================================================
-- Tables: admin_users, products, orders, qr_access_bindings
-- Safe to re-run: drops legacy tables, CREATE IF NOT EXISTS, seed when empty.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS mini_qr_ordering
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_qr_ordering;

DROP TABLE IF EXISTS qr_scan_codes;
DROP TABLE IF EXISTS restaurant_tables;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category ENUM('Starters', 'Mains', 'Desserts', 'Beverages') NOT NULL,
  image_url TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
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

CREATE TABLE IF NOT EXISTS qr_access_bindings (
  access_jti CHAR(36) NOT NULL PRIMARY KEY,
  table_number VARCHAR(32) NOT NULL,
  device_id VARCHAR(64) NOT NULL,
  bound_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qr_access_device (device_id)
);

-- Admin: username admin / password admin12345
INSERT INTO admin_users (id, username, password_hash)
SELECT * FROM (
  SELECT UUID(), 'admin',
    '$2b$10$2Cnh1ao0vnO6eFmYJtt51.Varug3aqr0loFAaSQT/gnk3V3llUkPW'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM admin_users LIMIT 1);

INSERT INTO products (id, name, price, category, image_url)
SELECT * FROM (
  SELECT UUID(), 'Truffle Parmesan Fries', 8.50, 'Starters',
    'https://images.unsplash.com/photo-1682117650826-881357860ec9?auto=format&fit=crop&w=800&q=80'
  UNION ALL SELECT UUID(), 'Signature Wagyu Burger', 18.00, 'Mains',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  UNION ALL SELECT UUID(), 'Dark Chocolate Lava Cake', 9.00, 'Desserts',
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'
  UNION ALL SELECT UUID(), 'Iced Matcha Latte', 5.50, 'Beverages',
    'https://images.unsplash.com/photo-1717398804998-ad2d48822518?auto=format&fit=crop&w=800&q=80'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

SHOW TABLES;
