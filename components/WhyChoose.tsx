import { whyChoose } from "@/lib/content";

export default function WhyChoose() {
  return (
    <section id="why-choose" className="bg-bg-light px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Tại sao chọn khóa này</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">
            Giỏi sản phẩm — nhưng hết người để nói chuyện
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 text-3xl" aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="mb-2 text-base font-bold text-navy-mid">{item.title}</h3>
              <p className="text-sm text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
