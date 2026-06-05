/** Public menu (browse or order after QR scan). */
export const MENU_PAGE_PATH = "/menu-page";

export const ADMIN_PAGE_PATH = "/admin";

export function isAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_PAGE_PATH ||
    pathname.startsWith(`${ADMIN_PAGE_PATH}/`)
  );
}

/** @deprecated Use isQrOrderingFlowPath from @/lib/qr-session-flow */
export function isQrSessionPath(pathname: string): boolean {
  return (
    pathname === MENU_PAGE_PATH ||
    pathname.startsWith(`${MENU_PAGE_PATH}/`) ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/")
  );
}
