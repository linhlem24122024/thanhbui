"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đổi mật khẩu thất bại.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {forced && (
        <p className="rounded-lg bg-accent-gold/15 px-3 py-2 text-xs font-medium text-navy-mid">
          Đây là lần đăng nhập đầu tiên bằng mật khẩu mặc định — bạn cần đổi mật khẩu trước khi dùng các trang khác.
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Nhập lại mật khẩu mới</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
          minLength={8}
          required
        />
      </div>
      {error && <p className="text-sm text-accent-red">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-accent-red px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
