/** Hostname prefix for the admin Vercel/custom domain (see proxy.ts). */
export const ADMIN_HOST_PREFIX = "brencravings-admin";

const DEFAULT_ADMIN_ORIGIN = "https://brencravings-admin.vercel.app";

export function isAdminHost(host: string) {
  return host.toLowerCase().startsWith(ADMIN_HOST_PREFIX);
}

function isLocalDevHost(host: string) {
  const h = host.toLowerCase();
  const hostname = h.split(":")[0] ?? h;

  if (hostname === "localhost" || hostname === "127.0.0.1") return true;

  // Allow private LAN IPs in development so admin works from phones/tablets
  // while you’re running the app locally.
  //  - 10.0.0.0/8
  //  - 172.16.0.0/12
  //  - 192.168.0.0/16
  if (hostname.startsWith("10.")) return true;
  if (hostname.startsWith("192.168.")) return true;

  const m = hostname.match(/^172\.(\d+)\./);
  if (m) {
    const secondOctet = Number(m[1]);
    if (Number.isFinite(secondOctet) && secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

/** Admin UI and /api/admin are only served on the admin hostname (localhost allowed in dev). */
export function canServeAdminRoutes(host: string) {
  if (isAdminHost(host)) return true;
  if (process.env.NODE_ENV === "development" && isLocalDevHost(host)) {
    return true;
  }
  return false;
}

export function getMenuAppOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function getAdminAppOrigin(): string {
  const url = process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim();
  if (url) {
    try {
      return new URL(url).origin;
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_ADMIN_ORIGIN;
}

/** Customer UI routes redirected off the admin hostname (not API — admin needs /api/orders). */
export function isCustomerPath(pathname: string) {
  if (pathname.startsWith("/api/")) return false;
  return (
    pathname === "/" ||
    pathname.startsWith("/menu-page") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders")
  );
}
