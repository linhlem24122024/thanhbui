import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-black text-navy-mid mb-2">404</h1>
          <p className="text-2xl font-bold text-navy-dark mb-4">Trang không tìm thấy</p>
          <p className="text-text-muted mb-8">
            Xin lỗi, trang bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-navy-mid to-navy-light text-white font-bold rounded-lg hover:shadow-lg transition-shadow duration-300"
        >
          Quay về trang chủ
        </Link>

        <div className="mt-8 pt-8 border-t border-navy-light/20">
          <p className="text-sm text-text-muted mb-4">Cần hỗ trợ?</p>
          <a
            href="https://zalo.me/0964938167"
            target="_blank"
            rel="noopener noreferrer"
            className="text-navy-mid font-semibold hover:text-accent-red transition-colors"
          >
            Liên hệ qua Zalo
          </a>
        </div>
      </div>
    </div>
  );
}
