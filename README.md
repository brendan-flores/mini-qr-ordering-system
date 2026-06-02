# Mini QR Restaurant Ordering System (Node.js + Supabase)

Single repo root containing:

- **Frontend**: Next.js (React) customer ordering UI + admin dashboard (`app/`, `components/`, `client/`)
- **Backend**: Node.js + Express REST API using Supabase (Postgres) (`routes/`, `controllers/`, `services/`, `config/`, `app.js`, `server.js`)

## Quick start (local)

### 1) Supabase schema

Create these tables in Supabase SQL Editor:

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total_amount numeric not null check (total_amount > 0),
  payment_status text not null check (payment_status in ('Pending','Paid','Failed')),
  created_at timestamptz not null default now()
);
```

Seed sample products (optional):

```sql
insert into public.products (name, price, image_url) values
('Truffle Parmesan Fries', 8.50, null),
('Signature Wagyu Burger', 18.00, null),
('Roasted Roots Quinoa Bowl', 14.50, null),
('Iced Matcha Latte', 5.50, null);
```

### 2) Backend setup (Express + Supabase)

```bash
copy backend.env.example .env
```

Fill in:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Run:

```bash
npm install
npm run dev:api
```

Backend runs on `http://localhost:4000`.

### 3) Frontend setup (Next.js)

```bash
copy frontend.env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API

### `GET /api/products`

Returns all products.

### `POST /api/orders`

Creates a new order.

Body:

```json
{
  "items": [
    { "product_id": "uuid", "name": "Burger", "price": 18, "quantity": 1, "image_url": null }
  ],
  "total_amount": 28.75
}
```

### `GET /api/orders`

Returns all orders (newest first).

### `PATCH /api/orders/:id/payment`

Updates payment status (mock payment flow).

Body:

```json
{ "payment_status": "Paid" }
```

## UI routes

- `/`: Customer menu + cart + checkout entry
- `/checkout`: Mock payment screen
- `/admin`: Admin dashboard (view orders + update payment status)

## Notes

- QR code is generated in the frontend and links to the menu URL.
- Input validation uses `zod`, errors are returned as JSON.
