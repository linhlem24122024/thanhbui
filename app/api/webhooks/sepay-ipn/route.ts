import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendDepositReportedEmail } from "@/lib/email";
import { packages } from "@/lib/content";

// IPN từ SePay khi khách thanh toán xong (cấu hình URL này trong SePay Dashboard > Merchant > IPN).
// Tài liệu SePay không mô tả cơ chế ký (signature) cho IPN, nên KHÔNG coi đây là xác nhận cuối
// cùng — chỉ dùng để tự động chuyển 'pending' → 'reported' + báo admin qua email. Admin vẫn
// phải tự đối chiếu sao kê ngân hàng và tick "Đã cọc" (RULE-04: không tin dữ liệu chưa xác thực).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const orderInvoiceNumber: unknown = body?.order?.order_invoice_number;
    const notificationType: unknown = body?.notification_type;
    const orderStatus: unknown = body?.order?.order_status;

    if (typeof orderInvoiceNumber !== "string" || !orderInvoiceNumber) {
      console.warn("[sepay-ipn] Thiếu order_invoice_number, bỏ qua", body);
      return NextResponse.json({ ok: true });
    }

    const isPaid = notificationType === "ORDER_PAID" || orderStatus === "CAPTURED";
    if (!isPaid) {
      console.log("[sepay-ipn] Nhận IPN nhưng chưa phải trạng thái thanh toán thành công", {
        notificationType,
        orderStatus,
      });
      return NextResponse.json({ ok: true });
    }

    const db = supabaseAdmin();
    const { data: deposit, error: findError } = await db
      .from("upgrade_deposits")
      .select("id, member_id, package_id, deposit_amount, remaining_amount, status, members(name, phone)")
      .eq("payment_code", orderInvoiceNumber)
      .maybeSingle();

    if (findError) {
      console.error("[sepay-ipn] Lỗi tra cứu", findError);
      return NextResponse.json({ error: "Đã xảy ra lỗi." }, { status: 500 });
    }

    if (!deposit) {
      console.warn("[sepay-ipn] Không tìm thấy deposit khớp payment_code", orderInvoiceNumber);
      return NextResponse.json({ ok: true });
    }

    if (deposit.status === "pending") {
      const { error: updateError } = await db
        .from("upgrade_deposits")
        .update({ status: "reported", reported_at: new Date().toISOString() })
        .eq("id", deposit.id);

      if (updateError) {
        console.error("[sepay-ipn] Lỗi cập nhật", updateError);
        return NextResponse.json({ error: "Đã xảy ra lỗi." }, { status: 500 });
      }

      const memberInfo = Array.isArray(deposit.members) ? deposit.members[0] : deposit.members;
      const pkg = packages.find((p) => p.id === deposit.package_id);
      await sendDepositReportedEmail({
        name: memberInfo?.name ?? "—",
        phone: memberInfo?.phone ?? "—",
        packageName: pkg?.name ?? deposit.package_id,
        depositAmount: deposit.deposit_amount,
        remainingAmount: deposit.remaining_amount,
        paymentCode: orderInvoiceNumber,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sepay-ipn] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi." }, { status: 500 });
  }
}
