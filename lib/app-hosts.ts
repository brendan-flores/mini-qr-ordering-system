/** Hostname prefix for the admin Vercel/custom domain (see proxy.ts). */
export const ADMIN_HOST_PREFIX = "brencravings-admin";

const DEFAULT_ADMIN_ORIGIN = "https://brencravings-admin.vercel.app";

export function isAdminHost(host: string) {
  return host.toLowerCase().startsWith(ADMIN_HOST_PREFIX);
}

function isLocalDevHost(host: string) {
  const h = host.toLowerCase();
  return (
    h.startsWith("localhost:") ||
    h.startsWith("127.0.0.1:") ||
    h === "localhost" ||
    h === "127.0.0.1"
  );
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
