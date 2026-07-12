import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidVnPhone, normalizePhone } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNewRegistrationEmail } from "@/lib/email";
import { generateDefaultPassword } from "@/lib/password";

const RegisterSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().refine(isValidVnPhone, { message: "Số điện thoại không hợp lệ." }),
  email: z.string().trim().email(),
  packageId: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // RULE-08/09 — chống spam/bot đăng ký hàng loạt qua popup.
    const ipLimit = await rateLimit("register:ip", ip, 10, 60);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Quá nhiều lần thử. Vui lòng thử lại sau ít phút." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ và đúng định dạng." }, { status: 400 });
    }

    const { name, phone, email, packageId } = parsed.data;
    const normalizedPhone = normalizePhone(phone);

    // Chặn 1 SĐT đăng ký lặp lại liên tục trong thời gian ngắn.
    const phoneLimit = await rateLimit("register:phone", normalizedPhone, 3, 300);
    if (!phoneLimit.success) {
      return NextResponse.json(
        { error: "Số điện thoại này vừa đăng ký gần đây, vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const db = supabaseAdmin();

    const { data: existing, error: findError } = await db
      .from("members")
      .select("id")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (findError) {
      console.error("[api/register] Lỗi tra cứu thành viên", findError);
      return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
    }

    let defaultPassword: string | null = null;

    if (existing) {
      // Tài khoản đã tồn tại — không tạo trùng, không tiết lộ mật khẩu cũ.
      const { error: updateError } = await db
        .from("members")
        .update({ interested_package_id: packageId, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (updateError) {
        console.error("[api/register] Lỗi cập nhật thành viên", updateError);
        return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
      }
    } else {
      // Mật khẩu mặc định sinh ngẫu nhiên riêng cho từng tài khoản (không dùng hằng số
      // cố định cho mọi người) — xem lib/password.ts. Vẫn hiển thị ngay cho người vừa
      // đăng ký theo đúng UX đã chốt, nhưng không còn là chuỗi đoán được sẵn cho MỌI tài khoản.
      defaultPassword = generateDefaultPassword();
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      const { error: insertError } = await db.from("members").insert({
        name,
        phone: normalizedPhone,
        email,
        password_hash: passwordHash,
        tier: "free",
        interested_package_id: packageId,
        must_change_password: true,
      });

      if (insertError) {
        console.error("[api/register] Lỗi tạo thành viên", insertError);
        return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
      }
    }

    const { error: regError } = await db.from("registrations").insert({
      name,
      phone: normalizedPhone,
      email,
      package_id: packageId,
      status: "new",
    });

    if (regError) {
      console.error("[api/register] Lỗi lưu lượt đăng ký", regError);
      // Không chặn phản hồi thành công vì tài khoản đã tạo/cập nhật xong — chỉ log lại.
    }

    await sendNewRegistrationEmail({ name, phone: normalizedPhone, email, packageId });

    return NextResponse.json({ ok: true, isNew: !existing, defaultPassword });
  } catch (err) {
    console.error("[api/register] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }
}
