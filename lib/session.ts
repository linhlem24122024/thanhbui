import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyMemberToken, verifyAdminToken, cookieNames } from "@/lib/auth";

export type CurrentMember = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "free" | "paid";
  interested_package_id: string | null;
  must_change_password: boolean;
};

/** Đọc cookie phiên đăng nhập và lấy dữ liệu thành viên MỚI NHẤT từ DB — không tin dữ liệu cũ trong JWT (RULE-04). */
export async function getCurrentMember(): Promise<CurrentMember | null> {
  const store = await cookies();
  const token = store.get(cookieNames.member)?.value;
  if (!token) return null;

  const payload = await verifyMemberToken(token);
  if (!payload) return null;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("members")
    .select("id, name, phone, email, tier, interested_package_id, must_change_password")
    .eq("id", payload.memberId)
    .maybeSingle();

  if (error || !data) return null;
  return data as CurrentMember;
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(cookieNames.admin)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
