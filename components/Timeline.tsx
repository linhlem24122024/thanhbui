import { timeline } from "@/lib/content";

export default function Timeline() {
  return (
    <section id="program" className="bg-bg-light px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Nội dung khóa học</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">
            6 tuần dựng phễu, đi từ định vị tới hệ thống
          </h2>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2">
          {timeline.map((item) => (
            <li key={item.step} className="flex h-full gap-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-navy-mid text-sm font-black text-white">
                {item.step}
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-red">{item.time}</p>
                <h3 className="mb-2 text-base font-bold text-navy-mid">{item.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-bg-light px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
