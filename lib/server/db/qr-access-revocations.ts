import type { RowDataPacket } from "mysql2";
import { query } from "./db";

/** Block a device from re-activating the same printed QR after staff termination. */
export async function revokeQrAccessForDevice(
  accessJti: string,
  deviceId: string
): Promise<void> {
  await query(
    `INSERT IGNORE INTO qr_access_revocations (access_jti, device_id)
     VALUES (?, ?)`,
    [accessJti, deviceId]
  );
}

export async function isQrAccessRevokedForDevice(
  accessJti: string,
  deviceId: string
): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt
     FROM qr_access_revocations
     WHERE access_jti = ? AND device_id = ?
     LIMIT 1`,
    [accessJti, deviceId]
  );
  return Number(rows[0]?.cnt ?? 0) > 0;
}
