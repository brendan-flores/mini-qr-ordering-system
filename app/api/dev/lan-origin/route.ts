import { NextResponse } from "next/server";
import { getDevLanOrigin } from "@/lib/lan-ip";

/** Dev-only: LAN origin for QR codes when admin is opened on localhost. */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const port = process.env.PORT?.trim() || "3000";
  const origin = getDevLanOrigin(port);
  if (!origin) {
    return NextResponse.json(
      { error: "No LAN IPv4 address found on this machine." },
      { status: 404 }
    );
  }

  return NextResponse.json({ origin });
}
