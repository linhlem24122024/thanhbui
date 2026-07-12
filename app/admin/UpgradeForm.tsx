"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Có lỗi xảy ra.");
        return;
      }
      setMessage("Đã nâng cấp thành công.");
      setPhone("");
      router.refresh();
    } catch {
      setMessage("Không kết nối được máy chủ.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-700">
          SĐT thành viên cần nâng cấp lên &quot;Thành viên chính thức&quot;
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0912345678"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-mid focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-navy-mid px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? "Đang xử lý..." : "Xác nhận nâng cấp"}
      </button>
      {message && <span className="text-sm text-text-muted">{message}</span>}
    </form>
  );
}
