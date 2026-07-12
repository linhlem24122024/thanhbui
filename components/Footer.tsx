import { site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="bg-navy-footer px-4 py-12 text-white/65 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-base font-extrabold text-white">{site.brand}</p>
          <p className="text-sm">Chương trình huấn luyện kỹ năng tìm khách cho người làm nghề tài chính.</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Sản phẩm/dịch vụ</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#pricing">Khóa 1 — 6 tuần</a>
            </li>
            <li>
              <a href="#program">Nội dung chương trình</a>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Liên hệ</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={site.zaloLink} target="_blank" rel="noopener" aria-label={`Chat Zalo ${site.zaloNumber} (mở tab mới)`}>
                <span aria-hidden="true">💬</span> Zalo: {site.zaloNumber}
              </a>
            </li>
            <li>
              <a href="/login">
                <span aria-hidden="true">🔐</span> Đăng nhập học viên
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs">
        <p>© {new Date().getFullYear()} {site.brand}. Không cam kết thu nhập · Minh bạch hoa hồng theo quy định quảng cáo.</p>
      </div>
    </footer>
  );
}
