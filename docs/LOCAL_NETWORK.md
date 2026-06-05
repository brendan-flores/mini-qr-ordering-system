# Local network access and QR security

## Run on the network

```bash
npm install
npm run dev
```

The dev server listens on all interfaces, but the terminal prints your real **Network** URL (e.g. `http://192.168.1.25:3000`). Use that on phones or another laptop on the same Wi‑Fi — do **not** use `http://0.0.0.0:3000`.

`next.config.ts` automatically allows your machine’s LAN IP and common private ranges (`192.168.*`, `10.*`, etc.) so client JavaScript loads correctly. No manual IP edit is required.

**First-time setup on a new PC:** `npm run dev` creates `.env.local` from `.env.example` if missing. Run `mysql/schema.sql` in MySQL Workbench and set `MYSQL_PASSWORD` in `.env.local` if your MySQL root user has a password.

**QR codes for phones:** when you open admin on `localhost:3000`, generated QRs automatically use your PC’s **Network** IP (e.g. `http://192.168.1.25:3000`) so phones on the same Wi‑Fi can scan them. Opening admin on the Network URL works the same way.

To override the auto-detected IP, set:

```env
NEXT_PUBLIC_APP_URL=http://192.168.1.25:3000
```

Replace with your actual IP from `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

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
