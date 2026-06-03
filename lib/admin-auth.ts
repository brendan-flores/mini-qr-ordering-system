import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

/** Authenticated admin API/browser access via signed session cookie or optional API key. */
export async function isAdminRequest(
  request: NextRequest
): Promise<boolean> {
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
