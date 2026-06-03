import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

/** Hostnames that should open the admin dashboard at `/` */
const ADMIN_HOST_PREFIX = "brencravings-admin";
const ADMIN_LOGIN = "/admin/login";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  if (host.startsWith(ADMIN_HOST_PREFIX) && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
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
  matcher: ["/", "/admin/:path*", "/api/admin/:path*"],
};
