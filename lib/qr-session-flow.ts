import { MENU_PAGE_PATH } from "@/lib/routes";

export function isMenuPagePath(pathname: string): boolean {
  return (
    pathname === MENU_PAGE_PATH || pathname.startsWith(`${MENU_PAGE_PATH}/`)
  );
}

/** Routes where an in-progress QR scan session may continue (checkout/orders, or menu with scan link). */
export function isQrOrderingFlowPath(pathname: string): boolean {
  return (
    isMenuPagePath(pathname) ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/")
  );
}

export function hasQrCredentialsInUrl(
  table: string | null | undefined,
  access: string | null | undefined
): boolean {
  return Boolean(table?.trim() && access?.trim());
}

/** Menu opened without ?table= & ?access= (session restored from server if still active). */
export function isBareMenuVisit(
  pathname: string,
  table: string | null | undefined,
  access: string | null | undefined
): boolean {
  return (
    isMenuPagePath(pathname) && !hasQrCredentialsInUrl(table, access)
  );
}
