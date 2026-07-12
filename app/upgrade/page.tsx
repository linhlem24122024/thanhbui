import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { packages } from "@/lib/content";
import DashboardNav from "@/app/dashboard/DashboardNav";
import DepositFlow from "./DepositFlow";

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

            {!isPaid && <DepositFlow packageId={pkg.id} packageName={pkg.name} />}
          </div>
        ))}

        <Link href="/dashboard" className="text-sm font-semibold text-navy-mid underline underline-offset-2">
          ← Quay lại Tổng quan
        </Link>
      </main>
    </div>
  );
}
