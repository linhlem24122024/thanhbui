import { faq } from "@/lib/content";

export default function FaqSection() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Hỏi nhanh — đáp thật</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">Câu hỏi thường gặp</h2>
        </div>

        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.q} className="group rounded-xl bg-bg-light p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-navy-mid">
                {item.q}
                <span className="ml-4 text-accent-red group-open:hidden" aria-hidden="true">
                  +
                </span>
                <span className="ml-4 hidden text-accent-red group-open:inline" aria-hidden="true">
                  –
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
