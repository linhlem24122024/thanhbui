import "server-only";
import { Resend } from "resend";

async function sendAdminEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.ADMIN_NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  // Email thông báo là tính năng "nice to have" — nếu chưa cấu hình thì bỏ qua,
  // không được làm hỏng luồng chính (đăng ký/cọc vẫn phải thành công dù gửi email lỗi).
  if (!apiKey || !notifyTo || !from) {
    console.warn("[email] Thiếu RESEND_API_KEY/ADMIN_NOTIFY_EMAIL/RESEND_FROM_EMAIL — bỏ qua gửi thông báo.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    // Resend SDK trả về { data, error } thay vì throw khi API báo lỗi
    // (ví dụ domain chưa verify, vượt giới hạn sandbox) — PHẢI check `error`
    // thủ công, nếu không sẽ không bao giờ biết email gửi thất bại.
    const { data, error } = await resend.emails.send({ from, to: notifyTo, subject, html });

    if (error) {
      console.error("[email] Resend báo lỗi khi gửi thông báo", error);
    } else {
      console.log("[email] Đã gửi thông báo, id:", data?.id);
    }
  } catch (err) {
    console.error("[email] Gửi thông báo thất bại (exception)", err);
  }
}

export async function sendNewRegistrationEmail(params: {
  name: string;
  phone: string;
  email: string;
  packageId: string;
}) {
  await sendAdminEmail(
    `Đăng ký mới: ${params.name} (${params.phone})`,
    `
      <p>Có người đăng ký mới trên website Phễu Khách Tài Chính:</p>
      <ul>
        <li>Họ tên: ${escapeHtml(params.name)}</li>
        <li>SĐT: ${escapeHtml(params.phone)}</li>
        <li>Email: ${escapeHtml(params.email)}</li>
        <li>Gói quan tâm: ${escapeHtml(params.packageId)}</li>
      </ul>
    `
  );
}

export async function sendDepositReportedEmail(params: {
  name: string;
  phone: string;
  packageName: string;
  depositAmount: number;
  remainingAmount: number;
  paymentCode: string;
}) {
  const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";
  await sendAdminEmail(
    `Khách vừa cọc ${formatVnd(params.depositAmount)} — nâng cấp ${params.packageName}`,
    `
      <p>Có khách báo đã chuyển khoản cọc để nâng cấp gói:</p>
      <ul>
        <li>Học viên: ${escapeHtml(params.name)} (${escapeHtml(params.phone)})</li>
        <li>Nâng cấp lên gói: ${escapeHtml(params.packageName)}</li>
        <li>Số tiền cọc: ${formatVnd(params.depositAmount)}</li>
        <li>Còn phải thanh toán: ${formatVnd(params.remainingAmount)}</li>
        <li>Mã tham chiếu: ${escapeHtml(params.paymentCode)}</li>
      </ul>
      <p>Vào trang admin, kiểm tra sao kê ngân hàng rồi tick "Đã cọc" để xác nhận.</p>
    `
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
