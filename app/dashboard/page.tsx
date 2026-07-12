import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { packages } from "@/lib/content";
import { PAID_MATERIALS, FREE_CONTENT } from "@/lib/materials";
import DashboardNav from "./DashboardNav";

const TIER_LABEL: Record<string, string> = { free: "Free", paid: "Thành viên chính thức" };

export default async function DashboardPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (member.must_change_password) redirect("/change-password");

  const interestedPackage = packages.find((p) => p.id === member.interested_package_id);
  const isPaid = member.tier === "paid";

  return (
    <div className="min-h-screen bg-bg-light">
      <DashboardNav />

      <main id="overview" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-navy-mid">Xin chào, {member.name}</h1>
              <p className="text-sm text-text-muted">
                {member.phone} · {member.email}
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                isPaid ? "bg-accent-gold/20 text-navy-mid" : "bg-gray-200 text-gray-600"
              }`}
            >
              {TIER_LABEL[member.tier]}
            </span>
          </div>

          {interestedPackage && (
            <p className="text-sm text-gray-700">
              Gói quan tâm lúc đăng ký: <strong>{interestedPackage.name}</strong> ({interestedPackage.price})
            </p>
          )}
        </div>

        <section id="program" className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-extrabold text-navy-mid">Chương trình học của tôi</h2>

          <div className="mb-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-text-muted">Nội dung Free</p>
            <ul className="space-y-2">
              {FREE_CONTENT.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent-gold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-text-muted">
              Nội dung Thành viên chính thức
            </p>
            {isPaid ? (
              <ul className="space-y-2">
                {PAID_MATERIALS.map((item) => (
                  <li key={item.title} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-accent-gold">✓</span>
                    <a href={item.url} className="hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-bg-light p-5 text-center">
                <p className="mb-3 text-sm text-text-muted">
                  🔒 Nội dung này chỉ dành cho Thành viên chính thức — video buổi học, bộ 12 template, tài liệu khóa.
                </p>
                <Link
                  href="/upgrade"
                  className="inline-block rounded-lg bg-accent-red px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                >
                  Nâng cấp ngay
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
