import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("members")
    .select("id, name, phone, email, tier, interested_package_id, must_change_password, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/admin/members] Lỗi truy vấn", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }

  return NextResponse.json({ members: data ?? [] });
}
