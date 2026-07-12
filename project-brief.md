# Project Brief — Phễu Khách Tài Chính (SaaS)

Tổng hợp câu trả lời phỏng vấn theo quy trình trong [CLAUDE.md](CLAUDE.md). Tham chiếu xuyên suốt quá trình code — không hỏi lại các mục đã chốt dưới đây.

## Trạng thái deploy (đã xác minh 2026-07-12)

- ✅ GitHub: đã push tại `https://github.com/linhlem24122024/thanhbui`
- ✅ Supabase (`phlyxtafoybuujggtdpn`): schema đã chạy, đã test insert/select thật qua toàn bộ luồng register → login → change-password → dashboard → admin → upgrade → export CSV
- ✅ Upstash Redis: đã nối (lưu ý — DB đầu tiên tạo ở chế độ **Global** không hỗ trợ `EVALSHA`/Lua script nên rate-limit lỗi `NOPERM`; đã đổi sang DB **Regional** thì hoạt động bình thường)
- ✅ Resend: đã nối, dùng domain test `onboarding@resend.dev` (có thể giới hạn chỉ gửi về email chủ tài khoản Resend cho tới khi verify domain riêng)
- ⚠️ **Lưu ý kỹ thuật — biến môi trường chứa `$` trong `.env.local` (local dev)**: PHẢI escape thành `\$` (backslash trước mỗi dấu `$`) — Next.js tự động coi `$ten_bien` là cú pháp chèn biến (dotenv-expand) và sẽ âm thầm cắt mất phần sau, kể cả khi bọc trong dấu nháy. Chỉ ảnh hưởng `.env.local` chạy qua Next.js — KHÔNG áp dụng escape này khi thêm biến trên Vercel Dashboard/CLI (Vercel lưu nguyên văn, không expand `$`).
- ⚠️ **Lưu ý kỹ thuật — thêm biến qua Vercel CLI trên Windows PowerShell**: lệnh `"value" | vercel env add NAME production` bị PowerShell chèn BOM (ký tự ẩn U+FEFF) vào đầu chuỗi, làm hỏng giá trị dù nhìn bằng mắt vẫn đúng (ví dụ URL Upstash bị lỗi "invalid URL" dù copy đúng). Cách né: dùng Bash + `printf '%s' "value" | vercel env add NAME production` (không dùng PowerShell pipe cho bước này).
- ✅ Vercel: đã deploy production tại **https://thanh-woad.vercel.app** (project `buivanthanh/thanh`), đã test thật toàn bộ luồng register → login → change-password → admin → upgrade → export CSV trên domain live, dữ liệu test đã dọn sạch khỏi Supabase.
- ⏳ Kết nối GitHub ↔ Vercel để auto-deploy mỗi lần push: `vercel git connect` báo lỗi "Failed to connect" — nhiều khả năng cần cài đặt Vercel GitHub App và cấp quyền truy cập repo `thanhbui` từ phía GitHub (chỉ chủ tài khoản GitHub làm được, qua github.com/apps/vercel hoặc trong lúc import project trên Vercel Dashboard). Hiện tại deploy vẫn chạy tốt qua CLI (`vercel --prod`) mỗi khi cần cập nhật.

## Phần A — Frontend (đã xác nhận)

| # | Mục | Nội dung |
|---|---|---|
| 1 | Tên thương hiệu | Phễu Khách Tài Chính |
| 2 | Logo | Logo chữ (text logo), gradient vàng, font Montserrat đậm — *mặc định, có thể chỉnh sau* |
| 3 | Màu sắc | Lấy theo khoahocsolo.com: navy gradient `#001D4A → #003580 → #004AAD` (nền tối/topbar/footer-adjacent), CTA đỏ `#E63946`, badge/eyebrow vàng `#FFD700` (nền `rgba(255,215,0,.15)`), section sáng `#F7F9FC`, footer `#001230`, chữ phụ xám `#888` |
| 4 | Bố cục/giao diện | Giống hệt khoahocsolo.com, đúng thứ tự khối mục A.0 của CLAUDE.md |
| 5 | Ảnh hero | Không dùng ảnh nền — dùng card trắng bên phải hero chứa gói dịch vụ nhanh (giống mẫu). Ảnh khác bổ sung sau — dùng placeholder tạm ghi chú rõ |
| 6 | H1 + mô tả hero | Giữ nguyên từ landing cũ: <br>H1: "6 tuần nữa, khách lạ tự nhắn tin cho bạn — không vét danh bạ, không gọi làm phiền ai." <br>Mô tả: "Rời khóa với một phễu đang chạy thật: tối thiểu 20 khách mới không phải người quen trong Zalo, bộ kịch bản chat của riêng bạn, và những đơn đầu tiên đến từ người lạ." <br>Định vị phụ: "Mọi khóa sales dạy bạn nói gì khi ĐÃ có khách trước mặt. Khóa này giải quyết chuyện xảy ra trước đó: làm sao để ngày nào cũng có khách MỚI tìm đến bạn." |
| 7 | 4 số liệu hero | 6 — Tuần đào tạo · 25 — Suất khóa 1 · 20+ — Khách mới mỗi học viên · 1.290K — Học phí khóa 1 |
| 8 | Gói dịch vụ | 1 gói duy nhất — **"Khóa 1"**, 1.290.000đ (giá gốc từ khóa 2: 1.790.000đ), 25 suất. Quyền lợi: 6 buổi Zoom trực tiếp 90 phút (bản ghi 6 tháng) theo lộ trình 6 tuần; bộ 12 template cầm tay; chấm bài từng người từng tuần + 2 buổi office-hours + Q&A 60 ngày sau tốt nghiệp; bài học lọc hồ sơ trước khi gửi link. Không có badge "phổ biến nhất" (chỉ 1 gói). Hiển thị 1 pricing card thay vì 3 (khác số lượng so với mẫu, giữ nguyên cấu trúc khối) |
| 9 | Section "Vì sao chọn" (4 lý do) | 🎥 6 buổi Zoom trực chiến — không lý thuyết suông, mỗi tuần dựng xong 1 bộ phận của phễu thật. <br>📋 Bộ 12 template cầm tay — dùng ngay không cần tự soạn. <br>✍️ Chấm bài từng người, từng tuần — sĩ số chốt 25 để chấm tận tay. <br>🔍 Bài học lọc hồ sơ trước khi gửi link — tránh chốt khách mà hoa hồng bằng 0 |
| 10 | Timeline chương trình (6 mốc, không có giờ cụ thể) | Tuần 1: Định vị & chọn sân đấu · Tuần 2: Dựng group + bộ content 6-3-1 · Tuần 3: Kịch bản chat 4 nhịp · Tuần 4: Lọc hồ sơ & xin giới thiệu · Tuần 5: Bán chéo & đo số · Tuần 6: Lên hệ thống + Lễ khai phễu tốt nghiệp |
| 11 | Giảng viên | Tên: **Bùi Văn Thành**. Chức danh: "Chuyên gia Tài chính · Người sáng lập Phễu Khách Tài Chính". Danh hiệu: "Chuyên Gia Tư Vấn Tài Chính". Tiểu sử: "là người hướng dẫn tài chính có kinh nghiệm thực chiến cùng nhiều kết quả kinh doanh nổi bật. Anh chia sẻ những phương pháp quản lý tài chính và phát triển thu nhập dựa trên trải nghiệm thực tế, hướng đến tính ứng dụng cao thay vì lý thuyết." 3 số liệu: 10 năm kinh nghiệm bán lẻ/telesale · 1000+ hợp đồng tư vấn & chốt sale thành công · 5+ ngách tài chính đã triển khai phễu *(số thứ 3 — mặc định, có thể chỉnh sau)*. Ảnh: `public/assets/team/bui-van-thanh.jpg` (đã copy vào project) |
| 12 | Chính sách/cam kết | 1) Hoàn tiền 100% nếu học hết buổi 2 thấy không đáng, không hỏi lý do, giữ tài liệu đã nhận. 2) Không hứa thu nhập — chỉ cam kết hệ thống/template/chấm bài từng tuần. 3) Minh bạch cách kiếm tiền: học phí học viên + hoa hồng hệ thống nếu học viên tự nguyện vào đội nhóm sau này |
| 13 | Testimonial | Để trống trong bản đầu — bổ sung sau khi có học viên thật (không được tự tạo testimonial giả) |
| 14 | Liên hệ | Chỉ Zalo: 0964938167. Không có SĐT gọi riêng/email/địa chỉ |
| 15 | Trang phụ | Không cần thêm ngoài các trang mặc định (login, change-password, dashboard, upgrade) |
| 16 | Popup — điều kiện hiện | Hiện ngay khi trang tải xong (không delay, không theo scroll) |
| 17 | Popup — nội dung & tần suất | Tiêu đề: "Đăng ký giữ suất Khóa 1 — chỉ 25 suất". Mô tả: "Để lại thông tin, tôi trả lời và giữ suất cho bạn trong 24h." Đóng popup → không hiện lại trong cùng phiên (sessionStorage); phiên truy cập mới thì hiện lại (không giới hạn kiểu "mỗi ngày 1 lần") |
| 18 | Member portal — quyền Free | Xem lịch học/thông tin chương trình (nội dung công khai). Tài liệu khóa học thật (video buổi học, bộ 12 template...) chỉ mở khi đã đóng phí — kiểm tra quyền ở server (RULE-04) |
| 19 | Hạng thành viên trả phí | 1 hạng duy nhất: **"Thành viên chính thức"** — mở toàn bộ tài liệu/video/template của khóa |
| 20 | Giao diện phân hạng | Badge màu xám cho Free, màu vàng gold `#FFD700` cho "Thành viên chính thức". Nội dung khác nhau ở phần tài liệu mở khóa |
| 21 | Trang nâng cấp | Giai đoạn 1: hiển thị thông tin gói "Khóa 1" (giá, quyền lợi) + hướng dẫn chuyển khoản/liên hệ Zalo, admin xác nhận thủ công. Cổng thanh toán online: để sau (không làm ở bản đầu) |

## Phần B — Backend (đã xác nhận)

| # | Mục | Nội dung |
|---|---|---|
| B.1 | Form đăng ký khác | Không cần — dùng chung đúng 1 popup đăng ký cho mọi nút CTA |
| B.2 | Xử lý dữ liệu đăng ký | Lưu DB qua `/api/register`. Khách thấy link Zalo (0964938167) để liên hệ ở màn hình cảm ơn. Admin (anh) nhận thông báo đăng ký mới **qua email tự động** (không dùng Zalo — cá nhân không có API push, xem B.7) |
| B.3 | Luồng tài khoản mặc định | Đúng theo mục B.1 của CLAUDE.md: mật khẩu mặc định `123456789` (bcrypt hash), `must_change_password = true`, bắt buộc đổi mật khẩu lần đăng nhập đầu |
| B.4 | Hạng thành viên (membership_tiers) | Free (mặc định) — xem lịch học/thông tin chương trình. Thành viên chính thức (sau khi đóng phí Khóa 1) — mở toàn bộ video/template/tài liệu |
| B.5 | Trang admin | Có — xem danh sách đăng ký, danh sách thành viên theo hạng, xác nhận thủ công khi có người chuyển khoản nâng cấp. Chỉ mình anh (buivanthanh18051993@gmail.com) có quyền truy cập *(mặc định 1 admin — có thể thêm sau)* |
| B.6 | Nâng cấp/thanh toán | Giai đoạn 1: chuyển khoản thủ công + admin xác nhận tay trong trang admin. Cổng thanh toán online: làm sau (không có trong bản đầu) |
| B.7 | Email tự động | Dùng **Resend** (free tier, hợp với Next.js/Vercel). Gửi thông báo đăng ký mới về **buivanthanh18051993@gmail.com** |
| B.8 | Domain | Dùng domain tạm Vercel (`ten-du-an.vercel.app`) trước, kết nối domain thật sau khi anh mua |
| B.9 | Tài khoản Vercel/Supabase | Anh đã có sẵn tài khoản cả hai. Claude Code sẽ nhờ anh chạy `vercel login` / `supabase login` (xác thực qua trình duyệt, không chia sẻ mật khẩu) khi tới bước deploy thật |
| B.10 | Giới hạn đăng ký | **Không giới hạn số lượng** đăng ký (bỏ mốc cứng 25 suất). Có **rate limit chống spam** — chặn 1 SĐT/IP đăng ký lặp lại liên tục trong thời gian ngắn (RULE-08/09) |
| B.11 | Công cụ nội bộ khác | Trang admin có nút **xuất danh sách đăng ký ra Excel/CSV** |
| B.12 | Yêu cầu bảo mật riêng | Không có yêu cầu đặc biệt ngoài 12 nguyên tắc trong `12-NGUYEN-TAC-BAO-MAT.md` — áp dụng đúng chuẩn mặc định |

## Môi trường máy đã chuẩn bị

- Node.js LTS v24.18.0 + npm 11.16.0 đã cài qua winget (2026-07-11)
- Ảnh giảng viên đã có sẵn tại `public/assets/team/bui-van-thanh.jpg`
- Project Next.js 16 (App Router, Tailwind v4) đã khởi tạo và build thành công tại gốc `D:\thanh`
- `.env.local` đã có sẵn `AUTH_SECRET` và `ADMIN_PASSWORD_HASH` (đã sinh ngẫu nhiên, không lưu mật khẩu dạng thường trong file — RULE-07). Mật khẩu đăng nhập admin plaintext đã gửi 1 lần trong chat, không lặp lại ở đây để tránh lộ khi file này được commit lên git sau này.
- `ADMIN_EMAIL=buivanthanh18051993@gmail.com` dùng để đăng nhập `/admin`

## Quyết định bảo mật đã chốt

- **Rủi ro chấp nhận (2026-07-11):** Hệ thống hiện không xác minh quyền sở hữu số điện thoại khi đăng ký qua popup (không có OTP SMS) — về lý thuyết ai đó có thể "đăng ký" bằng SĐT của người khác rồi chiếm tài khoản trước khi chủ SĐT thật kịp đăng nhập. Đã giảm thiểu một phần bằng mật khẩu mặc định sinh ngẫu nhiên riêng từng tài khoản (không còn là hằng số đoán được), nhưng chưa chặn triệt để được kịch bản trên. **Quyết định:** chấp nhận rủi ro này ở giai đoạn MVP (khối lượng đăng ký còn ít, có email thông báo admin mỗi khi có đăng ký mới để phát hiện bất thường thủ công) thay vì tích hợp OTP SMS (tốn phí, cần thêm hạ tầng, đổi UX). Cân nhắc bổ sung OTP SMS khi lượng học viên tăng hoặc có dấu hiệu bị lạm dụng — xem chi tiết kịch bản khai thác trong lịch sử review bảo mật.

## Việc cần anh làm trước khi deploy (chưa có sẵn — Claude Code không tự tạo được)

1. **Supabase**: tạo project mới tại supabase.com → vào SQL Editor, chạy toàn bộ nội dung [supabase/schema.sql](supabase/schema.sql) → copy `Project URL` và `service_role key` (Settings > API) vào `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
2. **Upstash Redis**: tạo free database tại console.upstash.com → copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` vào `.env.local`.
3. **Resend**: tạo tài khoản tại resend.com → lấy API key → điền `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (domain đã xác minh hoặc `onboarding@resend.dev` để test) vào `.env.local`. `ADMIN_NOTIFY_EMAIL` đã điền sẵn.
4. **Vercel/Supabase CLI login**: chạy `vercel login` và (nếu cần) `supabase login` — mở trình duyệt để anh tự xác thực, không cần đưa mật khẩu.
5. Sau khi có đủ giá trị thật trong `.env.local`, khai báo lại y hệt các biến đó trên Vercel Dashboard (Project Settings > Environment Variables) trước khi deploy.
