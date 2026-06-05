# BrenCravings — Mini QR Restaurant Ordering System

Guests scan a table QR code to order from their phone. Staff manage orders and table QRs from an admin dashboard.

**Stack:** Next.js 16 · React 19 · MySQL 8

---

## Prerequisites

- **Node.js 20+**
- **MySQL 8** (MySQL Workbench or any MySQL client)

---

## Installation

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd mini-qr-ordering-system
npm install
```

### 2. Set up the database

1. Open **MySQL Workbench** and connect to your local MySQL server.
2. **File → Open SQL Script** → select `mysql/schema.sql`
3. Select all (Ctrl+A) → **Execute** (⚡)
4. Confirm the database `mini_qr_ordering` has these tables: `admin_users`, `products`, `orders`, `qr_access_bindings`

### 3. Environment variables

On the first run, `npm run dev` copies `.env.example` → `.env.local`.

**Only change this if your MySQL `root` user has a password:**

```env
MYSQL_PASSWORD=your_password_here
```

Leave everything else as-is for local development. Do not commit `.env.local`.

| Variable | Local default | When to change |
|----------|---------------|----------------|
| `MYSQL_HOST` | `127.0.0.1` | Rarely |
| `MYSQL_PASSWORD` | *(empty)* | If MySQL requires a password |
| `MYSQL_DATABASE` | `mini_qr_ordering` | Must match schema |
| `ADMIN_SESSION_SECRET` | *(empty)* | **Required on Vercel only** |

### 4. Run the project

```bash
npm run dev
```

Restart the dev server after editing `.env.local`.

---

## Test the application

### On this PC

| Page | URL |
|------|-----|
| Menu | [http://localhost:3000](http://localhost:3000) |
| Admin | [http://localhost:3000/admin](http://localhost:3000/admin) |

**Admin login:** `admin` / `admin12345`

**Quick check:** [http://localhost:3000/api/products](http://localhost:3000/api/products) should return JSON menu data.

### On your phone (same Wi‑Fi)

Use the **Network** URL shown in the terminal (e.g. `http://192.168.1.10:3000`), not `0.0.0.0`.

| Page | URL |
|------|-----|
| Menu | `http://192.168.x.x:3000` |
| Admin | `http://192.168.x.x:3000/admin` |

### QR ordering flow (local or LAN)

1. Open **Admin** → sidebar **Table QR codes** → enter table number → **Go** → download PNG
2. Scan the QR with a phone → menu unlocks for ordering on that device
3. Place an order → it appears in **Admin → Live Orders**

Guests must **scan** the QR to order. Browsing the menu without scanning does not enable checkout.

More on phone/LAN testing: [docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md)

### Live demo (no local setup)

| App | URL |
|-----|-----|
| Customer menu | [https://brencravings.vercel.app](https://brencravings.vercel.app) |
| Admin | [https://brencravings-admin.vercel.app](https://brencravings-admin.vercel.app) |

Login: `admin` / `admin12345`

For production deploy and Railway MySQL: [docs/VERCEL.md](docs/VERCEL.md) · [docs/RAILWAY.md](docs/RAILWAY.md)

---

## Common issues

| Error | Fix |
|-------|-----|
| `Access denied for user 'root'@'localhost'` | Set `MYSQL_PASSWORD` in `.env.local` and restart `npm run dev` |
| Empty menu / API errors | Run `mysql/schema.sql` and confirm MySQL is running |
| Phone cannot connect | Use the LAN IP from the terminal; PC and phone must be on the same Wi‑Fi |
| QR works locally but not on Vercel | Run `schema.sql` on your **production** database (Railway), not only local MySQL |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint
```

---

## More documentation

| Topic | File |
|-------|------|
| MySQL setup | [docs/MYSQL_SETUP.md](docs/MYSQL_SETUP.md) |
| LAN / phone testing | [docs/LOCAL_NETWORK.md](docs/LOCAL_NETWORK.md) |
| Vercel deployment | [docs/VERCEL.md](docs/VERCEL.md) |
| Railway MySQL | [docs/RAILWAY.md](docs/RAILWAY.md) |
