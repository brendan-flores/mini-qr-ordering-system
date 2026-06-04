# Mini QR Restaurant Ordering System (React + Node.js + MySQL)

Single repo with:

- **Frontend**: Next.js (React) + Tailwind — customer menu, cart, checkout, order tracking, admin kitchen dashboard
- **Backend**: Next.js API routes (`app/api/`) and optional Express REST API (`server.js`, port 4000)
- **Database**: MySQL 8 (`mysql/schema.sql`)

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
