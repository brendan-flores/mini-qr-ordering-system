import type { NextRequest } from "next/server";

const ADMIN_HOST_PREFIX = "brencravings-admin";

function isLocalHost(host: string) {
  return (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

/** Admin API access: dev, localhost, same-origin admin UI, admin subdomain, or API key */
export function isAdminRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (isLocalHost(host)) {
    return true;
  }

  if (host.startsWith(ADMIN_HOST_PREFIX)) {
    return true;
  }

  /** Browser admin dashboard on the same Next.js app (e.g. Vercel /menu-page + /admin). */
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin") {
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
