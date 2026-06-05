# Mini QR Restaurant Ordering System (React + Node.js + MySQL)

Single repo with:

- **Frontend**: Next.js (React) + Tailwind — customer menu, cart, checkout, order tracking, admin kitchen dashboard
- **Backend**: Next.js API routes (`app/api/`) and optional Express REST API (`server.js`, port 4000)
- **Database**: MySQL 8 (`mysql/schema.sql`)

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

Each generated QR encodes a **short** URL like:

```text
/menu-page?code=Ab12Cd34Ef56
```

The `code` maps server-side to a signed access token. Short URLs scan reliably on phone cameras (long `access=` links are easy to truncate and fail silently).

#### Scan-only ordering (live server)

On your **deployed** customer site (e.g. Vercel), ordering is locked until a guest scans a valid table QR:

| Guest action | Result |
|--------------|--------|
| Open menu without `?table=` | Browse only — no cart |
| Type `?table=1` in the address bar | Browse only — no cart |
| Change `?table=` after scanning another table | Ordering locks — cart disabled |
| **Scan** a QR from the admin dashboard | Cart and checkout unlock on **that device only** |
| Copy/share the QR link to another phone | **Denied** — link is bound to the first device that scanned |
| Place order without a valid scan session | `POST /api/orders` returns **403** |

After a valid scan, the server registers the QR `access` token to the guest’s **device id** (stored in browser `localStorage`) and sets a signed **httpOnly cookie**. The **first device** to scan a printed QR owns that link; opening the same URL on another device is rejected. The table number is also **locked to that scan** — changing `?table=` in the address bar clears ordering on the live site, and dine-in orders always use the table from the cookie (not what the browser sends). Checkout still offers **take-out** (pickup) for guests who scanned on their own device.

**Inactivity timeout (live server):** If the guest does nothing for **15 minutes** (no taps, scrolls, or cart changes), the ordering session ends. They must **scan the table QR again** to order. Activity is tracked in the browser and on the server (`/api/qr/ping`).

**Database:** run `mysql/patch-qr-access-bindings.sql` on existing Railway/local DB (or re-import `mysql/schema.sql` for fresh installs).

**Re-print QRs** when you need a new guest at the same table — each admin **Go** click issues a new `access` token.

#### Localhost (development)

On `http://localhost:3000` or `127.0.0.1`, the scan-only rule is **disabled** so you can test ordering without printing QRs. You can add to cart, check out, and enter a table number manually at checkout.

Requires `ADMIN_SESSION_SECRET` in `.env.local` / Vercel — used to sign QR `access` tokens and order session cookies.

### Admin dashboard

- View live orders (payment + kitchen status)
- Update payment status and kitchen workflow
- Table QR generator (above)

### Payment simulation

- **Pay at counter (cash)** — order sent to kitchen; pay when served
- **GCash (mock)** — simulated success/failure flow (no real payment API)

## Quick start

### 1) MySQL schema

```bash
mysql -u root -p < mysql/schema.sql
```

Or open `mysql/schema.sql` in **MySQL Workbench** and execute it.

Details: **[docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md)**

### 2) Environment

```bash
copy .env.example .env.local
```

Set MySQL connection variables and `ADMIN_SESSION_SECRET`.

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
