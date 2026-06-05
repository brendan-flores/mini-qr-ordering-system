type QrSessionLogContext = Record<string, unknown>;

/** Structured QR session logs — visible in server logs and dev browser console. */
export function logQrSession(
  event: string,
  context?: QrSessionLogContext
): void {
  const payload = {
    scope: "qr-session",
    event,
    at: new Date().toISOString(),
    ...context,
  };

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "development") {
      console.info("[qr-session]", event, context ?? {});
    }
    return;
  }

  console.info(JSON.stringify(payload));
}
