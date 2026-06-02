import type { NextRequest } from "next/server";

const ADMIN_HOST_PREFIX = "brencravings-admin";

/** Admin API access: admin subdomain, admin key header, or local dev */
export function isAdminRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (host.startsWith(ADMIN_HOST_PREFIX)) {
    return true;
  }

  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_API_KEY;
  if (expected && key === expected) {
    return true;
  }

  return false;
}

export function adminUnauthorized() {
  return Response.json(
    { error: { message: "Admin access required" } },
    { status: 403 }
  );
}
