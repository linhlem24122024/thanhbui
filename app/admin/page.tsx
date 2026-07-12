import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { site, packages } from "@/lib/content";
import AdminLogoutButton from "./AdminLogoutButton";
import UpgradeForm from "./UpgradeForm";
import DepositConfirmButton from "./DepositConfirmButton";

const TIER_LABEL: Record<string, string> = { free: "Free", paid: "Thành viên chính thức" };
const DEPOSIT_STATUS_LABEL: Record<string, string> = {
  pending: "Chưa báo cọc",
  reported: "Đã báo cọc",
  confirmed: "Đã cọc (xác nhận)",
};

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

type DepositRow = {
  id: string;
  package_id: string;
  deposit_amount: number;
  remaining_amount: number;
  payment_code: string;
  status: string;
  created_at: string;
  members: { name: string; phone: string } | { name: string; phone: string }[] | null;
};

function depositMember(row: DepositRow) {
  return Array.isArray(row.members) ? row.members[0] : row.members;
}

export default async function AdminPage() {
  if (!(await isAdminSession())) redirect("/admin/login");

  const db = supabaseAdmin();
  const [{ data: registrations }, { data: members }, { data: deposits }] = await Promise.all([
    db
      .from("registrations")
      .select("id, name, phone, email, package_id, status, created_at")
      .order("created_at", { ascending: false }),
    db
      .from("members")
      .select("id, name, phone, email, tier, must_change_password, created_at")
      .order("created_at", { ascending: false }),
    db
      .from("upgrade_deposits")
      .select(
        "id, package_id, deposit_amount, remaining_amount, payment_code, status, created_at, members(name, phone)"
      )
      .order("created_at", { ascending: false }) as unknown as Promise<{ data: DepositRow[] | null }>,
  ]);

  return (
    <div className="min-h-screen bg-bg-light">
      <nav className="bg-navy-mid px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-extrabold">{site.brand} · Admin</span>
          <AdminLogoutButton />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy-mid">
              Danh sách đăng ký ({registrations?.length ?? 0})
            </h2>
            <a
              href="/api/admin/registrations?format=csv"
              className="rounded-lg border border-navy-mid px-4 py-2 text-sm font-bold text-navy-mid transition hover:bg-bg-light"
            >
              ⬇ Xuất Excel/CSV
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-text-muted">
                  <th className="py-2 pr-4">Họ tên</th>
                  <th className="py-2 pr-4">SĐT</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Gói</th>
                  <th className="py-2 pr-4">Trạng thái</th>
                  <th className="py-2 pr-4">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {(registrations ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{r.name}</td>
                    <td className="py-2 pr-4">{r.phone}</td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4">{r.package_id}</td>
                    <td className="py-2 pr-4">{r.status}</td>
                    <td className="py-2 pr-4 text-text-muted">
                      {new Date(r.created_at).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {(!registrations || registrations.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-text-muted">
                      Chưa có lượt đăng ký nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-extrabold text-navy-mid">Thành viên ({members?.length ?? 0})</h2>

          <div className="mb-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-text-muted">
                  <th className="py-2 pr-4">Họ tên</th>
                  <th className="py-2 pr-4">SĐT</th>
                  <th className="py-2 pr-4">Hạng</th>
                  <th className="py-2 pr-4">Đã đổi mật khẩu</th>
                  <th className="py-2 pr-4">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {(members ?? []).map((m) => (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{m.name}</td>
                    <td className="py-2 pr-4">{m.phone}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          m.tier === "paid" ? "bg-accent-gold/20 text-navy-mid" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {TIER_LABEL[m.tier] ?? m.tier}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{m.must_change_password ? "Chưa" : "Rồi"}</td>
                    <td className="py-2 pr-4 text-text-muted">
                      {new Date(m.created_at).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {(!members || members.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted">
                      Chưa có thành viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <UpgradeForm />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-extrabold text-navy-mid">Cọc nâng cấp ({deposits?.length ?? 0})</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-text-muted">
                  <th className="py-2 pr-4">Học viên</th>
                  <th className="py-2 pr-4">Nâng cấp gói</th>
                  <th className="py-2 pr-4">Đã cọc</th>
                  <th className="py-2 pr-4">Còn lại</th>
                  <th className="py-2 pr-4">Mã tham chiếu</th>
                  <th className="py-2 pr-4">Trạng thái</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {(deposits ?? []).map((d) => {
                  const m = depositMember(d);
                  const pkg = packages.find((p) => p.id === d.package_id);
                  return (
                    <tr key={d.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4">
                        {m?.name ?? "—"} <span className="text-text-muted">({m?.phone ?? "—"})</span>
                      </td>
                      <td className="py-2 pr-4">{pkg?.name ?? d.package_id}</td>
                      <td className="py-2 pr-4">{formatVnd(d.deposit_amount)}</td>
                      <td className="py-2 pr-4">{formatVnd(d.remaining_amount)}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{d.payment_code}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            d.status === "confirmed"
                              ? "bg-accent-gold/20 text-navy-mid"
                              : d.status === "reported"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {DEPOSIT_STATUS_LABEL[d.status] ?? d.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {d.status !== "confirmed" && <DepositConfirmButton depositId={d.id} />}
                      </td>
                    </tr>
                  );
                })}
                {(!deposits || deposits.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-text-muted">
                      Chưa có yêu cầu cọc nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
