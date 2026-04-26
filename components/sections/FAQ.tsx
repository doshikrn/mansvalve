import { ChevronDown } from "lucide-react";
import { resolveHomeFaq } from "@/lib/site-content/public";

export async function FAQ() {
  const { sectionEyebrow, sectionTitle, items } = await resolveHomeFaq();

  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            {sectionEyebrow}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {sectionTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map(({ q, a }, i) => (
            <details
              key={`faq-${i}`}
              className="group rounded-xl border border-slate-200 bg-slate-50 open:bg-white open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-900 transition-colors hover:text-blue-700">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-slate-600">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
