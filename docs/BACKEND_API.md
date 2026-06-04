# Express Backend API

Node.js + Express REST API. Data is stored in **MySQL** when `MYSQL_HOST`, `MYSQL_USER`, and `MYSQL_DATABASE` are set in `.env` (see `backend.env.example` and `mysql/schema.sql`).

## Run the Express server

```bash
npm run dev:api
```

Default base URL: **http://localhost:4000**

Frontend (`npm run dev` on port 3000) can call the same routes via Next.js proxies at `/api/*`, or set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.

---

## 🟢 GET Products

**`GET /api/products`**

Returns all menu products as JSON.

### Response `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Signature Wagyu Burger",
      "price": 18,
      "category": "Mains",
      "image_url": "https://...",
      "created_at": "2026-01-02T10:00:00.000Z"
    }
  ]
}
```

### Example

```bash
curl http://localhost:4000/api/products
```

---

## 🟢 POST Order

**`POST /api/orders`**

Creates an order. Request body must include **items** (with quantities), and **total_amount**. Saved to the database with `payment_status: "Pending"`.

### Request body

```json
{
  "items": [
    {
      "product_id": "uuid-or-id",
      "name": "Signature Wagyu Burger",
      "price": 18,
      "quantity": 2,
      "image_url": "https://example.com/burger.jpg"
    }
  ],
  "total_amount": 38.93
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | yes | At least one line item |
| `items[].product_id` | string \| number | yes | Product reference |
| `items[].name` | string | yes | Display name |
| `items[].price` | number | yes | Unit price |
| `items[].quantity` | integer | yes | Min 1 |
| `items[].image_url` | string \| null | no | Optional image |
| `total_amount` | number | yes | Order total (> 0) |

### Response `201`

```json
{
  "data": {
    "id": "uuid",
    "items": [ /* same shape as request */ ],
    "total_amount": 38.93,
    "payment_status": "Pending",
    "created_at": "2026-06-02T12:00:00.000Z"
  }
}
```

### Example

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"product_id\":\"p2\",\"name\":\"Signature Wagyu Burger\",\"price\":18,\"quantity\":1}],\"total_amount\":19.53}"
```

### Validation error `400`

```json
{
  "error": {
    "message": "Validation error",
    "issues": [ /* zod details */ ]
  }
}
```

---

## 🟢 GET Orders (Admin)

**`GET /api/orders`**

Returns all orders (newest first), including **items** and **payment_status**, for the admin dashboard.

### Response `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "items": [
        {
          "product_id": "p2",
          "name": "Signature Wagyu Burger",
          "price": 18,
          "quantity": 1,
          "image_url": null
        }
      ],
      "total_amount": 19.53,
      "payment_status": "Pending",
      "created_at": "2026-06-02T12:00:00.000Z"
    }
  ]
}
```

### Example

```bash
curl http://localhost:4000/api/orders
```

Admin UI: **http://localhost:3000/admin**

---

## Extra: Update payment status (Admin)

**`PATCH /api/orders/:id/payment`**

```json
{ "payment_status": "Paid" }
```

Allowed values: `Pending`, `Paid`, `Failed`.

---

## Project structure

| Layer | Files |
|-------|--------|
| Server | `server.js`, `app.js` |
| Routes | `routes/products.routes.js`, `routes/orders.routes.js` |
| Controllers | `controllers/products.controller.js`, `controllers/orders.controller.js` |
| Services | `services/products.service.js`, `services/orders.service.js` |
| Validation | `schemas/order.schemas.js` |
| Database | `config/mysql.js`, `mysql/schema.sql` |
