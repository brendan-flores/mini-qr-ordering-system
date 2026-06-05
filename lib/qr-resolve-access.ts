import { resolveQrScanCode } from "@/lib/mysql/qr-scan-codes";
import { validateTableQrAccess } from "@/lib/table-qr-access";
import { normalizeTableNumber } from "@/lib/table";
import type { TableQrAccessPayload } from "@/lib/table-qr-access";

export async function resolveQrActivateCredentials(input: {
  tableNumber?: string | null;
  accessToken?: string | null;
  scanCode?: string | null;
}): Promise<{ table: string; access: TableQrAccessPayload; accessToken: string } | null> {
  let accessToken = input.accessToken?.trim() ?? "";
  let table = normalizeTableNumber(input.tableNumber);

  const scanCode = input.scanCode?.trim();
  if (scanCode) {
    const row = await resolveQrScanCode(scanCode);
    if (!row) return null;
    accessToken = row.access_token;
    if (!table) table = normalizeTableNumber(row.table_number);
    else if (table !== row.table_number) return null;
  }

  if (!table || !accessToken) return null;

  const access = await validateTableQrAccess(table, accessToken);
  if (!access) return null;

  return { table, access, accessToken };
}
