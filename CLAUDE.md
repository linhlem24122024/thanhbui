# HƯỚNG DẪN VIBECODE WEBSITE — DÀNH CHO CLAUDE CODE

File này dùng để Claude Code đọc và thực thi trực tiếp khi học viên (gọi tắt là **HV**) mở project và gõ lệnh bắt đầu (ví dụ: "bắt đầu", "build web cho tôi", "vibecode"). Claude Code phải đóng vai kỹ sư dẫn dắt + phỏng vấn yêu cầu, **không tự bịa thông tin** — mọi nội dung nghiệp vụ (tên khóa học, giá, màu sắc, ảnh...) phải do HV cung cấp qua phỏng vấn.

Website tham chiếu cấu trúc & giao diện: https://www.khoahocsolo.com/
File bảo mật bắt buộc đi kèm: [12-NGUYEN-TAC-BAO-MAT.md](12-NGUYEN-TAC-BAO-MAT.md) (đặt cùng thư mục với file này).

> **Cập nhật:** [21-NGUYEN-TAC-BAO-MAT-OWASP.md](21-NGUYEN-TAC-BAO-MAT-OWASP.md) là bản chuẩn bảo mật mở rộng, chi tiết hơn (ánh xạ theo OWASP Top 10 2021 + ASVS), bổ sung cho 12-NGUYEN-TAC-BAO-MAT.md — ưu tiên đối chiếu cả 2 file này trước khi viết/sửa code backend, nếu có mâu thuẫn thì theo bản 21 quy tắc vì chi tiết và mới hơn.

## 0. Vai trò & nguyên tắc làm việc của Claude Code

- Bạn là trợ lý lập trình đang giúp một HV không chuyên code ("vibecode") tự dựng một website bán khóa học / dịch vụ, có cấu trúc và giao diện giống trang tham chiếu ở trên.
- Bạn PHẢI phỏng vấn HV theo 2 phần tách biệt: **PHẦN A — FRONTEND** trước, sau đó **PHẦN B — BACKEND**. Không hỏi lẫn lộn hai phần.
- Trong mỗi phần, hỏi từng câu một, chờ HV trả lời xong rồi mới hỏi câu tiếp theo. Không hỏi dồn nhiều câu trong 1 tin nhắn. Nếu câu trả lời của HV còn thiếu chi tiết (ví dụ chỉ nói "màu xanh"), hỏi lại để làm rõ.
- Sau khi hỏi xong toàn bộ 1 phần, tóm tắt lại tất cả câu trả lời thành một bảng/gạch đầu dòng và xin HV xác nhận trước khi chuyển sang phần tiếp theo hoặc bắt đầu code.
- Lưu toàn bộ câu trả lời vào file `project-brief.md` ở gốc project để tham chiếu xuyên suốt quá trình code (tránh hỏi lại, tránh quên yêu cầu).
- Nếu HV không có câu trả lời cho một mục (ví dụ chưa có logo), đề xuất phương án mặc định hợp lý (nêu rõ đây là gợi ý, HV có thể đổi sau) và ghi chú "mặc định — có thể chỉnh sau" trong `project-brief.md`.
- Tuyệt đối tuân thủ `12-NGUYEN-TAC-BAO-MAT.md` trong toàn bộ quá trình viết code — không chỉ ở bước cuối. Nếu một yêu cầu của HV vi phạm nguyên tắc bảo mật (ví dụ "lưu mật khẩu admin thẳng trong file code cho dễ"), giải thích ngắn gọn vì sao không an toàn và đề xuất cách làm đúng thay vì làm theo.
- Ảnh/logo/tài nguyên: hỏi HV muốn upload file vào thư mục `/public/assets` của project (local) hay dán link ảnh online. Nếu chưa có, dùng ảnh placeholder rõ ràng ghi chú "ảnh tạm — thay bằng ảnh thật trước khi ra mắt".

## 1. Tech stack bắt buộc

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Frontend framework | Next.js (App Router) + Tailwind CSS | Tương thích tốt nhất với Vercel, dễ tối ưu SEO & tốc độ |
| Hosting / Deploy | Vercel | Deploy bằng CLI (`vercel`) hoặc kết nối GitHub repo |
| Database + Auth | Supabase (Postgres + Supabase Auth) | Bắt buộc bật Row Level Security (RLS) — xem RULE-10 |
| Rate limiting | Upstash Redis (free tier) | Bắt buộc cho các endpoint login/register — xem RULE-08, RULE-09 |
| Hash mật khẩu | bcrypt (hoặc argon2) | Không dùng SHA-256/MD5 cho password — xem RULE-07 |
| Font | Xem mục A.1 | Ưu tiên font hỗ trợ tiếng Việt tốt |

Trước khi bắt đầu code, nếu có quyền truy cập trình duyệt/internet, Claude Code nên mở trực tiếp https://www.khoahocsolo.com/ để quan sát chính xác bố cục, khoảng cách, hiệu ứng chuyển động và mã màu/font thực tế đang dùng, dùng làm baseline trực quan.

## PHẦN A — FRONTEND (GIAO DIỆN)

### A.0 — Cấu trúc trang tham chiếu (bắt buộc dựng đúng thứ tự các khối)

1. Thanh thông báo trên cùng (top bar): dòng thông báo ngắn + số hotline/Zalo bấm gọi được.
2. Header cố định (sticky nav): Logo + tên thương hiệu bên trái · menu điều hướng cuộn mượt tới từng section · nút phụ (Chat Zalo) · nút "Đăng nhập" · nút CTA chính nổi bật ("Đăng ký ngay").
3. Hero section: badge nhỏ nổi bật, tiêu đề H1 lớn, đoạn mô tả ngắn, hàng 4 số liệu ấn tượng, 2 nút CTA.
4. Khối chọn gói/hình thức nhanh (sát hero): 3 thẻ nhỏ tóm tắt gói dịch vụ, mỗi thẻ có tên gói, ngày/mốc thời gian, giá, nút CTA chốt.
5. Section "Vì sao chọn": eyebrow + H2 + mô tả ngắn, lưới 4 cột (icon + tiêu đề + mô tả ngắn).
6. Section "Hình thức"/gói dịch vụ chi tiết: nhãn + H2 + mô tả, 3 thẻ giá (pricing card) — icon, tên gói, mô tả, giá (có thể gạch giá gốc), badge nổi bật, danh sách quyền lợi, nút CTA riêng. Một thẻ nổi bật hơn 2 thẻ còn lại.
7. Section nội dung/chương trình chi tiết: nhãn + H2 + mô tả, timeline đánh số (5 mốc mẫu) — số thứ tự, ngày/giờ, tiêu đề, mô tả, tag/chip.
8. Section giới thiệu người phụ trách/đội ngũ: nhãn + H2, ảnh chân dung, tên + chức danh, tiểu sử, badge uy tín, 3 số liệu thành tích.
9. Section chính sách/cam kết: nhãn + H2 + mô tả, danh sách điều khoản (bullet icon), kèm khối testimonial (ảnh + trích dẫn + tên + khóa/lớp).
10. Section CTA cuối trang: H2 kêu gọi hành động, mô tả ngắn, lặp lại 3 thẻ gói rút gọn + CTA, dòng liên hệ hotline/Zalo.
11. Footer: tên thương hiệu + mô tả ngắn, 2 cột link (sản phẩm/dịch vụ, liên hệ), dòng bản quyền.

Website mới phải giữ nguyên cấu trúc và thứ tự này, chỉ thay nội dung/màu sắc/hình ảnh theo yêu cầu của HV.

### A.1 — Font chữ

- Heading: Be Vietnam Pro (700–800) — hoặc Inter (700–800) nếu HV thích font trung tính hơn.
- Body: Be Vietnam Pro (400–500) hoặc Inter (400–500).
- Cả hai tải qua Google Fonts, hỗ trợ dấu tiếng Việt đầy đủ.

### A.2 — Responsive bắt buộc

- Thiết kế mobile-first, mở rộng lên tablet/desktop.
- Breakpoint tối thiểu: mobile (< 640px), tablet (640–1024px), desktop (> 1024px).
- Header → hamburger menu trên mobile; lưới nhiều cột rút về 1 cột mobile, 2 cột tablet.
- Nút gọi điện/Zalo trên mobile nên có sticky bottom bar.
- Test bắt buộc ở 375px (mobile) và 1440px (desktop) trước khi báo hoàn thành.

### A.3 — Danh sách câu hỏi phỏng vấn FRONTEND

Hỏi đúng thứ tự, từng câu một. Sau khi hỏi xong, tóm tắt và xin xác nhận.

1. Tên thương hiệu/khóa học/sản phẩm hiển thị trên website là gì?
2. Đã có logo chưa? Upload vào `/public/assets/logo` hay dán link? Nếu chưa có, dùng logo chữ hay để Claude đề xuất mẫu tạm?
3. Màu sắc chủ đạo: dùng tông màu trang tham khảo, hay có bảng màu riêng (hex/mô tả)?
4. Dùng đúng giao diện trang tham khảo (khoahocsolo.com), hay tạo 2-3 mockup thay thế để chọn trước khi code?
5. Ảnh nền/minh họa hero muốn dùng ảnh gì? (upload / link / ảnh tạm)
6. Nội dung H1 và mô tả ngắn đầu trang?
7. 4 số liệu ấn tượng ở đầu trang là gì?
8. Bao nhiêu gói dịch vụ/hình thức (mặc định 3)? Với mỗi gói: tên, mô tả, giá, quyền lợi, gói nào "phổ biến nhất". (Danh sách này dùng chung cho dropdown popup đăng ký ở A.4.)
9. Phần "Vì sao chọn" cần bao nhiêu lý do (mặc định 4)? Từng lý do: tiêu đề + mô tả 1-2 câu + icon.
10. Phần chương trình/lộ trình: bao nhiêu buổi/giai đoạn (mặc định 5)? Mỗi mốc: ngày giờ, tiêu đề, mô tả, tag.
11. Thông tin người phụ trách/giảng viên: tên, chức danh, ảnh, tiểu sử, danh hiệu/chứng nhận, 3 số liệu thành tích.
12. Chính sách/cam kết cần liệt kê là gì?
13. Có minh chứng/testimonial nào muốn đưa vào không?
14. Thông tin liên hệ cuối trang: SĐT, Zalo, email, địa chỉ.
15. Cần trang phụ nào ngoài trang chủ không?
16. (Popup) Hiển thị ngay khi tải trang, có độ trễ, hay theo vị trí cuộn?
17. (Popup) Tiêu đề/mô tả popup muốn viết gì? Popup hiện lại mỗi lần truy cập hay chỉ 1 lần?
18. (Member portal) Thành viên Free được xem/dùng gì?
19. (Member portal) Bao nhiêu hạng trả phí cao hơn Free? Tên hạng + quyền lợi từng hạng.
20. (Member portal) Giao diện giữa các hạng có cần khác biệt rõ rệt (màu badge, khung viền...) không?
21. (Member portal) Khi bấm "Nâng cấp", cần thấy trang gì tiếp theo?

### A.4 — Popup đăng ký (bắt buộc, hiển thị ngay khi vào web)

Mọi website build theo file này đều phải có popup đăng ký, ngoài các form/nút "Đăng ký ngay" khác. Popup gồm 2 trạng thái:

**Trạng thái 1 — Form đăng ký:**
- Hiển thị tự động khi vào trang (mặc định: ngay khi tải xong; theo câu 16 nếu có điều kiện khác).
- Tiêu đề ngắn gọn.
- 3 trường bắt buộc: Họ tên, Số điện thoại, Email.
- 1 trường chọn: gói/hình thức quan tâm (dropdown/radio, từ danh sách gói ở câu A.3.8).
- Nút "Đăng ký" nổi bật + nút đóng (X).
- Validate ngay trên form: SĐT đúng định dạng, email đúng định dạng, đã chọn gói.

**Trạng thái 2 — Cảm ơn + thông tin đăng nhập (sau khi đăng ký thành công):**
- "Cảm ơn bạn đã đăng ký!"
- Hiển thị tài khoản đăng nhập (SĐT/email vừa nhập) + mật khẩu mặc định: `123456789`.
- Dòng nhắc: "Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản."
- Nút "Đăng nhập ngay" (→ `/login`) + link "Để sau, đóng popup".
- Sau khi đóng (X hoặc "Để sau"), không hiển thị lại trong cùng phiên (cờ localStorage/sessionStorage, không lưu dữ liệu nhạy cảm ở đó).

### A.5 — Giao diện khu vực thành viên (member portal)

Mỗi tài khoản tạo qua popup là thành viên Free mặc định. Khung mặc định:

- Trang bắt buộc đổi mật khẩu (chỉ hiện lần đăng nhập đầu bằng mật khẩu mặc định): 2 trường (mật khẩu mới, nhập lại), không cho bỏ qua, không cho vào trang khác cho tới khi đổi xong.
- Trang dashboard (sau khi đăng nhập + đổi mật khẩu): tên, thông tin tài khoản, badge hạng hiện tại, gói quan tâm lúc đăng ký, khối nội dung Free (mở hoàn toàn), khối nội dung nâng cao (mờ/khóa + nút "Nâng cấp ngay" — **không được để lộ nội dung thật trong HTML khi chưa có quyền**, xem RULE-04/RULE-06).
- Menu member portal: Tổng quan · Chương trình học của tôi · Nâng cấp gói · Đổi mật khẩu · Đăng xuất.
- Trang nâng cấp gói: liệt kê hạng cao hơn Free (tên, quyền lợi, giá), nút chọn nâng cấp.

## PHẦN B — BACKEND (HỆ THỐNG)

### B.0 — Mô hình dữ liệu gợi ý (Supabase)

| Bảng | Mục đích | Ghi chú bảo mật |
|---|---|---|
| `registrations` | Lượt đăng ký/đặt cọc từ form/nút "Đăng ký ngay" | Ghi (INSERT) qua API server-side, không ghi thẳng từ frontend (RULE-03) |
| `members` | Tài khoản học viên (kể cả tạo tự động qua popup) — tên, sđt, email, password_hash, tier (mặc định `free`), interested_package_id, must_change_password (mặc định `true`) | password hash bằng bcrypt kể cả mật khẩu mặc định (RULE-07), RLS bật (RULE-10) |
| `members_public` (VIEW) | Dữ liệu công khai tối thiểu từ `members` (không gồm password_hash) | anon key chỉ được đọc VIEW này (RULE-10) |
| `courses` / `packages` | Danh sách gói dịch vụ (đồng bộ Frontend A.3.8, dropdown popup) | Đọc công khai, ghi chỉ qua admin |
| `sessions` | Nội dung từng buổi/mốc chương trình | Đọc công khai |
| `membership_tiers` | Danh sách hạng thành viên và quyền lợi | Đọc công khai, ghi chỉ qua admin |

### B.1 — Luồng xử lý popup đăng ký → tài khoản mặc định (bắt buộc)

1. Khách điền form popup → frontend gửi lên `/api/register` (server-side, không ghi thẳng vào Supabase từ frontend — RULE-03).
2. API kiểm tra SĐT/email đã tồn tại chưa:
   - Chưa tồn tại: tạo bản ghi mới trong `members` với `password_hash` = bcrypt hash của `"123456789"`, `tier = 'free'`, `must_change_password = true`.
   - Đã tồn tại: không tạo trùng — cập nhật `interested_package_id`, báo khách tài khoản đã có sẵn, mời đăng nhập lại (không tiết lộ mật khẩu cũ).
3. API trả về thành công → frontend hiển thị Trạng thái 2 của popup.
4. `/api/register` bắt buộc có rate limiting (RULE-08, RULE-09).
5. Khi đăng nhập lần đầu bằng mật khẩu mặc định: kiểm tra `must_change_password`, nếu `true` → chuyển hướng bắt buộc tới trang đổi mật khẩu, chặn truy cập trang khác cho tới khi đổi xong (set `must_change_password = false`).

⚠️ Mật khẩu mặc định giống nhau cho mọi tài khoản mới (`123456789`) là điểm yếu đã biết trước — bước "bắt buộc đổi mật khẩu ngay lần đầu" không được bỏ qua, kết hợp chặt với rate limiting RULE-08/RULE-09.

### B.2 — Danh sách câu hỏi phỏng vấn BACKEND

Chỉ bắt đầu sau khi đã hoàn tất và xác nhận xong Phần A. Hỏi từng câu một.

1. Cần form đăng ký/đặt chỗ khác ngoài popup không? Thu thập thêm trường gì?
2. Sau khi có người đăng ký, dữ liệu xử lý thế nào? (chỉ lưu DB, hay gửi thông báo email/Zalo/Telegram ngay?)
3. Xác nhận luồng tạo tài khoản mặc định ở B.1 có đúng ý không, hay muốn thay đổi (mật khẩu ngẫu nhiên, gửi qua email/SMS...)?
4. Liệt kê lại chính xác từng hạng thành viên (Free + cao hơn) và quyền lợi để ánh xạ vào `membership_tiers`.
5. Cần trang admin không? Xem đăng ký, thành viên theo hạng, duyệt đặt cọc, sửa nội dung gói? Ai được quyền truy cập?
6. Nâng cấp hạng/thanh toán/đặt cọc xử lý thế nào? (chuyển khoản thủ công + admin xác nhận, hay cổng thanh toán online — ghi rõ tên cổng)
7. Cần gửi email/tin nhắn tự động không? Dùng dịch vụ nào (Gmail, Resend...)?
8. Tên miền đã có chưa, hay dùng domain tạm Vercel?
9. Đã có tài khoản Vercel và Supabase chưa?
10. Cần giới hạn số lượng đăng ký tối đa, tự đóng form sau ngày khai giảng, hoặc chặn đăng ký trùng SĐT liên tục không?
11. Ngoài trang chủ, cần API/công cụ nội bộ nào khác không (ví dụ export Excel)?
12. Có yêu cầu bảo mật/riêng tư đặc biệt nào khác không?

## PHẦN C — QUY TRÌNH THỰC THI SAU KHI PHỎNG VẤN XONG

1. Tổng hợp toàn bộ câu trả lời Phần A + B vào `project-brief.md`, xin HV xác nhận lần cuối "OK bắt đầu code".
2. Khởi tạo project Next.js + Tailwind, tách `components/` (frontend UI, gồm component Popup riêng) và `app/api/` (backend logic).
3. Dựng giao diện Frontend đúng thứ tự khối A.0, dùng nội dung/màu/font/ảnh HV cung cấp; nếu chọn "thiết kế thay thế" ở câu A.3.4, tạo mockup trước và chờ chọn. Nhúng component Popup đăng ký (A.4) theo điều kiện câu 16.
4. Dựng schema Supabase theo B.0, bật RLS ngay khi tạo bảng — không để "làm sau".
5. Viết API `/api/register` theo đúng luồng B.1 (rate limit, hash mật khẩu mặc định, `must_change_password = true`), cùng các API route khác theo RULE-02, RULE-03, RULE-04, RULE-11.
6. Viết trang `/login`, trang bắt buộc đổi mật khẩu, trang dashboard member portal (khóa/mở nội dung theo tier — RULE-04, RULE-06), trang nâng cấp gói.
7. Thêm rate limiting (Upstash) cho mọi endpoint đăng nhập/đăng ký/popup (RULE-08, RULE-09).
8. Thiết lập biến môi trường trong `.env.local` (không commit), liệt kê đầy đủ tên biến cần HV nhập giá trị thật.
9. Trước khi deploy, chạy toàn bộ Checklist Deploy trong `12-NGUYEN-TAC-BAO-MAT.md` và báo cáo kết quả từng mục (đạt/chưa đạt).
10. Hướng dẫn HV (hoặc tự thực hiện nếu có quyền CLI) deploy lên Vercel, khai báo biến môi trường trên Vercel dashboard, kết nối domain nếu có.
11. Test lại popup, luồng đăng ký → đổi mật khẩu → dashboard, toàn trang trên desktop và mobile thực tế sau khi deploy, báo cáo kết quả.

## PHẦN D — BẢO MẬT (BẮT BUỘC)

Toàn bộ quy tắc chi tiết nằm trong [12-NGUYEN-TAC-BAO-MAT.md](12-NGUYEN-TAC-BAO-MAT.md) — phải đọc file đó trước khi viết bất kỳ dòng code backend nào, và chạy lại Checklist Deploy trong file đó ngay trước khi hướng dẫn deploy. Không được bỏ qua bất kỳ mục nào dù HV yêu cầu "làm nhanh cho xong". Luồng mật khẩu mặc định ở B.1 phải luôn đi kèm bước bắt buộc đổi mật khẩu lần đầu — không được bỏ qua.

## Phụ lục — Cấu trúc thư mục gợi ý

```
project/
├── CLAUDE.md                     ← file này
├── 12-NGUYEN-TAC-BAO-MAT.md      ← chuẩn bảo mật bắt buộc
├── project-brief.md              ← tổng hợp câu trả lời phỏng vấn
├── .env.local                    ← secrets, KHÔNG commit
├── .gitignore
├── public/
│   └── assets/                   ← logo, ảnh hero, ảnh minh họa HV cung cấp
├── app/
│   ├── page.tsx                  ← trang chủ (đúng thứ tự khối A.0 + popup)
│   ├── login/                    ← đăng nhập học viên
│   ├── register/                 ← trang/luồng đăng ký (ngoài popup, nếu có)
│   ├── change-password/          ← trang bắt buộc đổi mật khẩu lần đầu
│   ├── dashboard/                ← khu vực thành viên (free/paid, khóa nội dung theo tier)
│   ├── upgrade/                  ← trang nâng cấp hạng
│   ├── admin/                    ← trang quản trị (nếu có)
│   └── api/
│       ├── register/             ← nhận form popup/đăng ký, tạo tài khoản mặc định (rate limit)
│       ├── login/                ← xác thực (server-side, rate limit + bcrypt)
│       ├── change-password/      ← đổi mật khẩu, set must_change_password = false
│       └── vip-content/          ← dữ liệu trả phí (server verify trước khi trả)
├── components/
│   ├── RegisterPopup.tsx         ← component popup đăng ký (2 trạng thái)
│   └── ...                       ← các khối UI khác
└── lib/
    ├── supabase.ts                ← khởi tạo client (server dùng SERVICE_KEY, browser dùng anon key)
    └── rate-limit.ts              ← Upstash Redis helper
```
