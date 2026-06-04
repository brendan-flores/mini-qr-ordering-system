# Deploy to Vercel

This project is a **Next.js** app. Vercel runs the UI and API routes (`app/api/*`) as serverless functions. The separate Express server (`server.js`) is for **local development only** and is not deployed.

## Prerequisites

- GitHub, GitLab, or Bitbucket repo (or deploy with [Vercel CLI](https://vercel.com/docs/cli))
- Node.js 20+ (see `.nvmrc`)

## Deploy from the Vercel dashboard

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. **Framework Preset:** Next.js (auto-detected).
3. **Root Directory:** `.` (repository root).
4. **Build Command:** `npm run build` (default).
5. **Output:** managed by Next.js (no custom output directory).
6. Add environment variables (see below), then deploy.

## Environment variables

| Variable | Production | Preview | Notes |
|----------|------------|---------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | optional | QR code target URL |
| `NEXT_PUBLIC_API_BASE_URL` | *(leave empty)* | *(leave empty)* | Same-origin `/api/*` on Vercel |
| `MYSQL_HOST` | required | required | MySQL host (e.g. PlanetScale, Railway, or self-hosted) |
| `MYSQL_USER` | required | required | Database user |
| `MYSQL_PASSWORD` | required | required | Database password |
| `MYSQL_DATABASE` | required | required | e.g. `mini_qr_ordering` |
| `ADMIN_SESSION_SECRET` | required | required | Signs admin session cookie |

Copy from [`.env.example`](../.env.example).

## Deploy with CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts. For production:

```bash
vercel --prod
```

Set env vars:

```bash
vercel env add NEXT_PUBLIC_APP_URL production
```

## What runs on Vercel

| Path | Handler |
|------|---------|
| `/` | Customer menu (`app/page.tsx`) |
| `/checkout` | Checkout flow |
| `/admin` | Admin dashboard |
| `/api/products` | Product list (MySQL) |
| `/api/orders` | Orders API |

## Database on serverless

Configure a hosted **MySQL** instance and set the `MYSQL_*` variables in Vercel. Run `mysql/schema.sql` against that database before going live.

## Custom domain

After deploy: **Project → Settings → Domains** → add your domain, then set:

`NEXT_PUBLIC_APP_URL=https://yourdomain.com`

Redeploy so QR codes use the new URL.

## Troubleshooting

- **Build fails:** Run `npm run build` locally and fix TypeScript/ESLint errors.
- **Images not loading:** Remote host must be listed in `next.config.ts` → `images.remotePatterns`.
- **API 500:** Check **Functions** logs in the Vercel dashboard for the failing route.
