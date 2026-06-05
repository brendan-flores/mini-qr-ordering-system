import { randomBytes } from "crypto";
import type { RowDataPacket } from "mysql2";
import { query } from "./db";

export type QrScanCodeRow = {
  scan_code: string;
  table_number: string;
  access_jti: string;
  access_token: string;
};

function mapRow(row: RowDataPacket): QrScanCodeRow {
  return {
    scan_code: String(row.scan_code),
    table_number: String(row.table_number),
    access_jti: String(row.access_jti),
    access_token: String(row.access_token),
  };
}

function generateScanCode(): string {
  return randomBytes(9).toString("base64url");
}

export async function createQrScanCode(
  tableNumber: string,
  accessJti: string,
  accessToken: string
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const scanCode = generateScanCode();
    try {
      await query(
        `INSERT INTO qr_scan_codes (scan_code, table_number, access_jti, access_token)
         VALUES (?, ?, ?, ?)`,
        [scanCode, tableNumber, accessJti, accessToken]
      );
      return scanCode;
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code: string }).code)
          : "";
      if (code === "ER_DUP_ENTRY") continue;
      throw e;
    }
  }
  throw new Error("Could not generate a unique QR scan code.");
}

export async function resolveQrScanCode(
  scanCode: string | null | undefined
): Promise<QrScanCodeRow | null> {
  const code = scanCode?.trim();
  if (!code || !/^[A-Za-z0-9_-]{10,16}$/.test(code)) return null;

  const rows = await query<RowDataPacket[]>(
    `SELECT scan_code, table_number, access_jti, access_token
     FROM qr_scan_codes
     WHERE scan_code = ?
     LIMIT 1`,
    [code]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}
