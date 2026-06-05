/** Public menu (browse or order after QR scan). */
export const MENU_PAGE_PATH = "/menu-page";

export const ADMIN_PAGE_PATH = "/admin";

export function isAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_PAGE_PATH ||
    pathname.startsWith(`${ADMIN_PAGE_PATH}/`)
  );
}
