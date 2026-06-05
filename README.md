# BrenCravings — Mini QR Restaurant Ordering System

A mobile-friendly restaurant ordering app: guests scan a table QR to order; staff manage live orders from an admin kitchen dashboard.

**Stack:** React 19 · Next.js 16 · Tailwind CSS 4 · Node.js · MySQL 8

---

## Live demo

| App | URL |
|-----|-----|
| Customer menu | [https://brencravings.vercel.app](https://brencravings.vercel.app) |
| Admin dashboard | [https://brencravings-admin.vercel.app](https://brencravings-admin.vercel.app) |

**Admin login:** `admin` / `admin12345`

The deployed sites are ready to use — no local setup required.

---

## How ordering works

Guests **must scan a table QR** (printed from the admin page) before they can order.

| Guest action | Result |
|--------------|--------|
| Opens menu **without** scanning a QR | Browse only — **cannot order** |
| Types `?table=1` in the browser | Still **cannot order** |
| **Scans** a valid table QR | Cart and checkout unlock on that device |

This is **intentional** — it prevents spam and fake orders. Only guests at a real table with a printed QR can place orders.

### QR session rules

| Rule | Behavior |
|------|----------|
| **One device per QR** | The first phone to scan locks the table QR; a second phone gets *“registered to another device”* until the session ends. |
| **Fresh scan link** | Ordering starts only from a menu URL with `?table=` and `?access=` (QR scan). |
| **Checkout / orders** | Moving between checkout and order tracking **keeps** the session until you return to the bare menu. |
| **Bare menu / home** | Opening `/menu-page` without scan params, clicking **Menu**, or going **home** ends the session — scan again to order. |
| **Close tab or browser** | Session ends and the QR is **released** so the next guest at the table can scan. |
| **15 minutes idle** | Fallback: no activity ends the session and releases the QR (localhost, LAN, and production). |
| **Force-quit browser** | If the OS kills the app without logout, the server releases the binding after **15 minutes** with no heartbeat (`last_active_at`). |

Same rules apply on **localhost**, **LAN IP** (`192.168.x.x`), and **production** — QR enforcement is always on.

No admin action is required to free a table QR — it happens automatically when the current guest’s session ends.

### Live server checklist (Vercel + Railway)

The QR session code runs on **Vercel**; the `last_active_at` column must exist on the **same MySQL database Vercel uses** (usually Railway), not only on local MySQL.

1. **Deploy app code** — push to `main`; Vercel should redeploy [brencravings.vercel.app](https://brencravings.vercel.app). In the Vercel dashboard, confirm the latest deployment time matches your git push.
2. **Migrate production DB** — in MySQL Workbench, connect using Railway **public** host/port from **Connect** (e.g. `*.proxy.rlwy.net`, not `localhost`). Run `mysql/schema.sql` or:

   ```sql
   USE mini_qr_ordering;
   DESCRIBE qr_access_bindings;  -- must include last_active_at
   ```

3. **Hard-refresh phones** — close the browser tab completely, or use a private/incognito window, so cached JavaScript is not used.
4. **Verify** — Phone A scans and orders → Phone B blocked → Phone A closes browser → Phone B scans again (should work).

---

## Installation guide

**Prerequisites:** Node.js 18+, MySQL 8, MySQL Workbench

### Step 1 — Get the project

```bash
git clone <your-repo-url>
cd mini-qr-ordering-system
```

Or download and unzip from GitHub.

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up the database

1. Open **MySQL Workbench** → connect to your local MySQL server.
2. **File → Open SQL Script** → `mysql/schema.sql`
3. Select all (Ctrl+A) → **Execute** (⚡)
4. Confirm **4 tables** exist in `mini_qr_ordering`:

   `admin_users` · `products` · `orders` · `qr_access_bindings`

   The `qr_access_bindings` table tracks which device holds each table QR (`device_id`, `bound_at`, `last_active_at`). Re-run `mysql/schema.sql` after pulling updates — it safely adds `last_active_at` to existing databases.

More detail: **[docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md)**

### Step 4 — Start the app

```bash
npm run dev
```

On the **first** run, the project creates `.env.local` from `.env.example` (it is not in the GitHub repo). The copy starts with `MYSQL_PASSWORD` empty.

### Step 5 — Configure `.env.local` (if needed)

**Only edit if your MySQL `root` has a password on this PC:**

```env
MYSQL_PASSWORD=your_mysql_root_password_here
```

| | MySQL Workbench | `.env.local` |
|--|-----------------|--------------|
| Purpose | Opens Workbench on this PC | Lets the **app** connect to MySQL |
| Password | Stored in Workbench vault | Must be set manually in `MYSQL_PASSWORD` |

- Same password as Workbench, on **this PC only** — each laptop has its own MySQL.
- If `root` has no password, leave `MYSQL_PASSWORD=` empty.
- Leave `ADMIN_SESSION_SECRET` empty for local dev and LAN phone testing — not needed until you deploy to Vercel.
- After editing, **restart** `npm run dev` (Ctrl+C, then run again).
- Do **not** commit `.env.local` or real passwords to GitHub.

**Error:** `Access denied for user 'root'@'localhost' (using password: NO)` → `MYSQL_PASSWORD` is empty or dev server was not restarted.

### Step 6 — Open the app

| Where | Menu | Admin |
|-------|------|-------|
| This PC | [localhost:3000](http://localhost:3000) | [localhost:3000/admin](http://localhost:3000/admin) |
| Phone / other device (same Wi‑Fi) | `http://192.168.x.x:3000` | `http://192.168.x.x:3000/admin` |

Use the **Network** URL from the terminal (not `0.0.0.0`). See **[docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md)** for LAN and QR testing.

**Verify:** `http://localhost:3000/api/products` should return JSON with menu items.

---

## Features

**Customer** — Browse menu, cart, checkout (cash / mock GCash), order tracking.

**Admin** — Live orders, payment & kitchen status, new-order notifications, table QR generator.

**QR workflow** — Admin → Table QR codes → enter table → **Go** → download PNG → guest scans to order.

**QR session lifecycle** — One device per scan; auto-release on tab/browser close or 15 min idle; server heartbeat via `/api/qr/ping`.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind CSS 4, Next.js 16 |
| API | Node.js (Next.js Route Handlers) |
| Database | MySQL (`mysql2`) |

---

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | Menu products |
| POST | `/api/orders` | Place order (requires QR session) |
| GET | `/api/admin/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/[id]` | Kitchen / payment updates |
| POST | `/api/admin/table-qr-token` | Issue QR `access` token (admin) |
| GET | `/api/qr/activate` | Validate scan & set session cookie |
| GET | `/api/qr/session` | Check active QR session |
| GET | `/api/qr/ping` | Refresh session & binding heartbeat (15 min inactivity) |
| POST / GET | `/api/qr/logout` | End session & release device binding (tab/browser close) |

Optional local Express API: `npm run dev:api` → [docs/BACKEND_API.md](docs/BACKEND_API.md)

---

## Documentation

| Topic | File |
|-------|------|
| MySQL setup | [docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md) |
| LAN / phone testing | [docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md) |
| Vercel deployment | [docs/VERCEL.md](docs/VERCEL.md) |
| Railway MySQL | [docs/RAILWAY.md](docs/RAILWAY.md) |
| Express API | [docs/BACKEND_API.md](docs/BACKEND_API.md) |
