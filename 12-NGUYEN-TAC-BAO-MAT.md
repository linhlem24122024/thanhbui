# 🔐 12 Nguyên Tắc Bắt Buộc Khi Xây Dựng Web An Toàn

Đúc kết từ lỗ hổng thực tế — không phải lý thuyết. Check từng cái trước khi deploy.

## Mục lục

- Nhóm 1 — Xác thực & Phân quyền
- Nhóm 2 — XSS & Output Security
- Nhóm 3 — Mật khẩu & Mã hóa
- Nhóm 4 — Rate Limiting
- Nhóm 5 — Database Security
- Nhóm 6 — Error Handling
- Checklist Deploy

## Nhóm 1 — Xác thực & Phân quyền

### 🔴 RULE-01 — KHÔNG BAO GIỜ lưu secret trong source code

Lý do: Ai cũng đọc được qua F12 → Page Source. Khi push GitHub, secret tồn tại mãi trong git history dù đã xóa.

```js
// ❌ SAI — lộ secret
const ADMIN_PASS = "...";   // viết thẳng vào code
const DB_KEY     = "...";
const API_SECRET = "...";

// ✅ ĐÚNG — dùng env var
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const API_SECRET  = process.env.ADMIN_TOKEN_SECRET;
```

Quy tắc: Secret chỉ được phép nằm trong file `.env` và KHÔNG được commit lên git. Thêm vào `.gitignore`:
```
.env
.env.local
.env.production
```

### 🔴 RULE-02 — Mọi API thay đổi dữ liệu PHẢI xác thực trước

Lý do: Endpoint không cần đăng nhập mà có thể INSERT/UPDATE/DELETE = hacker gọi thoải mái, không giới hạn.

```js
// ❌ SAI — không auth, ai cũng gọi được
export default async function handler(req, res) {
  const { phone, action } = req.body;
  await db.update({ phone, status: 'active' });
  res.json({ ok: true });
}

// ✅ ĐÚNG — verify token TRƯỚC khi thực thi
export default async function handler(req, res) {
  const { token, action } = req.body;
  const user = verifyToken(token, process.env.SECRET);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  await db.update({ phone: user.phone, status: 'active' });
  res.json({ ok: true });
}
```

### 🔴 RULE-03 — KHÔNG gọi database trực tiếp từ frontend

Lý do: Code JS frontend hiển thị trong DevTools — ai cũng thấy. API key trong frontend = trao chìa khóa database cho hacker.

```js
// ❌ SAI — ghi thẳng từ frontend, API key lộ
await fetch(DB_URL + '/members', {
  method: 'POST',
  headers: { apikey: PUBLIC_KEY, Authorization: 'Bearer ' + PUBLIC_KEY },
  body: JSON.stringify({ name, phone })
});

// ✅ ĐÚNG — frontend chỉ gọi API của mình
await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, phone })
});
// Trong /api/register.js (server-side): dùng process.env.SUPABASE_SERVICE_KEY
```

### 🔴 RULE-04 — Logic phân quyền PHẢI ở server, không tin frontend

Lý do: JS ở frontend có thể bị sửa trong DevTools. Hacker chỉ cần gõ `currentUser.plan = 'vip'` vào console là xong.

```js
// ❌ SAI — check quyền ở frontend, data VIP đã load hết vào DOM, chỉ ẩn bằng CSS
function showVipContent() {
  if (currentUser.plan === 'vip') show('vip-content');
}

// ✅ ĐÚNG — server verify trước khi trả data
// api/vip-content.js
async function handler(req, res) {
  const { phone } = req.body;
  const member = await getMemberFromDB(phone);
  if (member.plan !== 'vip' || member.status !== 'active') {
    return res.status(403).json({ error: 'Không có quyền' });
  }
  return res.json({ data: vipContent });
}
```

## Nhóm 2 — XSS & Output Security

### 🔴 RULE-05 — ESCAPE mọi data từ DB/user trước khi render HTML

Lý do: Hacker chèn `<script>document.cookie</script>` vào database → nếu render thẳng vào innerHTML thì script chạy trên máy TẤT CẢ người dùng → đánh cắp session token, redirect lừa đảo.

```js
// ❌ SAI — XSS vulnerability
el.innerHTML = data.text;
container.innerHTML = `<p>${data.userInput}</p>`;

// ✅ ĐÚNG — escape tất cả data từ bên ngoài
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
el.innerHTML = escapeHTML(data.text);
container.innerHTML = `<p>${escapeHTML(data.userInput)}</p>`;

// Hoặc dùng textContent thay innerHTML khi không cần HTML:
el.textContent = data.text;  // tự động an toàn
```

Quy tắc vàng: Nếu data không phải do bạn viết cứng trong code → PHẢI escape.

### 🔴 RULE-06 — KHÔNG dùng CSS để ẩn nội dung nhạy cảm

Lý do: `display: none` chỉ ẩn về mặt thị giác. Data vẫn trong DOM, đọc được bằng DevTools hoặc `document.body.innerHTML` trong console.

```html
<!-- ❌ SAI — data đã nằm trong HTML, chỉ ẩn bằng CSS -->
<div id="vip-content" style="display:none">
  Link nhóm VIP: zalo.me/abc123
  Tài liệu mật: drive.google.com/xyz
</div>
<!-- Hacker: document.getElementById('vip-content').style.display='block' -->

<!-- ✅ ĐÚNG — không có data nào trong HTML ban đầu -->
<div id="vip-content"></div>
<script>
// Chỉ fetch khi server đã xác nhận có quyền
if (await verifyMembership(phone)) {
  const data = await fetch('/api/vip-data').then(r => r.json());
  renderContent(data);
} else {
  showUpgradeBanner();
}
</script>
```

## Nhóm 3 — Mật khẩu & Mã hóa

### 🔴 RULE-07 — Dùng bcrypt/argon2 cho password — KHÔNG dùng SHA-256, MD5

Lý do: SHA-256 được thiết kế để nhanh (GPU hash 1 tỷ lần/giây). Hacker dump database → chạy wordlist → crack toàn bộ password trong vài giờ. bcrypt cố tình chậm với cost factor — crack 1 password mất hàng tuần.

```js
// ❌ SAI — SHA-256 không có salt
const hash = await sha256(password);

// ✅ ĐÚNG — bcrypt với salt tự động
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 12);  // cost factor = 12
await db.save({ password: hash });
const isCorrect = await bcrypt.compare(inputPassword, storedHash);
```

Lưu ý: SHA-256 vẫn được dùng cho HMAC token signing, checksum file — không sai. Chỉ sai khi dùng để hash password trực tiếp.

## Nhóm 4 — Rate Limiting

### 🟠 RULE-08 — Tất cả endpoint login/register PHẢI có rate limit

Lý do: Không có rate limit = hacker thử 1 triệu password trong vài phút (brute force). Đặc biệt nguy hiểm cho trang admin login.

```js
// ✅ ĐÚNG — block sau 5 lần sai / 1 phút
const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
const key = `login_attempts:${ip}`;
const attempts = await redis.incr(key);
if (attempts === 1) await redis.expire(key, 60);
if (attempts > 5) {
  return res.status(429).json({ error: 'Quá nhiều lần thử. Thử lại sau 60 giây.' });
}
```

### 🟠 RULE-09 — Rate limit trên serverless PHẢI dùng Redis, không dùng biến in-memory

Lý do: Vercel/AWS Lambda tạo nhiều instance độc lập. `Map()` hay `{}` trong một instance không chia sẻ với instance khác → rate limit bị vô hiệu hóa hoàn toàn trong môi trường thực.

```js
// ✅ ĐÚNG — Redis (Upstash free tier)
import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();  // Env: UPSTASH_REDIS_REST_URL + TOKEN
const key = `login:${ip}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 60);
if (count > 10) return res.status(429).json({ error: 'Thử lại sau' });
```

Upstash có free tier 10,000 request/ngày — đủ dùng cho project nhỏ.

## Nhóm 5 — Database Security

### 🟠 RULE-10 — Bật RLS, anon key chỉ đọc data public tối thiểu

Lý do: Supabase anon key được gửi ra frontend → ai cũng có. Không có RLS = ai cũng có thể SELECT/INSERT/UPDATE/DELETE toàn bộ database.

```sql
-- ✅ ĐÚNG — bật RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Tạo VIEW ẩn field nhạy cảm (password, email riêng tư)
CREATE VIEW members_public AS
  SELECT id, phone, plan, status FROM members;

-- Chỉ cho anon đọc VIEW (không đọc được bảng gốc)
GRANT SELECT ON members_public TO anon;

-- Các thao tác write chỉ dùng SERVICE_KEY ở server (không lộ ra ngoài)
```

### 🟠 RULE-12 — Data trả phí PHẢI qua API có auth, không đọc thẳng bằng anon key

Lý do: Anon key trong frontend = ai cũng gọi API Supabase trực tiếp, bỏ qua toàn bộ logic kiểm tra plan.

```js
// ✅ ĐÚNG — qua API của mình, server verify trước
// api/reports.js
const member = await getMember(phone);
if (!member || member.status !== 'active') {
  return res.status(403).json({ error: 'Không có quyền' });
}
const data = await fetchReports(process.env.SUPABASE_SERVICE_KEY);
return res.json({ data });
```

## Nhóm 6 — Error Handling

### 🟡 RULE-11 — KHÔNG trả lỗi chi tiết về client

Lý do: Stack trace, tên bảng database, tên column, cấu trúc SQL = bản đồ cho hacker tấn công tiếp.

```js
// ✅ ĐÚNG — log internal, trả message chung cho client
try {
  const result = await dbQuery();
  res.json({ ok: true, result });
} catch (err) {
  console.error('[DB Error]', err);  // chỉ log ở server
  res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
}
```

## Checklist Deploy

Check từng cái trước khi go live:

**Secrets & Config**
- [ ] Không có password/API key/token nào viết thẳng trong code
- [ ] File `.env` đã có trong `.gitignore`, chưa bao giờ được commit
- [ ] Mọi secret đang ở đúng vị trí: biến môi trường trên Vercel/server

**Authentication & Authorization**
- [ ] Mọi API INSERT/UPDATE/DELETE đều verify token/session trước
- [ ] Logic phân quyền (VIP/admin/plan check) nằm ở server, không phải frontend JS
- [ ] Data trả phí không thể đọc trực tiếp bằng anon key

**Frontend Security**
- [ ] Không có `innerHTML = data.field` nào chưa được escape
- [ ] Không có nội dung nhạy cảm ẩn bằng `display:none` trong DOM
- [ ] Không có database URL + key nào trong file frontend

**Database**
- [ ] RLS đã bật trên tất cả bảng Supabase
- [ ] Anon key chỉ đọc được đúng data public tối thiểu
- [ ] SERVICE_KEY chỉ dùng ở server, không bao giờ ra frontend

**Password & Crypto**
- [ ] Password được hash bằng bcrypt hoặc argon2 (cost factor ≥ 10)
- [ ] Không có SHA-256/MD5 nào áp dụng trực tiếp lên password

**Rate Limiting**
- [ ] Endpoint login, register, admin-login đều có rate limiting
- [ ] Rate limit dùng Redis (Upstash) nếu deploy trên Vercel/serverless

**Error Handling**
- [ ] Không có `res.json({ error: err.message })` nào trả raw error về client
- [ ] Log lỗi chi tiết ở server (console.error hoặc logging service)

### Test nhanh trước khi deploy

```bash
# 1. Tìm secret có thể đang hardcode
grep -rn "password\s*=\s*['\"]" --include="*.js" --include="*.ts" --include="*.html" .
grep -rn "apikey\s*=\s*['\"]" --include="*.js" --include="*.ts" .

# 2. Tìm innerHTML không escape
grep -rn "innerHTML\s*=" --include="*.js" --include="*.ts" --include="*.html" .

# 3. Kiểm tra .env chưa bị commit
git log --all --full-history -- .env

# 4. Test rate limit bằng curl (thử 15 lần liên tục)
for i in {1..15}; do curl -s -X POST https://yoursite.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"<số điện thoại test>","password":"<mật khẩu sai>"}' | jq .error; done
```
