# Deploy with Railway (MySQL) + Vercel (app)

Use **Railway** for MySQL and **Vercel** for the Next.js site. The app does not run on Railway unless you choose to host it there later.

## Part 1 — MySQL on Railway

1. Sign in at [railway.app](https://railway.app) → **New Project**.
2. **Add service** → **Database** → **MySQL** (or **Empty Project** → **+ New** → **Database** → **MySQL**).
3. Open the MySQL service → **Variables** (or **Connect**). Note:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
4. **Networking** → enable **Public networking** (or **TCP Proxy**) so Vercel can reach the database from the internet.
5. Load schema (see **Running schema.sql** below).

Default admin after schema: `admin` / `admin12345`.

## Part 2 — Vercel environment variables

In **Vercel** → your project → **Settings** → **Environment Variables** (Production):

| Vercel variable | Value |
|-----------------|--------|
| `MYSQL_PUBLIC_URL` | **Best:** copy Railway `MYSQL_PUBLIC_URL` (public TCP URL). The app parses host/port/user/password from it. |
| `MYSQL_HOST` | **Public** host only (e.g. `xxxx.proxy.rlwy.net`) — **never** `mysql.railway.internal` |
| `MYSQL_PORT` | Public port from **Connect** (often not `3306`) |
| `MYSQL_USER` | Railway `MYSQLUSER` |
| `MYSQL_PASSWORD` | Railway `MYSQLPASSWORD` |
| `MYSQL_DATABASE` | `mini_qr_ordering` (where your tables live) |
| `MYSQL_SSL` | `true` |
| `ADMIN_SESSION_SECRET` | Long random string |
| `NEXT_PUBLIC_APP_URL` | `https://your-menu.vercel.app` |
| `NEXT_PUBLIC_ADMIN_APP_URL` | `https://brencravings-admin.vercel.app` (or your admin domain) |
| `NEXT_PUBLIC_API_BASE_URL` | *(empty)* |

Redeploy after saving variables.

The app also accepts Railway’s variable names (`MYSQLHOST`, etc.) directly if you prefer copying them without renaming.

## Part 3 — Deploy the app

1. Push code to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import repo → deploy.
3. Add admin domain if you use a separate admin hostname (see [VERCEL.md](./VERCEL.md)).

## Part 4 — Test live

1. Open production menu URL → products load.
2. Place an order.
3. Railway MySQL → **Data** / Workbench → `orders` table has a new row.

## Running schema.sql

### Do not paste SQL into the bash prompt

Railway **Console** is a **bash** shell (`bash-5.1#`). If you paste `CREATE TABLE...` there, bash treats it as shell commands and errors like `CREATE: command not found`.

### Option B — Railway Console (correct way)

1. MySQL service → **Console** tab.
2. Type this **one line** and press Enter:

```bash
mysql -u root -p"$MYSQL_ROOT_PASSWORD"
```

3. When you see the **`mysql>`** prompt (not `bash-5.1#`), paste the **full** contents of `mysql/schema.sql` from your project (all lines from `CREATE DATABASE` through the last `INSERT`).
4. Press Enter. Wait until it finishes and you get `mysql>` again.
5. Type `exit` and press Enter.

Verify:

```bash
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "USE mini_qr_ordering; SHOW TABLES;"
```

You should see `products`, `orders`, `admin_users`.

### Option A — MySQL Workbench (recommended)

Use **Connect** on Railway → public host/port → open `mysql/schema.sql` in Workbench → Execute. Easier than pasting in a terminal.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ENOTFOUND mysql.railway.internal` | You used Railway’s **private** host on Vercel. Use **Connect → Public** host or set `MYSQL_PUBLIC_URL`; redeploy |
| `ETIMEDOUT` / cannot connect | Turn on Railway **public** networking; check host/port in Vercel |
| SSL / handshake errors | Set `MYSQL_SSL=true` on Vercel and redeploy |
| 503 MySQL not configured | All `MYSQL_*` vars set on Vercel; redeploy |
| Empty `orders` on Railway | Schema run on the **same** DB Vercel points to |

Local dev stays on `.env.local` with `127.0.0.1` and **no** `MYSQL_SSL` (unless your local MySQL requires it).
