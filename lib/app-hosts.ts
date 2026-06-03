/** Hostname prefix for the admin Vercel/custom domain (see proxy.ts). */
export const ADMIN_HOST_PREFIX = "brencravings-admin";

export function isAdminHost(host: string) {
  return host.toLowerCase().startsWith(ADMIN_HOST_PREFIX);
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

export function getAdminAppOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** Customer-facing paths that should not be served on the admin hostname. */
export function isCustomerPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/menu-page") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/products")
  );
}
