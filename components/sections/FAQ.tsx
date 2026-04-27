import { ChevronDown } from "lucide-react";
import { resolveHomeFaq } from "@/lib/site-content/public";

export async function FAQ() {
  const { sectionEyebrow, sectionTitle, items } = await resolveHomeFaq();

  return (
    <section id="faq" className="site-section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10">
          <div className="site-eyebrow">
            {sectionEyebrow}
          </div>
          <h2 className="site-heading">
            {sectionTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map(({ q, a }, i) => (
            <details
              key={`faq-${i}`}
              className="site-card-quiet group open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-site-ink transition-colors hover:text-site-primary">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-site-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-site-border/80 px-5 pb-5 pt-4 text-sm leading-relaxed text-site-muted">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
