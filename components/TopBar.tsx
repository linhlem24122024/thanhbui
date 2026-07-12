import { site } from "@/lib/content";

export default function TopBar() {
  return (
    <div className="bg-navy-mid px-4 py-2 text-center text-xs text-white sm:text-sm">
      <span aria-hidden="true">🎓</span> Khai giảng Khóa 1 — số lượng có hạn, đăng ký sớm để giữ suất!{" "}
      <a
        href={`tel:${site.zaloNumber}`}
        className="ml-2 font-semibold underline underline-offset-2"
        aria-label={`Gọi hotline Zalo ${site.zaloNumber}`}
      >
        Hotline/Zalo: {site.zaloNumber}
      </a>
    </div>
  );
}
