"use client";

import { useState } from "react";
import { site } from "@/lib/content";
import { usePopup } from "./PopupProvider";

const navLinks = [
  { href: "#why-choose", label: "Tại sao chọn" },
  { href: "#program", label: "Chương trình" },
  { href: "#pricing", label: "Hình thức" },
  { href: "#instructor", label: "Giảng viên" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openPopup } = usePopup();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="text-lg font-extrabold tracking-tight text-navy-mid sm:text-xl">
          {site.brand}
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-navy-mid"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={site.zaloLink}
            target="_blank"
            rel="noopener"
            className="text-sm font-semibold text-navy-mid"
            aria-label="Chat Zalo (mở tab mới)"
          >
            <span aria-hidden="true">💬</span> Chat Zalo
          </a>
          <a href="/login" className="text-sm font-semibold text-gray-600 hover:text-navy-mid">
            Đăng nhập
          </a>
          <button
            type="button"
            onClick={openPopup}
            className="rounded-lg bg-accent-red px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            Đăng ký ngay
          </button>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`block h-0.5 w-6 bg-navy-mid transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-6 bg-navy-mid transition ${menuOpen ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-6 bg-navy-mid transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Menu điều hướng chính">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                {link.label}
              </a>
            ))}
            <a
              href={site.zaloLink}
              target="_blank"
              rel="noopener"
              className="text-sm font-semibold text-navy-mid"
              aria-label="Chat Zalo (mở tab mới)"
            >
              <span aria-hidden="true">💬</span> Chat Zalo
            </a>
            <a href="/login" className="text-sm font-semibold text-gray-700">
              Đăng nhập
            </a>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openPopup();
              }}
              className="rounded-lg bg-accent-red px-5 py-2.5 text-center text-sm font-bold text-white"
            >
              Đăng ký ngay
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
