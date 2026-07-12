import AuthCard from "@/components/AuthCard";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <AuthCard title="Đăng nhập quản trị" subtitle="Chỉ dành cho quản trị viên.">
      <AdminLoginForm />
    </AuthCard>
  );
}
