# Mini QR Restaurant Ordering System (React + Node.js + MySQL)

Single repo with:

- **Frontend**: Next.js (React) + Tailwind — customer menu, cart, checkout, order tracking, admin kitchen dashboard
- **Backend**: Next.js API routes (`app/api/`) and optional Express REST API (`server.js`, port 4000)
- **Database**: MySQL 8 — `mysql/schema.sql` (`admin_users`, `products`, `orders`)

## Features

### Customer (mobile-responsive)

- Browse menu products by category
- Add to cart, update quantity, remove items
- Checkout with computed total
- Dine-in or takeout; order tracking page

### QR codes (Admin dashboard)

QR codes are **generated on the admin page**, not the customer menu.

1. Log in at `/admin` (default: `admin` / `admin12345`).
2. Open **Table QR codes** in the left sidebar (desktop) or tap **QR** (mobile).
3. Enter a table number → click **Go** → preview the QR → **Download PNG**.
4. Print and place at the table. Guests **scan** the QR to open the menu and order.

Set `NEXT_PUBLIC_APP_URL` in `.env.local` (and on Vercel) so QR links point to your deployed menu URL, e.g. `https://your-menu.vercel.app`.

Each generated QR encodes a signed URL like:

```text
/menu-page?table=1&access=<signed-token>
```

The `access` value is HMAC-signed with `ADMIN_SESSION_SECRET` — guests cannot forge a table link by typing `?table=` alone.

#### Scan-only ordering (live server)

On your **deployed** customer site (e.g. Vercel), ordering is locked until a guest scans a valid table QR:

| Guest action | Result |
|--------------|--------|
| Open menu without `?table=` | Browse only — no cart |
| Type `?table=1` in the address bar | Browse only — no cart |
| Change `?table=` after scanning another table | Ordering locks — cart disabled |
| **Scan** a QR from the admin dashboard | Cart and checkout unlock (session cookie set) |
| Copy/share the full QR URL to another phone | That phone can also activate (cookie-only model — no DB device lock) |
| Place order without a valid scan session | `POST /api/orders` returns **403** |

After a valid scan, the server sets a signed **httpOnly cookie** tied to the guest’s device id. Orders require that cookie on LAN and production. The table number is **locked to the scan** — dine-in orders use the table from the cookie, not a value typed in the address bar.

**Inactivity timeout (live server):** If the guest does nothing for **15 minutes** (no taps, scrolls, or cart changes), the ordering session ends. They must **scan the table QR again** to order. Activity is tracked in the browser and on the server (`/api/qr/ping`).

**Database:** run `mysql/schema.sql` in MySQL Workbench. Creates `admin_users`, `products`, and `orders`. See **[docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md)**.

**Re-print QRs** when you need a new guest at the same table — each admin **Go** click issues a new `access` token.

#### Localhost vs local network (development)

| URL | QR scan required? |
|-----|-------------------|
| `http://localhost:3000` or `127.0.0.1` | **No** — dev bypass for quick testing |
| `http://192.168.x.x:3000` (LAN IP) | **Yes** — same rules as production |
| Deployed (Vercel) | **Yes** |

On **localhost only**, you can order without printing QRs (manual table at checkout). On **LAN IP** or production, scan-only ordering and `POST /api/orders` cookie checks apply.

For LAN setup (`allowedDevOrigins`, `NEXT_PUBLIC_APP_URL`, phone testing): **[docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md)**

Requires `ADMIN_SESSION_SECRET` in `.env.local` / Vercel — used to sign QR `access` tokens and order session cookies.

### Admin dashboard

- View live orders (payment + kitchen status)
- Update payment status and kitchen workflow
- Table QR generator (above)

### Payment simulation

- **Pay at counter (cash)** — order sent to kitchen; pay when served
- **GCash (mock)** — simulated success/failure flow (no real payment API)

## Quick start

### 1) MySQL (MySQL Workbench)

1. Connect in Workbench (local: `127.0.0.1` · Railway: public host + port from **Connect**).
2. **File → Open SQL Script** → `mysql/schema.sql`.
3. Select **all** lines (Ctrl+A) → click **Execute** (⚡).
4. Refresh **Schemas** → `mini_qr_ordering` → **Tables** — you must see **3 tables**:

   `admin_users` · `products` · `orders`

Default admin: `admin` / `admin12345`

Details: **[docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md)** · LAN + QR security: **[docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md)**

**Another machine:** clone repo → run `mysql/schema.sql` on that PC’s MySQL → copy `.env.local` → `npm install` && `npm run dev`.

### 2) Environment

```bash
copy .env.example .env.local
```

Set MySQL connection variables (`MYSQL_HOST` stays `127.0.0.1` even for LAN guests) and `ADMIN_SESSION_SECRET`. For phone testing on Wi‑Fi, set `NEXT_PUBLIC_APP_URL` to your LAN IP (e.g. `http://192.168.1.10:3000`).

Default admin (after schema): username `admin`, password `admin12345`.

### 3) Run Next.js

```bash
npm install
npm run dev
```

- Customer app: `http://localhost:3000`
- Admin: `http://localhost:3000/admin` (or admin subdomain if configured)

### 4) Optional Express API

```bash
copy backend.env.example .env
npm run dev:api
```

Runs on `http://localhost:4000`. See **[docs/BACKEND_API.md](docs/BACKEND_API.md)**.

## Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind CSS 4, Next.js 16 |
| API | Node.js (Next Route Handlers + optional Express) |
| Database | MySQL (`mysql2`) |

## Main API routes (Next.js)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | Menu products |
| POST | `/api/orders` | Place order (live server requires QR session cookie) |
| GET | `/api/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/[id]` | Kitchen / payment updates |
| POST | `/api/admin/table-qr-token` | Issue signed `access` token for a table QR (admin) |
| GET | `/api/qr/activate` | Validate scan URL and set order session cookie |
| GET | `/api/qr/session` | Check whether guest has an active QR order session |
| GET | `/api/qr/ping` | Refresh session activity (15-minute inactivity limit) |
| POST | `/api/qr/logout` | Clear QR order session cookie |

Deployment notes: **[docs/VERCEL.md](docs/VERCEL.md)**
