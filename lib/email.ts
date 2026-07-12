import "server-only";
import { Resend } from "resend";

export async function sendNewRegistrationEmail(params: {
  name: string;
  phone: string;
  email: string;
  packageId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.ADMIN_NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  // Email thông báo là tính năng "nice to have" — nếu chưa cấu hình thì bỏ qua,
  // không được làm hỏng luồng đăng ký chính (đăng ký vẫn phải thành công dù gửi email lỗi).
  if (!apiKey || !notifyTo || !from) {
    console.warn("[email] Thiếu RESEND_API_KEY/ADMIN_NOTIFY_EMAIL/RESEND_FROM_EMAIL — bỏ qua gửi thông báo.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: notifyTo,
      subject: `Đăng ký mới: ${params.name} (${params.phone})`,
      html: `
        <p>Có người đăng ký mới trên website Phễu Khách Tài Chính:</p>
        <ul>
          <li>Họ tên: ${escapeHtml(params.name)}</li>
          <li>SĐT: ${escapeHtml(params.phone)}</li>
          <li>Email: ${escapeHtml(params.email)}</li>
          <li>Gói quan tâm: ${escapeHtml(params.packageId)}</li>
        </ul>
      `,
    });
  } catch (err) {
    console.error("[email] Gửi thông báo đăng ký thất bại", err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
