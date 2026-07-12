-- Schema cho Phễu Khách Tài Chính — theo CLAUDE.md mục B.0 + project-brief.md
-- Chạy file này trong Supabase SQL Editor (Project > SQL Editor > New query) SAU KHI đã tạo project Supabase.
-- RLS được bật ngay khi tạo bảng, đúng RULE-10 trong 12-NGUYEN-TAC-BAO-MAT.md — không để "làm sau".

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- members — tài khoản học viên (kể cả tạo tự động qua popup đăng ký)
-- ─────────────────────────────────────────────────────────────
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text not null,
  password_hash text not null,
  tier text not null default 'free' check (tier in ('free', 'paid')),
  interested_package_id text,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table members enable row level security;
-- Không tạo policy nào cho anon/authenticated: mọi truy cập đi qua API server-side
-- dùng SUPABASE_SERVICE_ROLE_KEY (bypass RLS). RULE-03/RULE-10.

-- View công khai tối thiểu — không gồm password_hash, không gồm phone/email
-- (thắt chặt hơn cả ví dụ trong 12-NGUYEN-TAC-BAO-MAT.md để bảo vệ thêm dữ liệu cá nhân).
-- Hiện tại chưa có luồng nào đọc view này bằng anon key (toàn bộ đi qua API server-side),
-- nhưng vẫn tạo sẵn theo đúng khuyến nghị RULE-10 để dự phòng nhu cầu đọc công khai sau này.
create or replace view members_public
  with (security_invoker = true) as
  select id, tier, created_at from members;

grant select on members_public to anon;

-- ─────────────────────────────────────────────────────────────
-- registrations — lượt đăng ký từ popup / nút "Đăng ký ngay"
-- ─────────────────────────────────────────────────────────────
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  package_id text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'upgraded')),
  created_at timestamptz not null default now()
);

alter table registrations enable row level security;
-- Ghi (INSERT) chỉ qua /api/register bằng service role key — RULE-03.

-- ─────────────────────────────────────────────────────────────
-- membership_tiers — tài liệu tham chiếu cho 2 hạng thành viên
-- (đọc công khai, ghi chỉ qua admin — hiện dashboard đang hiển thị tĩnh từ lib/content.ts,
-- bảng này giữ để đồng bộ dữ liệu khi cần mở rộng thêm hạng sau này)
-- ─────────────────────────────────────────────────────────────
create table if not exists membership_tiers (
  tier_key text primary key,
  display_name text not null,
  price text,
  benefits jsonb not null default '[]'::jsonb
);

alter table membership_tiers enable row level security;
drop policy if exists "membership_tiers public read" on membership_tiers;
create policy "membership_tiers public read" on membership_tiers for select using (true);

insert into membership_tiers (tier_key, display_name, price, benefits) values
  ('free', 'Free', '0đ', '["Xem lịch học/thông tin chương trình"]'),
  ('paid', 'Thành viên chính thức', '1.290.000đ', '["Mở toàn bộ video buổi học, bộ 12 template, tài liệu khóa"]')
on conflict (tier_key) do nothing;

-- ─────────────────────────────────────────────────────────────
-- packages — tài liệu tham chiếu cho gói dịch vụ (hiện có 1 gói "Khóa 1")
-- Đọc công khai, ghi chỉ qua admin. Frontend hiện đang hiển thị tĩnh từ lib/content.ts;
-- bảng này giữ để đồng bộ khi có nhiều gói / cần admin chỉnh giá qua trang quản trị sau này.
-- ─────────────────────────────────────────────────────────────
create table if not exists packages (
  id text primary key,
  name text not null,
  price text not null,
  seats text,
  benefits jsonb not null default '[]'::jsonb
);

alter table packages enable row level security;
drop policy if exists "packages public read" on packages;
create policy "packages public read" on packages for select using (true);

insert into packages (id, name, price, seats, benefits) values
  ('khoa-1', 'Khóa 1', '1.290.000đ', '25 suất', '[
    "6 buổi Zoom trực tiếp 90 phút (bản ghi giữ 6 tháng)",
    "Bộ 12 template cầm tay",
    "Chấm bài từng người, từng tuần",
    "Bài học lọc hồ sơ trước khi gửi link"
  ]')
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- sessions — nội dung timeline 6 tuần (đọc công khai)
-- ─────────────────────────────────────────────────────────────
create table if not exists sessions (
  step int primary key,
  time_label text not null,
  title text not null,
  tags jsonb not null default '[]'::jsonb
);

alter table sessions enable row level security;
drop policy if exists "sessions public read" on sessions;
create policy "sessions public read" on sessions for select using (true);

insert into sessions (step, time_label, title, tags) values
  (1, 'Tuần 1', 'Định vị & chọn sân đấu', '["Định vị", "Chọn ngách"]'),
  (2, 'Tuần 2', 'Dựng group + bộ content 6-3-1', '["Group", "Content"]'),
  (3, 'Tuần 3', 'Kịch bản chat 4 nhịp', '["Kịch bản chat"]'),
  (4, 'Tuần 4', 'Lọc hồ sơ & xin giới thiệu', '["Lọc hồ sơ", "Giới thiệu"]'),
  (5, 'Tuần 5', 'Bán chéo & đo số', '["Bán chéo", "Đo lường"]'),
  (6, 'Tuần 6', 'Lên hệ thống + Lễ khai phễu tốt nghiệp', '["Hệ thống", "Tốt nghiệp"]')
on conflict (step) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Index hỗ trợ tra cứu admin
-- ─────────────────────────────────────────────────────────────
create index if not exists registrations_created_at_idx on registrations (created_at desc);
create index if not exists members_phone_idx on members (phone);
