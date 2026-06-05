import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-session";
import {
  canServeAdminRoutes,
  getMenuAppOrigin,
  isAdminHost,
  isCustomerPath,
} from "@/lib/app-hosts";
import {
  attachQrOrderSessionCookie,
  tryActivateQrOrderSession,
} from "@/lib/qr-order-activate";
import { normalizeTableNumber } from "@/lib/table";
import { MENU_PAGE_PATH } from "@/lib/routes";

const ADMIN_LOGIN = "/admin/login";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const { pathname, search } = request.nextUrl;
  const onAdminHost = isAdminHost(host);
  const adminAllowed = canServeAdminRoutes(host);

  if (!adminAllowed && pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: { message: "Not Found" } },
      { status: 404 }
    );
  }

  if (onAdminHost && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (onAdminHost && isCustomerPath(pathname)) {
    const menuOrigin = getMenuAppOrigin();
    if (menuOrigin) {
      return NextResponse.redirect(
        new URL(`${pathname}${search}`, menuOrigin)
      );
    }
  }

  if (!adminAllowed) {
    const table = normalizeTableNumber(
      request.nextUrl.searchParams.get("table")
    );
    const access = request.nextUrl.searchParams.get("access")?.trim();
    if (
      table &&
      access &&
      (pathname === MENU_PAGE_PATH || pathname.startsWith(`${MENU_PAGE_PATH}/`))
    ) {
      const sessionToken = await tryActivateQrOrderSession(table, access);
      if (sessionToken) {
        const res = NextResponse.next();
        attachQrOrderSessionCookie(res, sessionToken);
        return res;
      }
    }
    return NextResponse.next();
  }

  const session = await getAdminSessionFromRequest(request);

  if (pathname.startsWith("/admin")) {
    if (pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)) {
      if (session) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      const login = new URL(ADMIN_LOGIN, request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (
      pathname.startsWith("/api/admin/auth/login") ||
      pathname === "/api/admin/auth/logout"
    ) {
      return NextResponse.next();
    }
    if (!session) {
      const key = request.headers.get("x-admin-key");
      const expected = process.env.ADMIN_API_KEY?.trim();
      if (!expected || key !== expected) {
        return NextResponse.json(
          { error: { message: "Admin access required" } },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/menu-page",
    "/checkout/:path*",
    "/orders/:path*",
    "/api/orders/:path*",
    "/api/products",
  ],
};
