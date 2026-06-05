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
3. Enter a table number → preview the QR → **Download PNG**.
4. Print and place at the table. Guests scan to open the menu with `?table=N` for dine-in ordering.

Set `NEXT_PUBLIC_APP_URL` in `.env.local` so QR links point to your deployed menu URL.

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
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/[id]` | Kitchen / payment updates |

Deployment notes: **[docs/VERCEL.md](docs/VERCEL.md)**
