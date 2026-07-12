"use client";

import { hero, packages } from "@/lib/content";
import { usePopup } from "./PopupProvider";

export default function Hero() {
  const { openPopup } = usePopup();
  const mainPackage = packages[0];

  return (
    <section id="top" className="relative overflow-hidden bg-hero-gradient px-4 py-16 text-white sm:px-6 sm:py-24">
      {/* Trang trí nền: khối glow mờ + lưới chấm nhẹ, thuần CSS/SVG — không cần ảnh ngoài */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/20 blur-[100px]" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-navy-light/40 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent-gold/10 blur-[100px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="hero-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="mb-5 inline-block rounded-full bg-accent-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-gold sm:text-sm">
            {hero.badge}
          </span>
          <h1 className="mb-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{hero.h1}</h1>
          <p className="mb-4 max-w-xl text-base text-white/85 sm:text-lg">{hero.sub}</p>
          <p className="mb-8 max-w-xl border-l-4 border-accent-gold pl-4 text-sm italic text-white/80 sm:text-base">
            {hero.positioning}
          </p>

          <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-accent-gold sm:text-3xl">{stat.value}</div>
                <div className="text-xs text-white/80 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={openPopup}
              className="rounded-lg bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:brightness-110 sm:text-base"
            >
              <span aria-hidden="true">🚀</span> Đăng ký giữ suất ngay
            </button>
            <a href="#program" className="text-sm font-semibold text-white/85 underline underline-offset-4 sm:text-base">
              Xem chương trình
            </a>
          </div>
        </div>

        {mainPackage && (
          <div className="rounded-2xl bg-white p-6 text-gray-800 shadow-2xl sm:p-7">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-navy-mid">
              Chọn hình thức học
            </h3>
            <p className="mb-5 text-xs text-text-muted">Đăng ký ngay hôm nay</p>

            <div className="rounded-xl border-2 border-accent-gold bg-bg-light p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold text-navy-mid">{mainPackage.name}</span>
                <span className="rounded-full bg-accent-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-mid">
                  {mainPackage.seats}
                </span>
              </div>
              <p className="mb-3 text-xs text-text-muted">{mainPackage.description}</p>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-xl font-black text-navy-mid">{mainPackage.price}</span>
                {mainPackage.oldPrice && (
                  <span className="text-xs text-gray-400 line-through">{mainPackage.oldPrice}</span>
                )}
              </div>
              <button
                type="button"
                onClick={openPopup}
                className="mt-3 w-full rounded-lg bg-accent-red px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                Đăng ký ngay →
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-text-muted">
              <span aria-hidden="true">🔒</span> Hoàn tiền 100% sau buổi 2 nếu thấy không đáng
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
