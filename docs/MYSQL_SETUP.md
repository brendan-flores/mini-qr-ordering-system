# MySQL setup

The app stores all persistent data in **MySQL 8+** on the machine where the Next.js server runs. Browsers never connect to MySQL directly — they call `/api/*`, and the server uses `MYSQL_*` env vars.

## Schema file

Use **`mysql/schema.sql`** everywhere — local PC, LAN testing, Railway, and Vercel.

## Required tables (3)

After running `mysql/schema.sql`, database `mini_qr_ordering` must contain:

| # | Table | Purpose |
|---|--------|---------|
| 1 | `admin_users` | Admin login (`admin` / `admin12345` by default) |
| 2 | `products` | Menu items (category, price, image) |
| 3 | `orders` | Customer orders (items JSON, payment, kitchen status) |

QR security does **not** use extra tables — signed `?table=&access=` URLs and httpOnly session cookies handle scan-only ordering.

The script is **safe to re-run**: it drops legacy tables (`qr_scan_codes`, `qr_access_bindings`, `restaurant_tables`), uses `CREATE TABLE IF NOT EXISTS`, and seeds only when a table is empty.

## Import into MySQL

### Option A — MySQL Workbench (recommended)

1. Install MySQL 8+ and open **MySQL Workbench**.
2. Connect to your local instance (usually `127.0.0.1:3306`, user `root`).
3. **File → Open SQL Script** → select `mysql/schema.sql`.
4. Select **all** lines (Ctrl+A) → click **Execute** (⚡).
5. Refresh **Schemas** → `mini_qr_ordering` → **Tables** — confirm all **3** tables appear.

### Option B — Command line

```bash
mysql -u root -p < mysql/schema.sql
```

### Default admin (after schema)

| Field | Value |
|-------|--------|
| Username | `admin` |
| Password | `admin12345` |

## Configure the app

Copy `.env.example` to `.env.local` and set `MYSQL_*` and `ADMIN_SESSION_SECRET`, then:

```bash
npm install
npm run dev
```

## Localhost vs local network

`MYSQL_HOST=127.0.0.1` on the dev PC even when phones use `http://192.168.x.x:3000`. See **[LOCAL_NETWORK.md](./LOCAL_NETWORK.md)** for LAN and QR setup.

## Setting up on another machine

1. Clone repo, install Node.js 20+ and MySQL 8+.
2. Run **`mysql/schema.sql`** on that machine’s MySQL.
3. Copy `.env.local` with that machine’s `MYSQL_*` credentials.
4. `npm install` && `npm run dev`.

## Production (Railway + Vercel)

**[RAILWAY.md](./RAILWAY.md)** · **[VERCEL.md](./VERCEL.md)**
