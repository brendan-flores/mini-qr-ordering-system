# Local network access and QR security

## Run on the network

```bash
npm run dev
```

Use the **Network** URL on phones. Add your LAN IP to `allowedDevOrigins` in `next.config.ts`.

## Environment

```env
NEXT_PUBLIC_APP_URL=http://192.168.1.10:3000
MYSQL_HOST=127.0.0.1
ADMIN_SESSION_SECRET=your-secret
```

## QR device binding (localhost + LAN + production)

QR codes encode:

```text
/menu-page?table=1&access=<signed-token>
```

Security layers:

1. **HMAC-signed `access` token** — forged links rejected
2. **`qr_access_bindings` table** — first device to scan owns the link
3. **httpOnly session cookie** — required for `POST /api/orders`
4. **Device id check** — cookie + DB binding must match

| Action | Result |
|--------|--------|
| Open menu without QR | Browse only |
| Scan valid QR on phone A | Ordering unlocked on phone A |
| Copy same URL to phone B | **Denied** — "registered to another device" |
| `POST /api/orders` without scan | **403** |

Enforced on **localhost**, **LAN IP**, and **production** — no dev bypass.

## Quick test

1. Run `mysql/schema.sql` (must include `qr_access_bindings`)
2. Admin → generate Table 1 QR → scan on phone A → cart unlocks
3. Copy URL to phone B → ordering blocked
4. Repeat on `http://localhost:3000` — same rules apply
