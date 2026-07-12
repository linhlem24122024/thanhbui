"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DepositConfirmButton({ depositId }: { depositId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/deposits/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={submitting}
      className="rounded-lg bg-navy-mid px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60"
    >
      {submitting ? "..." : "Tick đã cọc"}
    </button>
  );
}
