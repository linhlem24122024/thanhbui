import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/session";
import { PAID_MATERIALS } from "@/lib/materials";

// Server verify quyền TRƯỚC khi trả dữ liệu (RULE-04).
// Không có nội dung nào của mục này nằm sẵn trong HTML/DOM khi chưa xác thực (RULE-06).

export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  }
  if (member.tier !== "paid") {
    return NextResponse.json({ error: "Bạn chưa có quyền xem nội dung này." }, { status: 403 });
  }
  return NextResponse.json({ materials: PAID_MATERIALS });
}
