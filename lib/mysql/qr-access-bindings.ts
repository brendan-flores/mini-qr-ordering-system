import type { RowDataPacket } from "mysql2";
import { query } from "./db";

export type QrAccessBindingRow = {
  access_jti: string;
  table_number: string;
  device_id: string;
  bound_at: string;
};

export type QrAccessBindResult = "activated" | "renewed" | "denied";

function mapRow(row: RowDataPacket): QrAccessBindingRow {
  return {
    access_jti: String(row.access_jti),
    table_number: String(row.table_number),
    device_id: String(row.device_id),
    bound_at:
      row.bound_at instanceof Date
        ? row.bound_at.toISOString()
        : String(row.bound_at),
  };
}

export async function getQrAccessBinding(
  accessJti: string
): Promise<QrAccessBindingRow | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT access_jti, table_number, device_id, bound_at
     FROM qr_access_bindings
     WHERE access_jti = ?
     LIMIT 1`,
    [accessJti]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * First device to activate a QR access token wins.
 * Same device may re-activate (cookie refresh); other devices are denied.
 */
export async function bindQrAccessToDevice(
  accessJti: string,
  tableNumber: string,
  deviceId: string
): Promise<QrAccessBindResult> {
  const existing = await getQrAccessBinding(accessJti);
  if (existing) {
    return existing.device_id === deviceId ? "renewed" : "denied";
  }

  try {
    await query(
      `INSERT INTO qr_access_bindings (access_jti, table_number, device_id)
       VALUES (?, ?, ?)`,
      [accessJti, tableNumber, deviceId]
    );
    return "activated";
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code: string }).code)
        : "";
    if (code !== "ER_DUP_ENTRY") throw e;

    const raced = await getQrAccessBinding(accessJti);
    if (!raced) throw e;
    return raced.device_id === deviceId ? "renewed" : "denied";
  }
}

export async function isDeviceAuthorizedForQrAccess(
  accessJti: string,
  deviceId: string
): Promise<boolean> {
  const binding = await getQrAccessBinding(accessJti);
  return Boolean(binding && binding.device_id === deviceId);
}
