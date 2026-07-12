import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentMember } from "@/lib/session";
import { buildCheckoutFields, generatePaymentCode, SEPAY_CHECKOUT_URL } from "@/lib/sepay";
import { packages } from "@/lib/content";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const DEPOSIT_AMOUNT = 100_000;

const DepositSchema = z.object({
  packageId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const member = await getCurrentMember();
    if (!member) {
      return NextResponse.json({ error: "Vui lòng đăng nhập lại." }, { status: 401 });
    }

    const ipLimit = await rateLimit("upgrade-deposit", getClientIp(req.headers), 5, 60);
    if (!ipLimit.success) {
      return NextResponse.json({ error: "Quá nhiều lần thử. Vui lòng thử lại sau." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = DepositSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: "Gói không hợp lệ." }, { status: 400 });
    }

    const pkg = packages.find((p) => p.id === parsed.data.packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Không tìm thấy gói." }, { status: 404 });
    }

    const remainingAmount = Math.max(pkg.priceValue - DEPOSIT_AMOUNT, 0);
    const db = supabaseAdmin();

    // Nếu đã có yêu cầu cọc 'pending' cho cùng gói, tái sử dụng thay vì tạo trùng
    // (order_invoice_number đã gửi sang Sepay phải giữ nguyên, tạo mới sẽ trùng lỗi).
    const { data: existing } = await db
      .from("upgrade_deposits")
      .select("id, payment_code, deposit_amount, remaining_amount, status")
      .eq("member_id", member.id)
      .eq("package_id", pkg.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .maybeSingle();

    const deposit =
      existing ??
      (
        await db
          .from("upgrade_deposits")
          .insert({
            member_id: member.id,
            package_id: pkg.id,
            deposit_amount: DEPOSIT_AMOUNT,
            remaining_amount: remainingAmount,
            payment_code: generatePaymentCode(),
          })
          .select("id, payment_code, deposit_amount, remaining_amount, status")
          .single()
      ).data;

    if (!deposit) {
      console.error("[api/upgrade/deposit] Không tạo được yêu cầu cọc");
      return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
    }

    const origin = req.nextUrl.origin;
    const checkout = buildCheckoutFields({
      amount: deposit.deposit_amount,
      description: `Coc giu cho ${pkg.name}`,
      invoiceNumber: deposit.payment_code,
      customerId: member.id,
      successUrl: `${origin}/upgrade?deposit=success&code=${deposit.payment_code}`,
      errorUrl: `${origin}/upgrade?deposit=error`,
      cancelUrl: `${origin}/upgrade?deposit=cancel`,
    });

    return NextResponse.json({
      ok: true,
      depositId: deposit.id,
      remainingAmount: deposit.remaining_amount,
      checkoutUrl: SEPAY_CHECKOUT_URL,
      checkoutFields: checkout,
    });
  } catch (err) {
    console.error("[api/upgrade/deposit] Lỗi không xác định", err);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại." }, { status: 500 });
  }
}
