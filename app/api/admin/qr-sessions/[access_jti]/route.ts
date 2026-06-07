import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/server/auth/admin-auth";
import { adminForceReleaseQrAccessBinding } from "@/lib/server/db/qr-access-bindings";
import { getErrorMessage } from "@/lib/server/services/db-errors";

type RouteContext = { params: Promise<{ access_jti: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(request))) {
    return adminUnauthorized();
  }

  const { access_jti: accessJti } = await context.params;
  const trimmed = accessJti?.trim();
  if (!trimmed) {
    return NextResponse.json(
      { error: { message: "Session ID is required." } },
      { status: 400 }
    );
  }

  try {
    const released = await adminForceReleaseQrAccessBinding(trimmed);
    if (!released) {
      return NextResponse.json(
        { error: { message: "QR session not found or already ended." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { ok: true, access_jti: trimmed } });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
