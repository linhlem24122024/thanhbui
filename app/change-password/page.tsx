import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { getCurrentMember } from "@/lib/session";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  return (
    <AuthCard title="Đổi mật khẩu" subtitle="Chọn mật khẩu mới cho tài khoản của bạn.">
      <ChangePasswordForm forced={member.must_change_password} />
    </AuthCard>
  );
}
