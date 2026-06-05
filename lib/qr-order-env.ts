import type { NextRequest } from "next/server";

/** True only for same-machine dev hosts. LAN IPs (e.g. 192.168.x.x) are NOT localhost. */
export function isLocalhostHost(host: string | null | undefined): boolean {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Require a table QR scan before ordering.
 * Enforced on LAN IPs and production; bypassed only on localhost / 127.0.0.1.
 */
export function isQrOrderEnforcedOnRequest(request: NextRequest): boolean {
  return !isLocalhostHost(request.headers.get("host"));
}
