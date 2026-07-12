import "server-only";
import crypto from "crypto";

// SePay Payment Gateway — luồng redirect (không phải QR tĩnh):
// https://developer.sepay.vn/en/cong-thanh-toan/API/don-hang/form-thanh-toan
export const SEPAY_CHECKOUT_URL = "https://pay.sepay.vn/v1/checkout/init";

// Thứ tự field PHẢI đúng như tài liệu quy định khi tính chữ ký — sai thứ tự là chữ ký sai.
const SIGNED_FIELD_ORDER = [
  "order_amount",
  "merchant",
  "currency",
  "operation",
  "order_description",
  "order_invoice_number",
  "customer_id",
  "payment_method",
  "success_url",
  "error_url",
  "cancel_url",
] as const;

export type CheckoutFields = {
  order_amount: string;
  merchant: string;
  currency: "VND";
  operation: "PURCHASE";
  order_description: string;
  order_invoice_number: string;
  customer_id: string;
  payment_method: "BANK_TRANSFER";
  success_url: string;
  error_url: string;
  cancel_url: string;
};

function computeSignature(fields: CheckoutFields, secretKey: string): string {
  const signedString = SIGNED_FIELD_ORDER.map((key) => `${key}=${fields[key]}`).join(",");
  return crypto.createHmac("sha256", secretKey).update(signedString).digest("base64");
}

/** Sinh toàn bộ field (kèm signature) cần cho form POST tới SEPAY_CHECKOUT_URL. */
export function buildCheckoutFields(params: {
  amount: number;
  description: string;
  invoiceNumber: string;
  customerId: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
}): CheckoutFields & { signature: string } {
  const merchant = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;

  if (!merchant || !secretKey) {
    throw new Error("Thiếu SEPAY_MERCHANT_ID hoặc SEPAY_SECRET_KEY trong biến môi trường (.env.local).");
  }

  const fields: CheckoutFields = {
    order_amount: String(params.amount),
    merchant,
    currency: "VND",
    operation: "PURCHASE",
    order_description: params.description,
    order_invoice_number: params.invoiceNumber,
    customer_id: params.customerId,
    payment_method: "BANK_TRANSFER",
    success_url: params.successUrl,
    error_url: params.errorUrl,
    cancel_url: params.cancelUrl,
  };

  const signature = computeSignature(fields, secretKey);
  return { ...fields, signature };
}

/** Mã tham chiếu ngắn, duy nhất — dùng làm order_invoice_number. */
export function generatePaymentCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `COC${random}`;
}
