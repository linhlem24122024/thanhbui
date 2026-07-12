import "server-only";
import { createClient } from "@supabase/supabase-js";

// CHỈ dùng ở server (API routes, server components) — dùng SERVICE_ROLE_KEY,
// bypass RLS nên tuyệt đối không được import file này vào component "use client".
// RULE-03 / RULE-10 trong 12-NGUYEN-TAC-BAO-MAT.md.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường (.env.local)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
