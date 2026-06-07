import type { RowDataPacket } from "mysql2";
import { query } from "./db";

export type TableQrTokenRow = {
  table_number: string;
  access_jti: string;
  access_token: string;
  created_at: string;
};

function mapRow(row: RowDataPacket): TableQrTokenRow {
  return {
    table_number: String(row.table_number),
    access_jti: String(row.access_jti),
    access_token: String(row.access_token),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function getTableQrToken(
  tableNumber: string
): Promise<TableQrTokenRow | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT table_number, access_jti, access_token, created_at
     FROM table_qr_tokens
     WHERE table_number = ?
     LIMIT 1`,
    [tableNumber]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function saveTableQrToken(input: {
  table_number: string;
  access_jti: string;
  access_token: string;
}): Promise<void> {
  await query(
    `INSERT INTO table_qr_tokens (table_number, access_jti, access_token)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       access_jti = VALUES(access_jti),
       access_token = VALUES(access_token)`,
    [input.table_number, input.access_jti, input.access_token]
  );
}
