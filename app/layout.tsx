import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Phễu Khách Tài Chính — 6 tuần dựng phễu để khách lạ tự nhắn cho bạn",
  description:
    "Khóa 6 tuần cho người bán sản phẩm tài chính: dựng phễu đang chạy thật, 20+ khách mới không phải người quen, bộ kịch bản chat riêng, đơn đầu tiên từ khách lạ.",
  openGraph: {
    title: "Phễu Khách Tài Chính — 6 tuần dựng phễu để khách lạ tự nhắn cho bạn",
    description:
      "Khóa 6 tuần cho người bán sản phẩm tài chính: dựng phễu đang chạy thật, 20+ khách mới không phải người quen, bộ kịch bản chat riêng, đơn đầu tiên từ khách lạ.",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phễu Khách Tài Chính — 6 tuần dựng phễu để khách lạ tự nhắn cho bạn",
    description:
      "Khóa 6 tuần cho người bán sản phẩm tài chính: dựng phễu đang chạy thật, 20+ khách mới không phải người quen, bộ kịch bản chat riêng, đơn đầu tiên từ khách lạ.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
