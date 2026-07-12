import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("upgrade_deposits")
    .select(
      "id, member_id, package_id, deposit_amount, remaining_amount, payment_code, status, created_at, reported_at, confirmed_at, members(name, phone)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/admin/deposits] Lỗi truy vấn", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }

  return NextResponse.json({ deposits: data ?? [] });
}
