# MySQL setup

The app stores products, orders, and admin users in **MySQL 8+**.

## 1. Create the database

In **MySQL Workbench** or the CLI:

```bash
mysql -u root -p < mysql/schema.sql
```

This creates `mini_qr_ordering` with tables `products`, `orders`, `admin_users`, sample menu items, and a default admin user.

| Field | Value |
|-------|--------|
| Username | `admin` |
| Password | `admin12345` |

Change the password in production (update `password_hash` with a new bcrypt hash).

## 2. Configure the app

Copy `.env.example` to `.env.local` and set:

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `ADMIN_SESSION_SECRET` (long random string)

## 3. Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the menu and admin login.

Optional Express API (assignment-style REST on port 4000):

```bash
copy backend.env.example .env
npm run dev:api
```

See [BACKEND_API.md](./BACKEND_API.md).
