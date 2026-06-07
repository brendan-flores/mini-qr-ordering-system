import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readRequestJson } from "@/lib/shared/utils/json";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/lib/server/auth/admin-session";
import { verifyAdminCredentials } from "@/lib/server/auth/admin-users";

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const raw = await readRequestJson(request);
    if (raw === null) {
      return NextResponse.json(
        { error: { message: "Request body is required" } },
        { status: 400 }
      );
    }

    const { username, password } = LoginSchema.parse(raw);
    const user = await verifyAdminCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { error: { message: "Invalid username or password" } },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken({
      userId: user.id,
      username: user.username,
    });

    const res = NextResponse.json({
      data: { username: user.username },
    });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
    return res;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Invalid login payload" } },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
