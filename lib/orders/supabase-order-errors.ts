/** PostgREST / Supabase errors are plain objects, not always `instanceof Error`. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return "Internal Server Error";
}

export function isMissingColumnError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "42703" || code === "PGRST204") return true;
  }
  const message = getErrorMessage(error).toLowerCase();
  if (message.includes("does not exist") && message.includes("column")) {
    return true;
  }
  return (
    message.includes("could not find") &&
    message.includes("column") &&
    (message.includes("schema cache") || message.includes("orders"))
  );
}

export function missingColumnHint(error: unknown): string | null {
  if (!isMissingColumnError(error)) return null;
  const message = getErrorMessage(error).toLowerCase();
  if (message.includes("service_type")) {
    return "Run supabase/patch-service-type.sql in the Supabase SQL Editor, then refresh.";
  }
  if (message.includes("order_status") || message.includes("table_number")) {
    return "Run supabase/patch-table-and-order-status.sql in the Supabase SQL Editor, then refresh.";
  }
  return "Database is missing new order columns. Run the supabase patch SQL files in the Supabase SQL Editor, wait ~30 seconds, then try again.";
}
