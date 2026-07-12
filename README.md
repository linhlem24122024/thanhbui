# Phễu Khách Tài Chính

Website bán khóa học "Phễu Khách Tài Chính" — hệ thống quản lý học viên, tài liệu khóa, và nâng cấp hạng thành viên.

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth) |
| Rate Limiting | Upstash Redis (free tier) |
| Email Notifications | Resend |
| Hosting | Vercel |
| Hash Password | bcryptjs |
| Validation | Zod |

## Cài đặt local

### 1. Cài dependencies
```bash
npm install
```

### 2. Setup biến môi trường
Sao chép `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```

Điền các giá trị thật vào `.env.local` (xem mục Setup bên dưới).

**Lưu ý:** `.env.local` không được commit lên git (đã có trong `.gitignore`).

## Setup Supabase

1. **Tạo project** trên [supabase.com](https://supabase.com)
2. **Chạy schema** trong SQL Editor:
   - Vào `Project > SQL Editor > New query`
   - Copy toàn bộ nội dung file `supabase/schema.sql` vào query editor
   - Chạy query (Ctrl+Enter)
3. **Lấy credentials**:
   - Vào `Project Settings > API` (tab Authentication)
   - Copy `Project URL` → điền `SUPABASE_URL` trong `.env.local`
   - Copy `service_role key` → điền `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`

## Setup Upstash Redis

1. **Tạo database** trên [console.upstash.com](https://console.upstash.com)
   - Chọn free tier
   - Copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
   - Điền vào `.env.local`

## Setup Resend

1. **Tạo tài khoản** trên [resend.com](https://resend.com) (free tier)
2. **Lấy API Key** từ dashboard → điền `RESEND_API_KEY` trong `.env.local`
3. **Sender Email**:
   - Nếu chưa xác minh domain: dùng `onboarding@resend.dev` (test mode)
   - Nếu có domain đã xác minh: dùng email từ domain đó
   - Điền `RESEND_FROM_EMAIL` + `ADMIN_NOTIFY_EMAIL` trong `.env.local`

## Chạy development

```bash
npm run dev
```

Mở trình duyệt → [http://localhost:3000](http://localhost:3000)

## Build production

```bash
npm run build
npm run start
```

## Deploy lên Vercel

### Qua CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Qua Vercel Dashboard
1. Push repo lên GitHub
2. Vào [vercel.com](https://vercel.com) → New Project → chọn repo
3. Vào `Settings > Environment Variables` → thêm tất cả biến từ `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ADMIN_NOTIFY_EMAIL`
4. Click "Deploy"

## Cấu trúc thư mục

```
D:\thanh/
├── CLAUDE.md                      # Hướng dẫn vibecode
├── 12-NGUYEN-TAC-BAO-MAT.md      # Quy tắc bảo mật bắt buộc
├── project-brief.md               # Tóm tắt yêu cầu
├── README.md                      # File này
├── .env.local                     # Biến môi trường (KHÔNG commit)
├── .env.example                   # Mẫu biến môi trường
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── assets/
│       └── team/
│           └── bui-van-thanh.jpg  # Ảnh giảng viên
├── app/
│   ├── page.tsx                   # Trang chủ
│   ├── login/page.tsx             # Đăng nhập
│   ├── change-password/page.tsx   # Đổi mật khẩu lần đầu
│   ├── dashboard/page.tsx         # Khu vực thành viên
│   ├── upgrade/page.tsx           # Nâng cấp gói
│   ├── admin/page.tsx             # Trang quản trị
│   ├── layout.tsx
│   └── api/
│       ├── register/route.ts      # Đăng ký (rate limit)
│       ├── login/route.ts         # Xác thực
│       ├── change-password/route.ts
│       └── ...                    # Các API khác
├── components/
│   ├── RegisterPopup.tsx
│   └── ...                        # Các component UI khác
├── lib/
│   ├── supabase.ts                # Khởi tạo Supabase client
│   ├── rate-limit.ts              # Upstash rate limit helper
│   ├── auth.ts                    # Xác thực JWT
│   └── ...                        # Utility khác
└── supabase/
    └── schema.sql                 # Database schema
```

## Quy trình đăng ký

1. Khách điền form popup → gửi `/api/register`
2. API tạo tài khoản với mật khẩu mặc định `123456789` (hash bcrypt)
3. Popup hiện "Cảm ơn" + link đăng nhập
4. **Lần đăng nhập đầu**: bắt buộc đổi mật khẩu trước khi vào dashboard (RULE-07 trong `12-NGUYEN-TAC-BAO-MAT.md`)
5. Dashboard: xem lịch học, template tài liệu (phải nâng cấp để mở video)
6. Nâng cấp: chuyển khoản + admin xác nhận thủ công ở trang `/admin`

## Ghi chú bảo mật

**Bắt buộc đọc trước khi chỉnh sửa backend:** [12-NGUYEN-TAC-BAO-MAT.md](12-NGUYEN-TAC-BAO-MAT.md)

**Quan trọng:**
- ✋ **KHÔNG** commit `.env.local` → biến môi trường nhạy cảm (API keys, mật khẩu hash)
- ✋ **KHÔNG** để lộ mật khẩu, API keys trong HTML/JS frontend (kiểm tra xem có hardcode không)
- ✋ Mọi API endpoint cần kiểm tra quyền `tier` trước khi trả dữ liệu trả phí (xem `lib/auth.ts`)
- ✋ Rate limit bắt buộc trên `/api/register` + `/api/login` chống spam (xem `RULE-08/09`)
- ✋ Row Level Security (RLS) bật trên tất cả bảng Supabase — không được bỏ qua

## Scripts

```bash
npm run dev       # Chạy dev server (localhost:3000)
npm run build     # Build production
npm run start     # Chạy server production
npm run lint      # Lint code
```

## Liên hệ & Hỗ trợ

- **Zalo**: 0964938167
- **Email Admin**: buivanthanh18051993@gmail.com
