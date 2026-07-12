import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";

function csvEscape(value: string): string {
  // Chặn CSV/formula injection: nếu ô bắt đầu bằng =, +, -, @ mà mở trong Excel
  // sẽ bị hiểu là công thức — thêm nháy đơn để ép Excel đọc như text thuần.
  let safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safe)) {
    safe = `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("registrations")
    .select("id, name, phone, email, package_id, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/admin/registrations] Lỗi truy vấn", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }

  const format = req.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const header = "Họ tên,Số điện thoại,Email,Gói quan tâm,Trạng thái,Thời gian đăng ký";
    const rows = (data ?? []).map((r) =>
      [r.name, r.phone, r.email, r.package_id, r.status, r.created_at].map((v) => csvEscape(String(v))).join(",")
    );
    const csv = "﻿" + [header, ...rows].join("\n"); // BOM để Excel đọc đúng tiếng Việt

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dang-ky-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ registrations: data ?? [] });
}
