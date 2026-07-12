import { policies } from "@/lib/content";

export default function PolicySection() {
  return (
    <section className="bg-bg-light px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-red">Trước khi bạn quyết định</p>
          <h2 className="text-2xl font-black text-navy-mid sm:text-3xl">Ba điều tôi nói thẳng</h2>
        </div>

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
      </div>
    </section>
  );
}
