import AuthCard from "@/components/AuthCard";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthCard title="Đăng nhập học viên" subtitle="Dùng số điện thoại đã đăng ký và mật khẩu.">
      <LoginForm />
    </AuthCard>
  );
}
