"use client";

import { packages, site } from "@/lib/content";
import { usePopup } from "./PopupProvider";

export default function FinalCta() {
  const { openPopup } = usePopup();

  return (
    <section className="bg-dark-gradient px-4 py-16 text-center text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-black sm:text-3xl">
          Danh bạ thì có hạn.
          <br />
          Phễu thì không.
        </h2>
        <p className="mb-8 text-white/80">
          Giữ suất bằng cách đăng ký ngay — tôi trả lời từng người trong 24h.
        </p>

        <div className="mx-auto mb-8 grid max-w-md gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-left backdrop-blur"
            >
              <div>
                <p className="text-sm font-bold">{pkg.name}</p>
                <p className="text-xs text-white/70">{pkg.price}</p>
              </div>
              <button
                type="button"
                onClick={openPopup}
                className="rounded-lg bg-accent-red px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
              >
                Đăng ký
              </button>
            </div>
          ))}
        </div>

        <p className="text-sm text-white/70">
          Có thắc mắc? Nhắn tin Zalo ngay:{" "}
          <a
            href={site.zaloLink}
            target="_blank"
            rel="noopener"
            className="font-semibold text-accent-gold"
            aria-label={`Nhắn tin Zalo ${site.zaloNumber} (mở tab mới)`}
          >
            {site.zaloNumber}
          </a>
        </p>
      </div>
    </section>
  );
}
