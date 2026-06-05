# Local network access and QR security

## Run on the network

```bash
npm run dev
```

Use the **Network** URL on phones (e.g. `http://192.168.1.10:3000`). Add your LAN IP to `allowedDevOrigins` in `next.config.ts` and restart the dev server.

## Environment

```env
NEXT_PUBLIC_APP_URL=http://192.168.1.10:3000
MYSQL_HOST=127.0.0.1
ADMIN_SESSION_SECRET=your-secret
```

## QR security (3-table schema)

QR codes encode a signed URL:

```text
/menu-page?table=1&access=<signed-token>
```

No `qr_scan_codes` or `qr_access_bindings` tables — security is:

1. **HMAC-signed `access` token** (`ADMIN_SESSION_SECRET`) — forged links rejected.
2. **httpOnly session cookie** after `/api/qr/activate` — `POST /api/orders` requires it on LAN/production.
3. **Device id in cookie** — orders must match the browser that activated the session.

| Access URL | QR scan required? |
|------------|-------------------|
| `localhost` / `127.0.0.1` | No (dev bypass) |
| LAN IP / production | Yes |

**Note:** Without DB device binding, a guest who **shares the full QR URL** can let another phone activate their own session (weaker than one-device-per-QR). Typing `?table=1` alone still does not unlock ordering — the signed `access` param is required.

## Quick LAN test

1. Run `mysql/schema.sql`, set `NEXT_PUBLIC_APP_URL` to LAN IP, restart dev server.
2. Admin → generate Table 1 QR → scan on phone → cart unlocks.
3. `POST /api/orders` without scanning → 403 on LAN IP.
