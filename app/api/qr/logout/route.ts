import { NextResponse } from "next/server";
import {
  QR_ORDER_SESSION_COOKIE,
  qrOrderSessionCookieOptions,
} from "@/lib/qr-order-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(QR_ORDER_SESSION_COOKIE, "", {
    ...qrOrderSessionCookieOptions(0),
    maxAge: 0,
  });
  return res;
}
