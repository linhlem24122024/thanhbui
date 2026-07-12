# 🔐 Cẩm Nang Bảo Mật Web

## 21 Nguyên Tắc Bắt Buộc Khi Xây Dựng Web An Toàn

> Chuẩn theo **OWASP Top 10 (2021)** · **OWASP ASVS** · Stack **Next.js + Supabase / Serverless**
> Đúc kết từ lỗ hổng thực tế — In ra, dán lên màn hình, check từng cái trước khi deploy.

**Mức độ nghiêm trọng:** 🔴 Critical (dẫn đến chiếm quyền / rò dữ liệu) · 🟠 High · 🟡 Medium

---

## Mục Lục

- [Nhóm 1 — Quản lý Secret & Cấu hình](#nhóm-1--quản-lý-secret--cấu-hình)
- [Nhóm 2 — Xác thực (Authentication)](#nhóm-2--xác-thực-authentication)
- [Nhóm 3 — Phân quyền (Authorization) & IDOR](#nhóm-3--phân-quyền-authorization--idor)
- [Nhóm 4 — Validate Đầu vào & Injection](#nhóm-4--validate-đầu-vào--injection)
- [Nhóm 5 — XSS, Output Encoding & CSP](#nhóm-5--xss-output-encoding--csp)
- [Nhóm 6 — CSRF, Session & Cookie](#nhóm-6--csrf-session--cookie)
- [Nhóm 7 — Mật khẩu & Mã hóa](#nhóm-7--mật-khẩu--mã-hóa)
- [Nhóm 8 — Rate Limiting & Brute Force](#nhóm-8--rate-limiting--brute-force)
- [Nhóm 9 — Database Security (RLS)](#nhóm-9--database-security-rls)
- [Nhóm 10 — Transport & Security Headers](#nhóm-10--transport--security-headers)
- [Nhóm 11 — Error Handling & Logging](#nhóm-11--error-handling--logging)
- [Nhóm 12 — Dependencies & Supply Chain](#nhóm-12--dependencies--supply-chain)
- [✅ Checklist Deploy](#-checklist-deploy)
- [🧪 Test Nhanh Trước Khi Deploy](#-test-nhanh-trước-khi-deploy)

---

## Nhóm 1 — Quản lý Secret & Cấu hình

### 🔴 RULE-01 — KHÔNG BAO GIỜ lưu secret trong source code `[OWASP A05]`

**Vì sao:** Code frontend ai cũng đọc được qua F12 → Page Source. Khi push lên GitHub, secret tồn tại mãi trong git history dù đã xóa ở commit sau.

```js
// ❌ SAI — lộ secret
const ADMIN_PASS = "s3cr3t";    // viết thẳng vào code
const DB_KEY     = "eyJhbG...";  // bị lộ khi push git

// ✅ ĐÚNG — dùng biến môi trường, chỉ đọc ở server
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const API_SECRET  = process.env.ADMIN_TOKEN_SECRET;

// Nếu thiếu secret → fail nhanh, không chạy tiếp
if (!process.env.SUPABASE_SERVICE_KEY) throw new Error("Missing env");
```

**Quy tắc:** Secret chỉ nằm trong `.env` và KHÔNG commit. Thêm vào `.gitignore`:

```gitignore
.env
.env.local
.env.production
.env*.local
```

> ⚡ **Ghi nhớ:** Lỡ commit secret rồi thì coi như đã lộ — PHẢI xoay (rotate) secret đó ngay, không chỉ xóa file. Dùng `git-secrets` / `gitleaks` để quét tự động.

---

### 🔴 RULE-02 — Phân tách rõ anon key (client) và service key (server) `[OWASP A05]`

**Vì sao:** Anon/public key được thiết kế để lộ ra frontend (bị giới hạn bởi RLS). Service key bỏ qua mọi RLS — nếu lọt ra client là hacker toàn quyền database.

```js
// Client (browser): CHỈ dùng anon key
createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Server (API route): dùng service key, KHÔNG prefix NEXT_PUBLIC
createClient(URL, process.env.SUPABASE_SERVICE_KEY)
```

> ⚡ **Ghi nhớ:** Bất kỳ biến nào có tiền tố `NEXT_PUBLIC_` (Next.js) hay `VITE_` (Vite) đều bị nhúng vào bundle client → tuyệt đối không đặt service key vào đó.

---

## Nhóm 2 — Xác thực (Authentication)

### 🔴 RULE-03 — Mọi API thay đổi dữ liệu PHẢI xác thực trước `[OWASP A01]`

**Vì sao:** Endpoint INSERT/UPDATE/DELETE mà không cần đăng nhập = hacker gọi thoải mái, không giới hạn.

```js
// ❌ SAI — không auth, ai cũng gọi được
export default async function handler(req, res) {
  const { phone, status } = req.body;
  await db.update({ phone, status });   // không kiểm tra gì!
  res.json({ ok: true });
}

// ✅ ĐÚNG — verify token TRƯỚC khi thực thi
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Bước 1: Xác thực bắt buộc, lấy token từ header
  const token = req.headers.authorization?.replace("Bearer ", "");
  const user = verifyToken(token, process.env.ADMIN_TOKEN_SECRET);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // Bước 2: Dùng danh tính TỪ TOKEN, không từ body
  await db.update({ phone: user.phone, status: "active" });
  res.json({ ok: true });
}
```

> ⚡ **Ghi nhớ:** Token nên đặt ở header `Authorization`, không đặt trong body/URL. JWT phải có hạn (`exp`) ngắn và verify cả chữ ký lẫn hạn.

---

### 🔴 RULE-04 — KHÔNG gọi database trực tiếp từ frontend `[OWASP A01]`

**Vì sao:** Code JS frontend hiển thị trong DevTools. API key trong frontend = trao chìa khóa database cho hacker.

```js
// ❌ SAI — ghi thẳng từ frontend, key lộ
await fetch(DB_URL + "/rest/v1/members", {
  method: "POST",
  headers: { apikey: KEY, Authorization: "Bearer " + KEY },
  body: JSON.stringify({ name, phone })
});

// ✅ ĐÚNG — frontend chỉ gọi API của mình, server xử lý DB
await fetch("/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, phone })
});
// Trong /api/register.js (server) mới dùng SERVICE_KEY
```

---

## Nhóm 3 — Phân quyền (Authorization) & IDOR

### 🔴 RULE-05 — Logic phân quyền PHẢI ở server, không tin frontend `[OWASP A01]`

**Vì sao:** JS ở frontend có thể bị sửa trong DevTools. Hacker chỉ cần gõ `currentUser.plan = "vip"` vào console là xong.

```js
// ❌ SAI — check quyền ở frontend, data đã load sẵn vào DOM
if (currentUser.plan === "vip") show("vip-content"); // sửa được!

// ✅ ĐÚNG — server verify trước khi trả data
// api/vip-content.js
const user = verifyToken(req.headers.authorization); // danh tính thật
if (!user) return res.status(401).json({ error: "Unauthorized" });
const member = await getMemberFromDB(user.id);
if (member.plan !== "vip" || member.status !== "active")
  return res.status(403).json({ error: "Không có quyền" });
return res.json({ data: vipContent }); // chỉ trả khi đã verify
```

---

### 🔴 RULE-06 — Danh tính lấy từ TOKEN, không bao giờ từ body/query (chống IDOR) `[OWASP A01]`

**Vì sao:** Đây là lỗi bị bỏ quên nhiều nhất. Nếu server tin `id`/`phone` do client gửi trong body, một user đã đăng nhập chỉ cần đổi `id` sang của người khác là đọc/sửa dữ liệu người đó (**IDOR** — leo thang quyền ngang).

```js
// ❌ SAI — tin phone từ body → IDOR
const { phone } = req.body;              // client tự khai!
const member = await getMemberFromDB(phone);
return res.json({ data: member.reports });
// Hacker đổi "phone" sang số người khác → đọc data người đó

// ✅ ĐÚNG — danh tính suy ra từ token đã verify
const user = verifyToken(req.headers.authorization);
if (!user) return res.status(401).json({ error: "Unauthorized" });

// Không lấy id từ body — lấy từ token server đã ký
const member = await getMemberFromDB(user.id);
return res.json({ data: member.reports });
```

> ⚡ **Ghi nhớ:** Nếu bắt buộc nhận `id` từ client (ví dụ xem 1 resource cụ thể), PHẢI kiểm tra resource đó THUỘC về user trong token: `WHERE id = :resourceId AND owner_id = :user.id`.

---

## Nhóm 4 — Validate Đầu vào & Injection

### 🔴 RULE-07 — Validate & whitelist mọi input trước khi xử lý `[OWASP A03]`

**Vì sao:** Input không kiểm soát = cửa cho injection, tràn kiểu dữ liệu, lỗi logic. Đừng tin độ dài, kiểu, hay định dạng client gửi.

```js
// ✅ ĐÚNG — dùng schema validation (Zod)
import { z } from "zod";
const Schema = z.object({
  name:  z.string().trim().min(1).max(100),
  phone: z.string().regex(/^0\d{9}$/),
  plan:  z.enum(["free", "vip"]),   // whitelist, không nhận giá trị lạ
});
const parsed = Schema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
const { name, phone, plan } = parsed.data;
```

---

### 🔴 RULE-08 — Chống SQL Injection: luôn dùng parameterized query `[OWASP A03]`

**Vì sao:** Nối chuỗi trực tiếp input vào câu SQL = hacker chèn `"; DROP TABLE ..."` hoặc `"OR 1=1"` để đọc toàn bộ bảng.

```js
// ❌ SAI — nối chuỗi
db.query("SELECT * FROM users WHERE email = '" + email + "'");

// ✅ ĐÚNG — tham số hóa, hoặc dùng query builder / ORM
db.query("SELECT * FROM users WHERE email = $1", [email]);
// Supabase: supabase.from("users").select().eq("email", email)
```

---

## Nhóm 5 — XSS, Output Encoding & CSP

### 🔴 RULE-09 — Encode mọi data từ DB/user theo đúng ngữ cảnh trước khi render `[OWASP A03]`

**Vì sao:** Hacker chèn `<script>` vào database → nếu render thẳng vào `innerHTML`, script chạy trên máy TẤT CẢ người dùng → đánh cắp session, redirect lừa đảo.

```js
// ❌ SAI — XSS vulnerability
el.innerHTML = data.text;
container.innerHTML = `<p>${data.userInput}</p>`;

// ✅ ĐÚNG — ưu tiên textContent; cần HTML thì sanitize
// Mặc định: dùng textContent, tự động an toàn
el.textContent = data.text;

// Nếu BẮT BUỘC render HTML động → sanitize bằng DOMPurify
import DOMPurify from "dompurify";
el.innerHTML = DOMPurify.sanitize(data.richText);
```

> ⚡ **Ghi nhớ:** Encode phải THEO NGỮ CẢNH: HTML body, thuộc tính (attribute), JavaScript, và URL cần cách escape KHÁC nhau. Escape kiểu `textContent` không đủ khi chèn vào attribute hay `href`. React/Vue tự escape — nhưng `dangerouslySetInnerHTML` / `v-html` thì vẫn phải sanitize.

---

### 🟠 RULE-10 — Bật Content-Security-Policy (CSP) làm lớp chặn thứ hai `[OWASP A05]`

**Vì sao:** CSP là lưới an toàn: kể cả khi lọt một lỗ XSS, CSP chặn trình duyệt thực thi script lạ hay gửi data ra domain ngoài.

```http
# next.config.js — headers()
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

---

### 🟡 RULE-11 — KHÔNG dùng CSS để ẩn nội dung nhạy cảm `[OWASP A01]`

**Vì sao:** `display:none` chỉ ẩn về thị giác. Data vẫn nằm trong DOM, đọc được bằng DevTools hoặc `document.body.innerHTML`.

```html
<!-- ❌ SAI — data đã nằm trong HTML, chỉ ẩn bằng CSS -->
<div id="vip" style="display:none">Link VIP: zalo.me/abc</div>
<!-- Hacker: $("#vip").style.display = "block" -->

<!-- ✅ ĐÚNG — không render data cho đến khi server xác nhận quyền -->
<div id="vip"></div>
<script>
  const r = await fetch("/api/vip-data"); // server verify trước
  if (r.ok) renderContent(await r.json());
  else showUpgradeBanner();
</script>
```

---

## Nhóm 6 — CSRF, Session & Cookie

### 🔴 RULE-12 — Bảo vệ session cookie: HttpOnly + Secure + SameSite `[OWASP A05 / A07]`

**Vì sao:** Cookie không `HttpOnly` → XSS đọc được token. Không `Secure` → bị sniff qua HTTP. Không `SameSite` → dính CSRF.

```js
// ✅ ĐÚNG — set cookie đúng flag
res.setHeader("Set-Cookie", [
  `session=${token}`,
  "HttpOnly",           // JS không đọc được → chống XSS lấy token
  "Secure",             // chỉ gửi qua HTTPS
  "SameSite=Lax",       // chống CSRF cơ bản
  "Path=/",
  "Max-Age=3600",       // token có hạn
].join("; "));
```

---

### 🔴 RULE-13 — Chống CSRF cho mọi request thay đổi trạng thái `[OWASP A01]`

**Vì sao:** Nếu dùng cookie để auth, trình duyệt tự đính kèm cookie vào mọi request — kể cả request do trang độc giả mạo. Hacker lừa nạn nhân bấm link là thực hiện hành động thay danh nghĩa họ.

- **Cách 1:** `SameSite=Strict/Lax` cho cookie (chặn phần lớn CSRF).
- **Cách 2:** CSRF token (double-submit / synchronizer token) cho form nhạy cảm.
- **Cách 3:** Dùng token ở header `Authorization` (Bearer) thay vì cookie — trình duyệt không tự đính kèm header → miễn nhiễm CSRF.

---

## Nhóm 7 — Mật khẩu & Mã hóa

### 🔴 RULE-14 — Hash password bằng argon2id hoặc bcrypt — KHÔNG SHA-256/MD5 `[OWASP A02]`

**Vì sao:** SHA-256/MD5 được thiết kế để nhanh (GPU hash hàng tỷ lần/giây). Hacker dump DB → chạy wordlist → crack toàn bộ trong vài giờ. argon2/bcrypt cố tình chậm + salt → crack mất hàng tuần.

```js
// ✅ ĐÚNG — bcrypt với cost factor, salt tự động
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash(password, 12);   // cost >= 12
await db.save({ password: hash });
// Login:
const ok = await bcrypt.compare(inputPassword, storedHash);
```

> ⚡ **Ghi nhớ:** SHA-256 vẫn đúng cho HMAC token signing và checksum file — chỉ SAI khi hash password trực tiếp. Lưu ý bcrypt cắt password > 72 byte; nếu cần password dài, dùng argon2id.

---

## Nhóm 8 — Rate Limiting & Brute Force

### 🟠 RULE-15 — Mọi endpoint login/register/reset PHẢI có rate limit `[OWASP A07]`

**Vì sao:** Không rate limit = hacker thử 1 triệu password trong vài phút (brute force). Nguy hiểm nhất cho trang admin login.

```js
// ✅ ĐÚNG — giới hạn theo CẢ IP lẫn tài khoản
// Chặn theo IP tin cậy của platform (không tin x-forwarded-for thô)
const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
const ipKey   = `login:ip:${ip}`;
const userKey = `login:acc:${email}`;   // chống xoay IP nhắm 1 tài khoản

if (await tooMany(ipKey, 20, 60) || await tooMany(userKey, 5, 300))
  return res.status(429).json({ error: "Quá nhiều lần thử, thử lại sau." });
```

> ⚡ **Ghi nhớ:** `x-forwarded-for` do client gửi được → giả mạo được. Chỉ lấy IP từ header mà reverse-proxy/platform của bạn set (Vercel: `x-real-ip`). Chặn cả theo tài khoản để hacker xoay IP cũng không brute force nổi 1 user.

---

### 🟠 RULE-16 — Rate limit trên serverless PHẢI dùng Redis, không biến in-memory `[OWASP A04]`

**Vì sao:** Vercel/AWS Lambda tạo nhiều instance độc lập. `Map()` hay `{}` trong 1 instance không chia sẻ với instance khác → rate limit vô hiệu trong thực tế.

```js
// ❌ SAI — in-memory, chỉ work trên 1 instance
const attempts = new Map();  // instance khác không biết → cho qua

// ✅ ĐÚNG — Redis (Upstash), atomic, tránh race condition
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const rl = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});
const { success } = await rl.limit(`login:${ip}`);
if (!success) return res.status(429).json({ error: "Thử lại sau" });
```

> ⚡ **Ghi nhớ:** Dùng SDK `Ratelimit` thay vì tự viết `incr+expire` — tránh lỗi race condition khi `expire` không được set (key kẹt vĩnh viễn). Upstash free tier ~10.000 request/ngày, đủ cho project nhỏ.

---

## Nhóm 9 — Database Security (RLS)

### 🟠 RULE-17 — Bật RLS trên mọi bảng; view dùng security_invoker `[OWASP A01]`

**Vì sao:** Supabase anon key gửi ra frontend → ai cũng có. Không RLS = ai cũng SELECT/INSERT/UPDATE/DELETE toàn bộ DB.

```sql
-- ❌ SAI — tắt RLS hoặc grant quá rộng
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
GRANT ALL ON members TO anon;

-- ✅ ĐÚNG — bật RLS + policy cụ thể
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policy: user chỉ đọc đúng dòng của mình
CREATE POLICY "own_rows" ON members FOR SELECT
  USING (auth.uid() = user_id);

-- Nếu dùng VIEW cho anon: PHẢI security_invoker để view tôn trọng RLS
CREATE VIEW members_public
  WITH (security_invoker = true) AS
  SELECT id, plan, status FROM members;
```

> ⚡ **Ghi nhớ (BẪY NGUY HIỂM):** View trong Postgres mặc định chạy bằng quyền owner → BỎ QUA RLS của bảng gốc. Bắt buộc đặt `security_invoker=true` (Postgres 15+) nếu view để anon đọc, nếu không bạn đang rò đúng thứ RLS lẽ ra phải chặn. Write chỉ dùng SERVICE_KEY ở server.

---

### 🟠 RULE-18 — Data trả phí PHẢI qua API có auth, không đọc thẳng bằng anon key `[OWASP A01]`

**Vì sao:** Anon key trong frontend = ai cũng gọi API Supabase/Firebase trực tiếp, bỏ qua toàn bộ logic kiểm tra plan của bạn.

```js
// ❌ SAI — đọc thẳng bằng anon key
fetch(SB_URL + "/rest/v1/vip_reports", { headers: { apikey: ANON_KEY }})
// curl ...vip_reports -H "apikey: ANON_KEY" → vẫn có data

// ✅ ĐÚNG — qua API của mình, server verify + service key
const user = verifyToken(req.headers.authorization);
const member = await getMember(user.id);
if (!member || member.status !== "active")
  return res.status(403).json({ error: "Không có quyền" });
const data = await fetchReports(process.env.SUPABASE_SERVICE_KEY);
return res.json({ data });
```

---

## Nhóm 10 — Transport & Security Headers

### 🟠 RULE-19 — Ép HTTPS + HSTS + bộ security headers `[OWASP A05]`

**Vì sao:** Không HTTPS thì mọi token/mật khẩu bị nghe lén. Thiếu security headers = hở clickjacking, MIME sniffing, rò referrer.

```http
# next.config.js headers()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY            # chống clickjacking
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

> ⚡ **Ghi nhớ:** Phần lớn host (Vercel/Netlify) ép HTTPS sẵn, nhưng HSTS + các header trên vẫn phải tự khai báo. Không bao giờ đặt dữ liệu nhạy cảm trong URL/query string (bị log lại ở proxy, history).

---

## Nhóm 11 — Error Handling & Logging

### 🟡 RULE-20 — KHÔNG trả lỗi chi tiết về client `[OWASP A05 / A09]`

**Vì sao:** Stack trace, tên bảng, tên cột, cấu trúc SQL = bản đồ cho hacker tấn công tiếp.

```js
// ❌ SAI — lộ cấu trúc hệ thống
res.json({ error: err.message });
// "column pasword does not exist in table members" → hacker biết schema

// ✅ ĐÚNG — log ở server, trả message chung
try {
  const result = await dbQuery();
  res.json({ ok: true, result });
} catch (err) {
  console.error("[DB Error]", err);  // chỉ log ở server
  res.status(500).json({ error: "Đã xảy ra lỗi, vui lòng thử lại" });
}
```

> ⚡ **Ghi nhớ:** Ngược lại, đừng log secret/password/token vào console hay logging service — log cũng là nơi rò dữ liệu. Redact trước khi log.

---

## Nhóm 12 — Dependencies & Supply Chain

### 🟡 RULE-21 — Quét & cập nhật dependency, khóa phiên bản `[OWASP A06]`

**Vì sao:** Phần lớn code trong app là của bên thứ ba. Một package có CVE = cửa hậu mà bạn không viết dòng nào.

- Chạy `npm audit` định kỳ; bật **Dependabot/Renovate** trên GitHub.
- Commit `package-lock.json` để khóa phiên bản (reproducible build).
- Chỉ cài package có uy tín; cảnh giác **typosquatting** (tên gần giống package thật).
- Không dán script/lệnh lạ từ mạng chạy thẳng vào terminal khi chưa đọc.

---

## ✅ Checklist Deploy

In ra và check từng cái trước khi go live:

**Secrets & Config**
- [ ] Không có password/API key/token nào viết thẳng trong code
- [ ] File `.env` đã có trong `.gitignore`, chưa bao giờ bị commit
- [ ] Service key chỉ ở server, không bao giờ có tiền tố `NEXT_PUBLIC_`/`VITE_`
- [ ] Secret lỡ commit đã được rotate, không chỉ xóa

**Authentication & Authorization**
- [ ] Mọi API INSERT/UPDATE/DELETE đều verify token/session trước
- [ ] Danh tính lấy từ token đã verify, KHÔNG từ body/query (chống IDOR)
- [ ] Logic phân quyền (VIP/admin/plan) nằm ở server, không frontend
- [ ] Data trả phí không đọc được trực tiếp bằng anon key

**Input & Injection**
- [ ] Mọi input được validate bằng schema (Zod/tương đương)
- [ ] Không có câu SQL nối chuỗi; dùng parameterized query/ORM

**Frontend & XSS**
- [ ] Không có `innerHTML = data` chưa encode/sanitize
- [ ] Content-Security-Policy đã bật
- [ ] Không có nội dung nhạy cảm ẩn bằng `display:none` trong DOM
- [ ] Không có database URL + key trong file frontend

**Session, Cookie & CSRF**
- [ ] Session cookie có `HttpOnly` + `Secure` + `SameSite`
- [ ] Có cơ chế chống CSRF (SameSite / CSRF token / Bearer header)

**Password & Crypto**
- [ ] Password hash bằng bcrypt hoặc argon2id (cost >= 12)
- [ ] Không có SHA-256/MD5 hash password trực tiếp

**Rate Limiting**
- [ ] Endpoint login/register/reset/admin đều có rate limit
- [ ] Rate limit chặn cả theo IP lẫn tài khoản, dùng Redis trên serverless

**Database**
- [ ] RLS đã bật trên tất cả bảng
- [ ] View cho anon dùng `security_invoker = true`
- [ ] Anon key chỉ đọc đúng data public tối thiểu

**Transport & Headers**
- [ ] HTTPS được ép + HSTS bật
- [ ] Có `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

**Error & Logging**
- [ ] Không trả raw error (`err.message`) về client
- [ ] Log ở server nhưng không log secret/password/token

**Dependencies**
- [ ] `npm audit` sạch; Dependabot/Renovate đang bật
- [ ] `package-lock.json` đã commit

---

## 🧪 Test Nhanh Trước Khi Deploy

```bash
# 1. Tìm secret hardcode
grep -rniE "(password|apikey|secret|token)\s*[:=]\s*['\"]" \
  --include=*.js --include=*.ts --include=*.html .

# 2. Tìm innerHTML không an toàn
grep -rn "innerHTML\s*=" --include=*.js --include=*.ts --include=*.html .

# 3. Kiểm tra .env chưa bị commit (phải trống)
git log --all --full-history -- .env .env.local

# 4. Quét lỗ hổng dependency
npm audit --production

# 5. Quét secret toàn bộ lịch sử git
npx gitleaks detect --source . --verbose

# 6. Test rate limit (thử 15 lần liên tục — phải thấy 429)
for i in $(seq 1 15); do \
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  https://yoursite.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@x.com","password":"wrong"}'; done

# 7. Test IDOR (đổi id sang của người khác — phải 401/403)
curl https://yoursite.com/api/reports?id=OTHER_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

> **Tham chiếu:** OWASP Top 10 (2021), OWASP ASVS, OWASP Cheat Sheet Series.
> Checklist này bao phủ các lỗ hổng phổ biến nhất cho web app nhỏ/vừa — với hệ thống lớn/nhạy cảm nên thuê pentest độc lập.
