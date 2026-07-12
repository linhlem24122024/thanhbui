import Image from "next/image";
import { instructor } from "@/lib/content";

export default function Instructor() {
  return (
    <section id="instructor" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Giảng viên</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">Người đồng hành trực tiếp cùng bạn</h2>
        </div>

        <div className="flex flex-col items-center gap-8 rounded-2xl bg-bg-light p-8 sm:flex-row sm:items-start sm:p-10">
          <div className="relative h-32 w-32 flex-none overflow-hidden rounded-full ring-4 ring-white sm:h-40 sm:w-40">
            <Image src={instructor.photo} alt={instructor.name} fill className="object-cover" sizes="160px" />
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-navy-mid">{instructor.name}</h3>
            <p className="mb-3 text-sm font-semibold text-accent-red">{instructor.title}</p>
            <p className="mb-4 text-sm text-gray-700">{instructor.bio}</p>

            <div className="mb-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {instructor.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-accent-gold/15 px-3 py-1 text-xs font-bold text-navy-mid"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex justify-center gap-8 sm:justify-start">
              {instructor.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-black text-navy-mid">{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
