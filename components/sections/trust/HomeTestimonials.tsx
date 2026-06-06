import { TrustProofImage } from "@/components/sections/trust/TrustProofImage";
import { getActiveTrustItems, hasActiveTrustItems } from "@/lib/site-content/trust-proof";
import { resolveHomeTestimonials } from "@/lib/site-content/public";

export async function HomeTestimonials() {
  const content = await resolveHomeTestimonials();
  const items = getActiveTrustItems(content.items).filter(
    (item) => item.quote.trim() && item.companyName.trim(),
  );

  if (
    !hasActiveTrustItems(content.items, (item) =>
      Boolean(item.quote.trim() && item.companyName.trim()),
    )
  ) {
    return null;
  }

  return (
    <section className="bg-white py-10 sm:py-12" aria-labelledby="home-testimonials-heading">
      <div className="site-container">
        <div className="mb-6 max-w-3xl">
          <p className="site-eyebrow">Отзывы</p>
          <h2 id="home-testimonials-heading" className="site-heading">
            {content.title}
          </h2>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={`${item.companyName}-${item.quote.slice(0, 40)}`}
              className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-[#f8fbff] p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.42)]"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-site-primary" aria-hidden />
              <div className="mb-4 text-4xl font-bold leading-none text-site-primary/20" aria-hidden>“</div>
              <blockquote className="text-sm leading-relaxed text-site-ink">
                «{item.quote}»
              </blockquote>
              <footer className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
                {item.companyLogoUrl?.trim() ? (
                  <div className="relative h-10 w-16 shrink-0">
                    <TrustProofImage
                      src={item.companyLogoUrl}
                      alt={`Логотип ${item.companyName}`}
                      className="object-contain object-left"
                      sizes="64px"
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-site-ink">{item.companyName}</p>
                  {item.authorName?.trim() || item.authorPosition?.trim() ? (
                    <p className="truncate text-xs text-site-muted">
                      {[item.authorName?.trim(), item.authorPosition?.trim()].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
