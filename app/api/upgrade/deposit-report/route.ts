import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentMember } from "@/lib/session";
import { sendDepositReportedEmail } from "@/lib/email";
import { packages } from "@/lib/content";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const ReportSchema = z.object({
  paymentCode: z.string().min(1),
});

// Được gọi khi khách quay lại success_url sau khi thanh toán xong trên trang Sepay —
// dự phòng cho trường hợp IPN webhook (sepay-ipn/route.ts) bị trễ hoặc không tới.
export async function POST(req: NextRequest) {
  try {
    const member = await getCurrentMember();
    if (!member) {
      return NextResponse.json({ error: "Vui lòng đăng nhập lại." }, { status: 401 });
    }

    const ipLimit = await rateLimit("upgrade-deposit-report", getClientIp(req.headers), 10, 60);
    if (!ipLimit.success) {
      return NextResponse.json({ error: "Quá nhiều lần thử. Vui lòng thử lại sau." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = ReportSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Chỉ cho phép báo trên đúng yêu cầu cọc của chính mình.
    const { data: deposit, error: findError } = await db
      .from("upgrade_deposits")
      .select("id, package_id, deposit_amount, remaining_amount, status, payment_code")
      .eq("payment_code", parsed.data.paymentCode)
      .eq("member_id", member.id)
      .maybeSingle();

    if (findError) {
      console.error("[api/upgrade/deposit-report] Lỗi tra cứu", findError);
      return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
    }

    if (!deposit) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu cọc." }, { status: 404 });
    }

    if (deposit.status === "pending") {
      const { error: updateError } = await db
        .from("upgrade_deposits")
        .update({ status: "reported", reported_at: new Date().toISOString() })
        .eq("id", deposit.id);

      if (updateError) {
        console.error("[api/upgrade/deposit-report] Lỗi cập nhật", updateError);
        return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
      }

      const pkg = packages.find((p) => p.id === deposit.package_id);
      await sendDepositReportedEmail({
        name: member.name,
        phone: member.phone,
        packageName: pkg?.name ?? deposit.package_id,
        depositAmount: deposit.deposit_amount,
        remainingAmount: deposit.remaining_amount,
        paymentCode: deposit.payment_code,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/upgrade/deposit-report] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }
}
