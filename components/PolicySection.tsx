import { policies, testimonials } from "@/lib/content";

export default function PolicySection() {
  return (
    <section className="bg-bg-light px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Trước khi bạn quyết định</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">Ba điều tôi nói thẳng</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="space-y-4">
            {policies.map((policy) => (
              <li key={policy.text} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <span className="text-xl" aria-hidden="true">
                  {policy.icon}
                </span>
                <p className="text-sm text-gray-700">{policy.text}</p>
              </li>
            ))}
          </ul>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent-red">
              Kết quả từ học viên
            </p>
            {testimonials.length === 0 ? (
              <p className="text-sm italic text-text-muted">
                Chưa có phản hồi học viên khóa 1 — mục này sẽ được cập nhật ngay khi có kết quả thật từ học viên.
              </p>
            ) : (
              <div className="space-y-5">
                {testimonials.map((t) => (
                  <blockquote key={t.name} className="text-sm">
                    <p className="mb-2 italic text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="text-xs font-semibold text-navy-mid">
                      — {t.name}, {t.cohort}
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
