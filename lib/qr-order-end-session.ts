import type { NextResponse } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import {
  getQrAccessBinding,
  releaseQrAccessBinding,
} from "@/lib/mysql/qr-access-bindings";
import { logQrSession } from "@/lib/qr-session-log";
import {
  QR_ORDER_SESSION_COOKIE,
  qrOrderSessionCookieOptions,
  type QrOrderSessionPayload,
} from "@/lib/qr-order-session";
import { parseTableQrAccessToken } from "@/lib/table-qr-access";

/** Drop the DB binding so another device may scan the same printed QR. */
export async function releaseQrOrderSessionBinding(
  session: QrOrderSessionPayload | null | undefined,
  deviceId?: string | null,
  options?: { accessToken?: string | null }
): Promise<boolean> {
  const normalizedDeviceId = normalizeDeviceId(deviceId ?? session?.deviceId);
  if (!normalizedDeviceId) {
    logQrSession("release_skipped_no_device", { hasSession: Boolean(session) });
    return false;
  }

  if (session?.jti) {
    if (session.deviceId !== normalizedDeviceId) {
      logQrSession("release_skipped_device_mismatch", {
        sessionDevice: session.deviceId,
        requestDevice: normalizedDeviceId,
        jti: session.jti,
      });
      return false;
    }

    await releaseQrAccessBinding(session.jti, normalizedDeviceId);
    logQrSession("release_ok_cookie", {
      jti: session.jti,
      deviceId: normalizedDeviceId,
      table: session.table,
    });
    return true;
  }

  const accessToken = options?.accessToken?.trim();
  if (!accessToken) {
    logQrSession("release_skipped_no_session_or_access", {
      deviceId: normalizedDeviceId,
    });
    return false;
  }

  const access = await parseTableQrAccessToken(accessToken);
  if (!access?.jti) {
    logQrSession("release_skipped_invalid_access", {
      deviceId: normalizedDeviceId,
    });
    return false;
  }

  const binding = await getQrAccessBinding(access.jti);
  if (!binding || binding.device_id !== normalizedDeviceId) {
    logQrSession("release_skipped_access_binding_mismatch", {
      jti: access.jti,
      deviceId: normalizedDeviceId,
      boundDevice: binding?.device_id ?? null,
    });
    return false;
  }

  await releaseQrAccessBinding(access.jti, normalizedDeviceId);
  logQrSession("release_ok_access_fallback", {
    jti: access.jti,
    deviceId: normalizedDeviceId,
    table: binding.table_number,
  });
  return true;
}

export function clearQrOrderSessionCookie(response: NextResponse): void {
  response.cookies.set(QR_ORDER_SESSION_COOKIE, "", {
    ...qrOrderSessionCookieOptions(0),
    maxAge: 0,
  });
}
