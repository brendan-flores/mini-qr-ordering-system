import type { NextRequest } from "next/server";

/** QR scan + device binding enforced on localhost, LAN, and production. */
export function isQrOrderEnforcedOnRequest(_request: NextRequest): boolean {
  return true;
}
