"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { site } from "@/lib/content";

type Step = "idle" | "loading" | "thanks" | "error" | "cancelled";

export default function DepositFlow({ packageId, packageName }: { packageId: string; packageName: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [formAction, setFormAction] = useState("");
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  // Xử lý khi Sepay redirect khách quay lại trang này sau khi thanh toán.
  useEffect(() => {
    const depositResult = searchParams.get("deposit");
    const code = searchParams.get("code");
    if (!depositResult) return;

    if (depositResult === "success" && code) {
      setStep("loading");
      fetch("/api/upgrade/deposit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: code }),
      })
        .then(() => setStep("thanks"))
        .catch(() => setStep("thanks")); // Dù báo lỗi, khách đã thanh toán xong nên vẫn hiện cảm ơn.
    } else if (depositResult === "cancel") {
      setStep("cancelled");
    } else if (depositResult === "error") {
      setStep("error");
    }

    router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit form thật (POST) sau khi state đã set — không thể tự submit ngay trong onClick
  // vì cần đợi React render xong <form> với action/field mới.
  useEffect(() => {
    if (formAction && formRef.current) {
      formRef.current.submit();
    }
  }, [formAction]);

  async function startDeposit() {
    setError("");
    setStep("loading");
    try {
      const res = await fetch("/api/upgrade/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đã xảy ra lỗi, vui lòng thử lại.");
        setStep("idle");
        return;
      }
      setFormFields(data.checkoutFields);
      setFormAction(data.checkoutUrl);
    } catch {
      setError("Không kết nối được máy chủ, vui lòng thử lại.");
      setStep("idle");
    }
  }

  if (step === "thanks") {
    return (
      <div className="rounded-xl bg-bg-light p-5 text-center">
        <div className="mb-2 text-3xl" aria-hidden="true">
          🎉
        </div>
        <p className="mb-1 text-sm font-bold text-navy-mid">Cảm ơn bạn đã cọc, chúng tôi sẽ liên hệ sớm.</p>
        <p className="text-xs text-text-muted">
          Có thắc mắc gì, nhắn Zalo{" "}
          <a href={site.zaloLink} target="_blank" rel="noopener" className="font-semibold text-navy-mid underline">
            {site.zaloNumber}
          </a>
        </p>
      </div>
    );
  }

  if (step === "cancelled" || step === "error") {
    return (
      <div className="rounded-xl bg-bg-light p-5 text-center">
        <p className="mb-3 text-sm text-gray-700">
          {step === "cancelled" ? "Bạn đã huỷ giao dịch cọc." : "Giao dịch chưa thành công."}
        </p>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="rounded-lg bg-accent-red px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-bg-light p-5">
      <p className="mb-3 text-sm font-semibold text-navy-mid">Bước tiếp theo:</p>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-gray-700">
        <li>Bấm &quot;Cọc giữ chỗ ngay&quot; — hệ thống chuyển sang trang thanh toán quét mã QR cọc 100.000đ.</li>
        <li>Thanh toán xong, tự động quay lại đây.</li>
        <li>Admin xác nhận thủ công — tài khoản của bạn sẽ được nâng lên &quot;Thành viên chính thức&quot; sau khi thanh toán đủ.</li>
      </ol>
      {error && <p className="mb-3 text-sm text-accent-red">{error}</p>}
      <button
        type="button"
        onClick={startDeposit}
        disabled={step === "loading"}
        className="rounded-lg bg-accent-red px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {step === "loading" ? "Đang chuyển tới trang thanh toán..." : `Cọc giữ chỗ ${packageName} ngay`}
      </button>

      {/* Form ẩn để redirect POST sang trang thanh toán Sepay — Sepay yêu cầu POST form, không phải GET link. */}
      <form ref={formRef} action={formAction} method="POST" className="hidden">
        {Object.entries(formFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>
    </div>
  );
}
