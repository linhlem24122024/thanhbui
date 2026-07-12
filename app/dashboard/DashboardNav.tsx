import Link from "next/link";
import { site } from "@/lib/content";
import LogoutButton from "./LogoutButton";

export default function DashboardNav() {
  return (
    <nav className="bg-navy-mid px-4 py-3 text-white sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="font-extrabold">
          {site.brand}
        </Link>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <a href="#overview" className="text-white/80 hover:text-white">
            Tổng quan
          </a>
          <a href="#program" className="text-white/80 hover:text-white">
            Chương trình học của tôi
          </a>
          <Link href="/upgrade" className="text-white/80 hover:text-white">
            Nâng cấp gói
          </Link>
          <Link href="/change-password" className="text-white/80 hover:text-white">
            Đổi mật khẩu
          </Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
