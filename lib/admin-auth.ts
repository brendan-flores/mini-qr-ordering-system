import type { NextRequest } from "next/server";
import { canServeAdminRoutes } from "@/lib/app-hosts";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

/** Authenticated admin API access via session cookie or optional API key (admin host only in production). */
export async function isAdminRequest(
  request: NextRequest
): Promise<boolean> {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (!canServeAdminRoutes(host)) {
    const key = request.headers.get("x-admin-key");
    const expected = process.env.ADMIN_API_KEY?.trim();
    if (expected && key === expected) {
      return true;
    }
    return false;
  }

  if (await getAdminSessionFromRequest(request)) {
    return true;
  }

  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_API_KEY?.trim();
  if (expected && key === expected) {
    return true;
  }

  return false;
}

export function adminUnauthorized() {
  return Response.json(
    { error: { message: "Admin access required" } },
    { status: 401 }
  );
}
