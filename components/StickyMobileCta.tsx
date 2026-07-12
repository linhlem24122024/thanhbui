"use client";

import { usePopup } from "./PopupProvider";

export default function StickyMobileCta() {
  const { openPopup } = usePopup();

  return (
    <button
      type="button"
      onClick={openPopup}
      className="fixed inset-x-0 bottom-0 z-40 bg-accent-red py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-[0_-6px_20px_rgba(0,0,0,0.25)] lg:hidden"
    >
      Đăng ký giữ suất Khóa 1 ngay
    </button>
  );
}
