# Mini QR Restaurant Ordering System (React + Node.js + MySQL)

**BrenCravings** — a QR-based restaurant ordering app with a customer menu and an admin kitchen dashboard.

## Live website

| App | Link |
|-----|------|
| **Customer menu** (order after scanning a table QR) | [https://brencravings.vercel.app](https://brencravings.vercel.app) |
| **Admin dashboard** (kitchen, orders, QR generator) | [https://brencravings-admin.vercel.app](https://brencravings-admin.vercel.app) |

Default admin login: 
`Username: admin` 
`Password: admin12345`

## Use on your local network

You can run the same app on your Wi‑Fi for testing on phones and other devices:

```bash
npm install
npm run dev
```

After `npm run dev`, the terminal prints your **Network** URL. Use that IP on any device on the same Wi‑Fi (replace `192.168.1.10` with your actual address from the terminal):

- **Customer menu:** `http://192.168.1.10:3000`
- **Admin dashboard:** `http://192.168.1.10:3000/admin`

Example (from terminal output):

```text
- Network:  http://192.168.1.10:3000
```

→ Menu: `http://192.168.1.10:3000` · Admin: `http://192.168.1.10:3000/admin`

Find your IP with `ipconfig` (Windows) or `ifconfig` / `ip addr` (Mac/Linux) if needed. Do not use `http://0.0.0.0:3000`.

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

You must edit **`.env.local`** in the project root (same folder as `package.json`). Do **not** edit `.env.example` — the app reads `.env.local` only.

#### MySQL password (each PC is different)

The app connects to MySQL using `MYSQL_PASSWORD` in `.env.local`. This is **not** the admin login (`admin` / `admin12345`). It is the password for your **MySQL `root` user on this computer**.

| Where | What it does |
|-------|----------------|
| **MySQL Workbench** (connection / vault) | Lets *you* open Workbench on this PC |
| **`.env.local` → `MYSQL_PASSWORD`** | Lets the *app* connect to MySQL on this PC |

Saving a password in Workbench alone does **not** update the app. Copy the **same** password into `.env.local`:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password_here
MYSQL_DATABASE=mini_qr_ordering
```

- If MySQL `root` has **no** password on this PC, leave it empty: `MYSQL_PASSWORD=`
- Each laptop has its **own** MySQL — use **that machine’s** password, not someone else’s
- Do **not** share or commit `.env.local` (it stays on each PC only)

Also set a local dev secret (any long random string):

```env
ADMIN_SESSION_SECRET=dev-only-brencravings-local-secret
```

After saving `.env.local`, **restart** the dev server (`Ctrl+C`, then `npm run dev` again). Next.js only reads env files on startup.

**Test:** open `http://localhost:3000/api/products` — you should see JSON with menu items.

**Common error:** `Access denied for user 'root'@'localhost' (using password: NO)` means `MYSQL_PASSWORD` is still empty in `.env.local`, or you forgot to restart `npm run dev`.

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
- **On your phone / another laptop (same Wi‑Fi):** use the **Network** line from the terminal, e.g. `http://192.168.1.10:3000` (menu) and `http://192.168.1.10:3000/admin` (admin)

If the menu or admin page loads but shows no data, see **Step 3 — MySQL password** above: run `mysql/schema.sql`, set `MYSQL_PASSWORD` in `.env.local` to match MySQL Workbench on this PC, and restart `npm run dev`.

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

