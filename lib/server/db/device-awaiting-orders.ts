import type { RowDataPacket } from "mysql2";
import { query } from "./db";

/** Checked-out orders still waiting on kitchen/admin — suspend QR inactivity timeout. */
export async function deviceHasAwaitingOrders(
  deviceId: string,
  tableNumber: string
): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT 1 FROM orders
     WHERE client_device_id = ?
       AND table_number = ?
       AND order_status NOT IN ('completed', 'cancelled')
       AND payment_status != 'Failed'
     LIMIT 1`,
    [deviceId, tableNumber]
  );
  return rows.length > 0;
}
