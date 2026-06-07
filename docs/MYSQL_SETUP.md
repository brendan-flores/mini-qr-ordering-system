# MySQL setup

The app uses **one schema file only**: `database/schema.sql` — for local PC, LAN testing, Railway, and Vercel. Do not use separate local/live/patch SQL files.

## Required tables (4)

| # | Table | Purpose |
|---|--------|---------|
| 1 | `admin_users` | Admin login |
| 2 | `products` | Menu items |
| 3 | `orders` | Customer orders |
| 4 | `qr_access_bindings` | One device per QR link — blocks link sharing |

## Import

1. MySQL Workbench → **File → Open SQL Script** → `database/schema.sql`
2. Select all (Ctrl+A) → **Execute** (⚡)
3. Confirm **4 tables** under `mini_qr_ordering`

CLI: `mysql -u root -p < database/schema.sql`

Default admin: `admin` / `admin12345`

## Environment

Copy `.env.example` to `.env.local` and set `MYSQL_*` if needed. `ADMIN_SESSION_SECRET` can stay empty for local dev.

## Another machine

Clone repo → run `database/schema.sql` → configure `.env.local` → `npm install` && `npm run dev`.
