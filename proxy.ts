import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Hostnames that should open the admin dashboard at `/` */
const ADMIN_HOST_PREFIX = "brencravings-admin";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";

  if (!host.startsWith(ADMIN_HOST_PREFIX)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
