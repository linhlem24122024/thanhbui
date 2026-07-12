import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { packages, site } from "@/lib/content";
import DashboardNav from "@/app/dashboard/DashboardNav";

export default async function UpgradePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (member.must_change_password) redirect("/change-password");

  const isPaid = member.tier === "paid";

  return (
    <div className="min-h-screen bg-bg-light">
      <DashboardNav />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-xl font-extrabold text-navy-mid">Nâng cấp gói</h1>
        <p className="mb-8 text-sm text-text-muted">
          {isPaid
            ? "Bạn đã là Thành viên chính thức — cảm ơn bạn đã đồng hành!"
            : "Chuyển khoản theo hướng dẫn bên dưới, sau đó liên hệ Zalo để được xác nhận và mở khóa nội dung."}
        </p>

        {packages.map((pkg) => (
          <div key={pkg.id} className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-extrabold text-navy-mid">{pkg.name}</h2>
              <span className="text-xl font-black text-navy-mid">{pkg.price}</span>
            </div>
            <ul className="mb-6 space-y-2">
              {pkg.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent-gold">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            {!isPaid && (
              <div className="rounded-xl bg-bg-light p-5">
                <p className="mb-3 text-sm font-semibold text-navy-mid">Bước tiếp theo:</p>
                <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                  <li>Chuyển khoản học phí theo thông tin admin gửi qua Zalo.</li>
                  <li>Nhắn Zalo kèm ảnh chụp biên lai để được xác nhận.</li>
                  <li>Admin xác nhận thủ công — tài khoản của bạn sẽ được nâng lên &quot;Thành viên chính thức&quot;.</li>
                </ol>
                <a
                  href={site.zaloLink}
                  target="_blank"
                  rel="noopener"
                  className="inline-block rounded-lg bg-accent-red px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                >
                  💬 Liên hệ Zalo xác nhận: {site.zaloNumber}
                </a>
              </div>
            )}
          </div>
        ))}

        <Link href="/dashboard" className="text-sm font-semibold text-navy-mid underline underline-offset-2">
          ← Quay lại Tổng quan
        </Link>
      </main>
    </div>
  );
}
