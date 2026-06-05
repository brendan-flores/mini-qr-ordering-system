# Mini QR Restaurant Ordering System (React + Node.js + MySQL)

**BrenCravings** — a QR-based restaurant ordering app with a customer menu and an admin kitchen dashboard.

## Live website

| App | Link |
|-----|------|
| **Customer menu** (order after scanning a table QR) | [https://brencravings.vercel.app](https://brencravings.vercel.app) |
| **Admin dashboard** (kitchen, orders, QR generator) | [https://brencravings-admin.vercel.app](https://brencravings-admin.vercel.app) |

Default admin login: `admin` / `admin12345`

## Use on your local network

You can run the same app on your Wi‑Fi for testing on phones and other devices:

```bash
npm install
npm run dev
```

Then open the site from any device on the same network using your PC’s LAN IP, for example:

- Customer menu: `http://192.168.1.10:3000`
- Admin: `http://192.168.1.10:3000/admin`

Replace `192.168.1.10` with your computer’s actual IP (`ipconfig` on Windows, `ifconfig` / `ip addr` on Mac/Linux).

More LAN tips: **[docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md)**

---

## Installation guide

Follow these steps in order to run the project on your own machine.

### Prerequisites

- **Node.js** 18 or newer
- **MySQL** 8 (MySQL Workbench recommended)
- **Git**

### Step 1 — Clone the project

```bash
git clone <your-repo-url>
cd mini-qr-ordering-system
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Local config (first run)

The GitHub ZIP does **not** include `.env.local`. The first time you run `npm run dev`, the project copies `.env.example` → `.env.local` automatically.

If your MySQL `root` user has a password, open `.env.local` and set `MYSQL_PASSWORD`.

### Step 4 — Set up the database

1. Open **MySQL Workbench** and connect to your local MySQL server.
2. **File → Open SQL Script** → select `mysql/schema.sql` in this project.
3. Select **all** lines (Ctrl+A) → click **Execute** (⚡).
4. Refresh **Schemas** → open `mini_qr_ordering` → **Tables**. You should see **4 tables**:

   `admin_users` · `products` · `orders` · `qr_access_bindings`

More detail: **[docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md)**

### Step 5 — Start the app

```bash
npm run dev
```

Open in your browser:

- **On this PC:** [http://localhost:3000](http://localhost:3000) (menu) · [http://localhost:3000/admin](http://localhost:3000/admin) (admin)
- **On your phone / another laptop (same Wi‑Fi):** use the **Network** URL printed in the terminal (e.g. `http://192.168.1.25:3000`)

If the menu or admin page loads but shows no data, check that `mysql/schema.sql` was executed and that `MYSQL_PASSWORD` in `.env.local` matches your MySQL server.

---

## How ordering works (important)

Guests **must scan a table QR code** from the admin dashboard before they can add items to the cart or place an order.

| What the guest does | What happens |
|---------------------|--------------|
| Opens the menu page **without** scanning a QR | Can **browse** the menu only — **cannot order** |
| Types `?table=1` in the browser address bar | Still **cannot order** — the link must come from a valid QR scan |
| **Scans** a table QR printed from the admin page | Cart and checkout **unlock** on that device |

**This is intentional.** It protects the restaurant from fake, spam, or scam orders from random visitors on the internet. Only guests at a real table (with a printed QR) can place orders.

After a valid scan:

- The QR link is bound to **one device** — sharing the link to another phone is blocked.
- If the guest is inactive for **15 minutes**, they must scan the QR again.

---

## Features

### Customer (mobile-responsive)

- Browse menu products by category
- Add to cart, update quantity, remove items
- Checkout with computed total
- Dine-in or takeout; order tracking page

### QR codes (admin dashboard)

QR codes are **generated on the admin page**, not the customer menu.

1. Log in at `/admin`.
2. Open **Table QR codes** in the left sidebar (desktop) or tap **QR** (mobile).
3. Enter a table number → click **Go** → preview the QR → **Download PNG**.
4. Print and place at the table. Guests **scan** the QR to open the menu and order.

Each QR encodes a signed URL like:

```text
/menu-page?table=1&access=<signed-token>
```

Re-print a QR when you need a new guest at the same table — each **Go** click issues a new `access` token.

### Admin dashboard

- View live orders (payment + kitchen status)
- New-order notification bell
- Update payment status and kitchen workflow
- Table QR generator

### Payment simulation

- **Pay at counter (cash)** — order sent to kitchen; pay when served
- **GCash (mock)** — simulated success/failure flow (no real payment API)

---

## Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind CSS 4, Next.js 16 |
| API | Node.js (Next Route Handlers + optional Express) |
| Database | MySQL (`mysql2`) |

---

## Main API routes (Next.js)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | Menu products |
| POST | `/api/orders` | Place order (requires QR session) |
| GET | `/api/admin/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/[id]` | Kitchen / payment updates |
| POST | `/api/admin/table-qr-token` | Issue signed `access` token for a table QR (admin) |
| GET | `/api/qr/activate` | Validate scan URL and set order session cookie |
| GET | `/api/qr/session` | Check whether guest has an active QR order session |
| GET | `/api/qr/ping` | Refresh session activity (15-minute inactivity limit) |
| POST | `/api/qr/logout` | Clear QR order session cookie |

---

## Optional: Express API (local only)

```bash
npm run dev:api
```

Runs on `http://localhost:4000`. See **[docs/BACKEND_API.md](docs/BACKEND_API.md)**.

---

## Further documentation

| Topic | File |
|-------|------|
| MySQL setup | [docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md) |
| LAN / phone testing | [docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md) |
| Vercel deployment | [docs/VERCEL.md](docs/VERCEL.md) |
| Railway MySQL | [docs/RAILWAY.md](docs/RAILWAY.md) |
