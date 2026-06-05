import { validateTableQrAccess } from "@/lib/table-qr-access";
import { normalizeTableNumber } from "@/lib/table";
import type { TableQrAccessPayload } from "@/lib/table-qr-access";

export async function resolveQrActivateCredentials(input: {
  tableNumber?: string | null;
  accessToken?: string | null;
}): Promise<{ table: string; access: TableQrAccessPayload; accessToken: string } | null> {
  const accessToken = input.accessToken?.trim() ?? "";
  const table = normalizeTableNumber(input.tableNumber);

  if (!table || !accessToken) return null;

  const access = await validateTableQrAccess(table, accessToken);
  if (!access) return null;

  return { table, access, accessToken };
}
