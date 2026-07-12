import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidVnPhone, normalizePhone } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { signMemberToken, cookieNames } from "@/lib/auth";

const GENERIC_ERROR = "Số điện thoại hoặc mật khẩu không đúng.";

const LoginSchema = z.object({
  phone: z.string().refine(isValidVnPhone, { message: GENERIC_ERROR }),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // RULE-08/09 — chặn brute-force sau 5 lần sai / phút theo IP.
    const ipLimit = await rateLimit("login:ip", ip, 5, 60);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Quá nhiều lần thử. Vui lòng thử lại sau 60 giây." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const { phone, password } = parsed.data;
    const normalizedPhone = normalizePhone(phone);

    const phoneLimit = await rateLimit("login:phone", normalizedPhone, 5, 60);
    if (!phoneLimit.success) {
      return NextResponse.json(
        { error: "Quá nhiều lần thử. Vui lòng thử lại sau 60 giây." },
        { status: 429 }
      );
    }

    const db = supabaseAdmin();
    const { data: member, error } = await db
      .from("members")
      .select("id, password_hash, must_change_password")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (error) {
      console.error("[api/login] Lỗi tra cứu thành viên", error);
      return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
    }

    if (!member) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const isCorrect = await bcrypt.compare(password, member.password_hash);
    if (!isCorrect) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const token = await signMemberToken(member.id);
    const res = NextResponse.json({ ok: true, mustChangePassword: member.must_change_password });
    res.cookies.set(cookieNames.member, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("[api/login] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }
}
