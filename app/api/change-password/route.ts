import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentMember } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const ChangePasswordSchema = z
  .object({
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu mới phải từ 8 ký tự và trùng khớp ở cả 2 ô.",
  });

export async function POST(req: NextRequest) {
  try {
    const member = await getCurrentMember();
    if (!member) {
      return NextResponse.json({ error: "Vui lòng đăng nhập lại." }, { status: 401 });
    }

    const ipLimit = await rateLimit("change-password", getClientIp(req.headers), 10, 60);
    if (!ipLimit.success) {
      return NextResponse.json({ error: "Quá nhiều lần thử. Vui lòng thử lại sau." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = ChangePasswordSchema.safeParse(body ?? {});

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải từ 8 ký tự và trùng khớp ở cả 2 ô." },
        { status: 400 }
      );
    }

    const { newPassword } = parsed.data;

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const db = supabaseAdmin();
    const { error } = await db
      .from("members")
      .update({
        password_hash: passwordHash,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) {
      console.error("[api/change-password] Lỗi cập nhật mật khẩu", error);
      return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/change-password] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }
}
