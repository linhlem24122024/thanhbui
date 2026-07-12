import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";

const ConfirmSchema = z.object({
  depositId: z.string().uuid(),
});

// Admin tick "Đã cọc" sau khi tự đối chiếu sao kê ngân hàng — không tự động qua Sepay webhook.
export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ConfirmSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("upgrade_deposits")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", parsed.data.depositId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[api/admin/deposits/confirm] Lỗi cập nhật", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu cọc." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
