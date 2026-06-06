import type { RowDataPacket } from "mysql2";
import { isQrBindingAbandonedForDevice } from "@/lib/qr-binding-abandoned";
import {
  isQrAccessRevokedForDevice,
  revokeQrAccessForDevice,
} from "./qr-access-revocations";
import { query } from "./db";

export type QrAccessBindingRow = {
  access_jti: string;
  table_number: string;
  device_id: string;
  bound_at: string;
  last_active_at: string;
};

export type QrAccessBindResult =
  | "activated"
  | "renewed"
  | "denied"
  | "revoked";

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

/** All bindings for a table (any QR token version printed for that table). */
export async function getQrAccessBindingsForTable(
  tableNumber: string
): Promise<QrAccessBindingRow[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT access_jti, table_number, device_id, bound_at, last_active_at
     FROM qr_access_bindings
     WHERE table_number = ?
     ORDER BY last_active_at DESC`,
    [tableNumber]
  );
  return rows.map((row) => mapRow(row));
}

/** Non-abandoned binding currently holding this table, if any. */
export async function getActiveQrAccessBindingForTable(
  tableNumber: string
): Promise<QrAccessBindingRow | null> {
  for (const binding of await getQrAccessBindingsForTable(tableNumber)) {
    const abandoned = await isQrBindingAbandonedForDevice(
      binding.last_active_at,
      binding.device_id,
      binding.table_number
    );
    if (!abandoned) {
      return binding;
    }
  }
  return null;
}

async function purgeAbandonedBindingsForTable(
  tableNumber: string
): Promise<void> {
  for (const binding of await getQrAccessBindingsForTable(tableNumber)) {
    const abandoned = await isQrBindingAbandonedForDevice(
      binding.last_active_at,
      binding.device_id,
      binding.table_number
    );
    if (abandoned) {
      await releaseQrAccessBinding(binding.access_jti, binding.device_id);
    }
  }
}

/** When multiple QR tokens created duplicate rows, keep the first active scan. */
async function collapseDuplicateActiveTableBindings(): Promise<void> {
  const rows = await query<RowDataPacket[]>(
    `SELECT access_jti, table_number, device_id, bound_at, last_active_at
     FROM qr_access_bindings`
  );

  const byTable = new Map<string, QrAccessBindingRow[]>();
  for (const row of rows) {
    const mapped = mapRow(row);
    const abandoned = await isQrBindingAbandonedForDevice(
      mapped.last_active_at,
      mapped.device_id,
      mapped.table_number
    );
    if (abandoned) continue;
    const list = byTable.get(mapped.table_number) ?? [];
    list.push(mapped);
    byTable.set(mapped.table_number, list);
  }

  for (const bindings of byTable.values()) {
    if (bindings.length <= 1) continue;

    bindings.sort(
      (a, b) =>
        new Date(a.bound_at).getTime() - new Date(b.bound_at).getTime()
    );
    for (const duplicate of bindings.slice(1)) {
      await releaseQrAccessBinding(duplicate.access_jti, duplicate.device_id);
    }
  }
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
 * First device to activate a table QR wins — one active session per table.
 * Same device may re-activate (cookie refresh or a newly printed token);
 * other devices are denied until the table session is abandoned or released.
 */
export async function bindQrAccessToDevice(
  accessJti: string,
  tableNumber: string,
  deviceId: string
): Promise<QrAccessBindResult> {
  if (await isQrAccessRevokedForDevice(accessJti, deviceId)) {
    return "revoked";
  }

  await purgeAbandonedBindingsForTable(tableNumber);
  await collapseDuplicateActiveTableBindings();

  const existing = await getQrAccessBinding(accessJti);
  if (existing) {
    if (existing.device_id === deviceId) {
      await touchQrAccessBinding(accessJti, deviceId);
      return "renewed";
    }

    // Another device holds this exact QR token — deny until abandoned or released.
    if (
      !(await isQrBindingAbandonedForDevice(
        existing.last_active_at,
        existing.device_id,
        existing.table_number
      ))
    ) {
      return "denied";
    }

    await releaseQrAccessBinding(existing.access_jti, existing.device_id);
  }

  const activeForTable = await getActiveQrAccessBindingForTable(tableNumber);
  if (activeForTable) {
    if (activeForTable.device_id === deviceId) {
      // Same phone, newer printed QR — drop the older token row for this table.
      if (activeForTable.access_jti !== accessJti) {
        await releaseQrAccessBinding(
          activeForTable.access_jti,
          activeForTable.device_id
        );
      }
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
    if (
      await isQrBindingAbandonedForDevice(
        raced.last_active_at,
        raced.device_id,
        raced.table_number
      )
    ) {
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

  if (
    await isQrBindingAbandonedForDevice(
      binding.last_active_at,
      binding.device_id,
      binding.table_number
    )
  ) {
    await releaseQrAccessBinding(accessJti, deviceId);
    return false;
  }

  const activeForTable = await getActiveQrAccessBindingForTable(
    binding.table_number
  );
  if (
    activeForTable &&
    (activeForTable.access_jti !== accessJti ||
      activeForTable.device_id !== deviceId)
  ) {
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

/**
 * Remove bindings that meet automatic termination rules (2 min idle, ~45s
 * without heartbeat, etc.) so they no longer appear in Active QR Sessions.
 */
export async function purgeAbandonedQrAccessBindings(): Promise<number> {
  const rows = await query<RowDataPacket[]>(
    `SELECT access_jti, table_number, device_id, bound_at, last_active_at
     FROM qr_access_bindings`
  );

  let purged = 0;
  for (const row of rows) {
    const mapped = mapRow(row);
    const abandoned = await isQrBindingAbandonedForDevice(
      mapped.last_active_at,
      mapped.device_id,
      mapped.table_number
    );
    if (!abandoned) continue;

    await query(`DELETE FROM qr_access_bindings WHERE access_jti = ?`, [
      mapped.access_jti,
    ]);
    purged++;
  }

  await collapseDuplicateActiveTableBindings();
  return purged;
}

/** All device bindings currently holding a table QR (newest activity first). */
export async function listQrAccessBindings(): Promise<QrAccessBindingRow[]> {
  await purgeAbandonedQrAccessBindings();

  const rows = await query<RowDataPacket[]>(
    `SELECT access_jti, table_number, device_id, bound_at, last_active_at
     FROM qr_access_bindings
     ORDER BY last_active_at DESC`
  );
  return rows.map((row) => mapRow(row));
}

/**
 * Admin override — delete binding immediately without device_id check.
 * Also clears any duplicate active bindings for the same table (legacy tokens).
 */
export async function adminForceReleaseQrAccessBinding(
  accessJti: string
): Promise<boolean> {
  const existing = await getQrAccessBinding(accessJti);
  if (!existing) return false;

  const tableNumber = existing.table_number;
  const bindings = await getQrAccessBindingsForTable(tableNumber);

  for (const binding of bindings) {
    await revokeQrAccessForDevice(binding.access_jti, binding.device_id);
    await query(`DELETE FROM qr_access_bindings WHERE access_jti = ?`, [
      binding.access_jti,
    ]);
  }

  return true;
}
