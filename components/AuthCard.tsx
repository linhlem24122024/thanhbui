import Link from "next/link";
import { site } from "@/lib/content";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-light px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link href="/" className="mb-6 block text-center text-lg font-extrabold text-navy-mid">
          {site.brand}
        </Link>
        <h1 className="mb-1 text-center text-xl font-extrabold text-navy-mid">{title}</h1>
        {subtitle && <p className="mb-6 text-center text-sm text-text-muted">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  );
}
