import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";
import { isValidVnPhone, normalizePhone } from "@/lib/validation";

const UpgradeSchema = z.object({
  phone: z.string().refine(isValidVnPhone, { message: "Số điện thoại không hợp lệ." }),
});

// Admin xác nhận thủ công sau khi kiểm tra chuyển khoản (project-brief.md B.6) —
// nâng hạng thành viên từ 'free' lên 'paid'.
export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpgradeSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });
  }

  const { phone } = parsed.data;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("members")
    .update({ tier: "paid", updated_at: new Date().toISOString() })
    .eq("phone", normalizePhone(phone))
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[api/admin/upgrade] Lỗi cập nhật hạng", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Không tìm thấy thành viên với số điện thoại này." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
