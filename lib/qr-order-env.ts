import type { NextRequest } from "next/server";

export function isLocalhostHost(host: string | null | undefined): boolean {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Live / deployed hosts — require a table QR scan before ordering. */
export function isQrOrderEnforcedOnRequest(request: NextRequest): boolean {
  return !isLocalhostHost(request.headers.get("host"));
}
