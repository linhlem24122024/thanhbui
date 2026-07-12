"use client";

import { packages } from "@/lib/content";
import { usePopup } from "./PopupProvider";

export default function Pricing() {
  const { openPopup } = usePopup();

  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Học phí & suất học</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">Chọn hình thức phù hợp với bạn</h2>
        </div>

        <div
          className={`mx-auto grid gap-8 ${
            packages.length > 1
              ? "max-w-2xl sm:grid-cols-2 lg:max-w-none lg:grid-cols-3"
              : "max-w-xl"
          }`}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative h-full rounded-2xl border-2 bg-white p-7 shadow-sm ${
                pkg.highlight ? "border-accent-gold shadow-xl lg:scale-105" : "border-gray-100"
              }`}
            >
              {pkg.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-red px-4 py-1 text-xs font-bold text-white">
                  <span aria-hidden="true">🔥</span> Phổ biến nhất
                </span>
              )}
              <h3 className="mb-1 text-lg font-extrabold text-navy-mid">{pkg.name}</h3>
              <p className="mb-4 text-sm text-text-muted">{pkg.description}</p>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-navy-mid">{pkg.price}</span>
                {pkg.oldPrice && <span className="text-sm text-gray-400 line-through">{pkg.oldPrice}</span>}
              </div>
              <p className="mb-6 text-xs text-text-muted">{pkg.priceNote}</p>

              <ul className="mb-6 space-y-3">
                {pkg.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 text-accent-gold" aria-hidden="true">
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={openPopup}
                className="w-full rounded-lg bg-accent-red px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                Đăng ký ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
