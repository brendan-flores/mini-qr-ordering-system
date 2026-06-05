import type { RowDataPacket } from "mysql2";
import { isQrBindingInactive } from "@/lib/qr-binding-inactivity";
import { query } from "./db";

export type QrAccessBindingRow = {
  access_jti: string;
  table_number: string;
  device_id: string;
  bound_at: string;
  last_active_at: string;
};

export type QrAccessBindResult = "activated" | "renewed" | "denied";

function mapRow(row: RowDataPacket): QrAccessBindingRow {
  const lastActive = row.last_active_at ?? row.bound_at;
  return {
    access_jti: String(row.access_jti),
    table_number: String(row.table_number),
    device_id: String(row.device_id),
    bound_at:
      row.bound_at instanceof Date
        ? row.bound_at.toISOString()
        : String(row.bound_at),
    last_active_at:
      lastActive instanceof Date
        ? lastActive.toISOString()
        : String(lastActive),
  };
}

export async function getQrAccessBinding(
  accessJti: string
): Promise<QrAccessBindingRow | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT access_jti, table_number, device_id, bound_at, last_active_at
     FROM qr_access_bindings
     WHERE access_jti = ?
     LIMIT 1`,
    [accessJti]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function touchQrAccessBinding(
  accessJti: string,
  deviceId: string
): Promise<void> {
  await query(
    `UPDATE qr_access_bindings
     SET last_active_at = CURRENT_TIMESTAMP
     WHERE access_jti = ? AND device_id = ?`,
    [accessJti, deviceId]
  );
}

/**
 * First device to activate a QR access token wins.
 * Same device may re-activate (cookie refresh); other devices are denied
 * unless the current binding has gone inactive (browser closed / no heartbeat).
 */
export async function bindQrAccessToDevice(
  accessJti: string,
  tableNumber: string,
  deviceId: string
): Promise<QrAccessBindResult> {
  const existing = await getQrAccessBinding(accessJti);
  if (existing) {
    if (existing.device_id === deviceId) {
      await touchQrAccessBinding(accessJti, deviceId);
      return "renewed";
    }

    if (isQrBindingInactive(existing.last_active_at)) {
      await releaseQrAccessBinding(existing.access_jti, existing.device_id);
    } else {
      return "denied";
    }
  }

  try {
    await query(
      `INSERT INTO qr_access_bindings (access_jti, table_number, device_id)
       VALUES (?, ?, ?)`,
      [accessJti, tableNumber, deviceId]
    );
    await touchQrAccessBinding(accessJti, deviceId);
    return "activated";
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code: string }).code)
        : "";
    if (code !== "ER_DUP_ENTRY") throw e;

    const raced = await getQrAccessBinding(accessJti);
    if (!raced) throw e;
    if (raced.device_id === deviceId) {
      await touchQrAccessBinding(accessJti, deviceId);
      return "renewed";
    }
    if (isQrBindingInactive(raced.last_active_at)) {
      await releaseQrAccessBinding(raced.access_jti, raced.device_id);
      return bindQrAccessToDevice(accessJti, tableNumber, deviceId);
    }
    return "denied";
  }
}

export async function isDeviceAuthorizedForQrAccess(
  accessJti: string,
  deviceId: string
): Promise<boolean> {
  const binding = await getQrAccessBinding(accessJti);
  if (!binding || binding.device_id !== deviceId) return false;

  if (isQrBindingInactive(binding.last_active_at)) {
    await releaseQrAccessBinding(accessJti, deviceId);
    return false;
  }

  return true;
}

/** Remove device binding so the printed QR can be scanned on another phone. */
export async function releaseQrAccessBinding(
  accessJti: string,
  deviceId: string
): Promise<void> {
  await query(
    `DELETE FROM qr_access_bindings
     WHERE access_jti = ? AND device_id = ?`,
    [accessJti, deviceId]
  );
}
