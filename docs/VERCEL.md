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
| `SUPABASE_URL` | optional | optional | Only when using Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | optional | Server-only; never expose as `NEXT_PUBLIC_*` |

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
| `/api/products` | Product list (mock or Supabase) |
| `/api/orders` | Orders API |

## Mock data on serverless

Without Supabase, orders are stored **in memory**. On Vercel, that data does not persist across cold starts or multiple instances. For production, connect Supabase (or another database) later.

## Custom domain

After deploy: **Project → Settings → Domains** → add your domain, then set:

`NEXT_PUBLIC_APP_URL=https://yourdomain.com`

Redeploy so QR codes use the new URL.

## Troubleshooting

- **Build fails:** Run `npm run build` locally and fix TypeScript/ESLint errors.
- **Images not loading:** Remote host must be listed in `next.config.ts` → `images.remotePatterns`.
- **API 500:** Check **Functions** logs in the Vercel dashboard for the failing route.
