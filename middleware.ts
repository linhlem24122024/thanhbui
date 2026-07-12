import { NextRequest, NextResponse } from "next/server";

// CSP dùng nonce riêng cho từng request — theo đúng hướng dẫn chính thức của Next.js
// (https://nextjs.org/docs/app/guides/content-security-policy). Next.js tự động đọc nonce
// từ header Content-Security-Policy và gắn vào các <script> nội bộ nó tạo ra, nên không cần
// chỉnh gì thêm ở layout. Cách này giữ được script-src 'self' chặt (không cần 'unsafe-inline'
// ở production) mà vẫn cho phép Next.js hydrate bình thường — khắc phục lỗi trang treo ở
// "Đang tải..." do CSP chặn script nội bộ.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspDirectives);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspDirectives);
  return response;
}

export const config = {
  matcher: [
    // Áp dụng cho mọi route trừ static asset/_next nội bộ và favicon.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
