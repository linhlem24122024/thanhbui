import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signAdminToken, cookieNames } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const GENERIC_ERROR = "Email hoặc mật khẩu không đúng.";

const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ipLimit = await rateLimit("admin-login:ip", getClientIp(req.headers), 5, 60);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Quá nhiều lần thử. Vui lòng thử lại sau 60 giây." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = AdminLoginSchema.safeParse(body ?? {});

    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      console.error("[api/admin/login] Thiếu ADMIN_EMAIL/ADMIN_PASSWORD_HASH trong .env.local");
      return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
    }

    const emailMatches = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
    const passwordMatches = await bcrypt.compare(password, adminPasswordHash);

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const token = await signAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieNames.admin, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (err) {
    console.error("[api/admin/login] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }
}
