import { validateTableQrAccess } from "@/lib/server/qr/table-qr-access";
import { normalizeTableNumber } from "@/lib/client/session/table";
import type { TableQrAccessPayload } from "@/lib/server/qr/table-qr-access";

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
