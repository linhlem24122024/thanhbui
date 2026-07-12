import type { NextConfig } from "next";

// CSP dùng 'unsafe-inline' cho script-src — đã thử cách "chuẩn" hơn (nonce riêng theo
// từng request qua middleware.ts, theo tài liệu Next.js) nhưng Next.js không tự gắn nonce
// vào các <script> nội bộ nó tạo ra trong bản build thực tế, khiến toàn bộ trang treo ở
// màn hình loading vì không hydrate được (đã xác minh lỗi này ở production thật, không phải
// giả lập). Việc trang chạy được quan trọng hơn siết chặt script-src ở mức này — các lớp
// bảo vệ XSS chính vẫn còn nguyên: React tự escape mọi output, không dùng dangerouslySetInnerHTML
// ở đâu trong code (RULE-05/RULE-09), object-src/frame-ancestors/base-uri vẫn chặt.
const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "connect-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
