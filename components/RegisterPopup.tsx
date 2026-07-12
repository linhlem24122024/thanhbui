"use client";

import { useEffect, useRef, useState } from "react";
import { packages, site } from "@/lib/content";
import { isValidEmail, isValidVnPhone } from "@/lib/validation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Step = "form" | "thanks";

export default function RegisterPopup({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loginId, setLoginId] = useState("");
  const [defaultPassword, setDefaultPassword] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Đưa focus vào trường đầu tiên khi popup mở, hỗ trợ điều hướng bàn phím/trình đọc màn hình.
    nameInputRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Vui lòng nhập họ tên.";
    if (!isValidVnPhone(phone)) next.phone = "Số điện thoại chưa đúng định dạng.";
    if (!isValidEmail(email)) next.email = "Email chưa đúng định dạng.";
    if (!packageId) next.packageId = "Vui lòng chọn gói quan tâm.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, packageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Đã xảy ra lỗi, vui lòng thử lại.");
        return;
      }
      setLoginId(phone);
      setDefaultPassword(data.isNew ? (data.defaultPassword ?? null) : null);
      setIsExistingAccount(!data.isNew);
      setStep("thanks");
    } catch {
      setSubmitError("Không kết nối được máy chủ, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const titleId = step === "form" ? "register-popup-title" : "register-popup-thanks-title";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <span aria-hidden="true">×</span>
        </button>

        {step === "form" ? (
          <>
            <h3 id={titleId} className="mb-1 text-lg font-extrabold text-navy-mid sm:text-xl">
              Đăng ký giữ suất Khóa 1 — chỉ 25 suất
            </h3>
            <p className="mb-5 text-sm text-text-muted">
              Để lại thông tin, tôi trả lời và giữ suất cho bạn trong 24h.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="register-name" className="mb-1 block text-sm font-semibold text-gray-700">
                  Họ tên
                </label>
                <input
                  id="register-name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
                  placeholder="Nguyễn Văn A"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "register-name-error" : undefined}
                />
                {errors.name && (
                  <p id="register-name-error" className="mt-1 text-xs text-accent-red">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-phone" className="mb-1 block text-sm font-semibold text-gray-700">
                  Số điện thoại
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
                  placeholder="0912345678"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "register-phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="register-phone-error" className="mt-1 text-xs text-accent-red">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className="mb-1 block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
                  placeholder="ban@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "register-email-error" : undefined}
                />
                {errors.email && (
                  <p id="register-email-error" className="mt-1 text-xs text-accent-red">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-package" className="mb-1 block text-sm font-semibold text-gray-700">
                  Gói quan tâm
                </label>
                <select
                  id="register-package"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
                  aria-invalid={!!errors.packageId}
                  aria-describedby={errors.packageId ? "register-package-error" : undefined}
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price}
                    </option>
                  ))}
                </select>
                {errors.packageId && (
                  <p id="register-package-error" className="mt-1 text-xs text-accent-red">
                    {errors.packageId}
                  </p>
                )}
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-accent-red">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent-red px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? "Đang gửi..." : "Đăng ký"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-3 text-4xl" aria-hidden="true">
              🎉
            </div>
            <h3 id={titleId} className="mb-2 text-lg font-extrabold text-navy-mid">
              Cảm ơn bạn đã đăng ký!
            </h3>
            {isExistingAccount ? (
              <p className="mb-5 rounded-lg bg-bg-light px-3 py-2 text-sm text-gray-700">
                Số điện thoại <strong>{loginId}</strong> đã có tài khoản sẵn — vui lòng đăng nhập lại bằng mật khẩu bạn đã đặt trước đó.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-700">
                  Tài khoản đăng nhập: <strong>{loginId}</strong>
                  <br />
                  Mật khẩu mặc định: <strong>{defaultPassword}</strong>
                </p>
                <p className="mb-5 rounded-lg bg-bg-light px-3 py-2 text-xs text-text-muted">
                  Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.
                </p>
              </>
            )}
            <a
              href="/login"
              className="mb-3 block w-full rounded-lg bg-accent-red px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Đăng nhập ngay
            </a>
            <a
              href={site.zaloLink}
              target="_blank"
              rel="noopener"
              className="mb-3 block w-full rounded-lg border border-navy-mid px-4 py-3 text-sm font-bold text-navy-mid transition hover:bg-bg-light"
              aria-label={`Liên hệ Zalo ${site.zaloNumber} (mở tab mới)`}
            >
              <span aria-hidden="true">💬</span> Liên hệ Zalo: {site.zaloNumber}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-text-muted underline underline-offset-2"
            >
              Để sau, đóng popup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
