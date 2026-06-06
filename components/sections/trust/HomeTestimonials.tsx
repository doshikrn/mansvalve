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
    <section className="site-section bg-site-bg" aria-labelledby="home-testimonials-heading">
      <div className="site-container">
        <h2 id="home-testimonials-heading" className="site-heading text-center">
          {content.title}
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.companyName}-${item.quote.slice(0, 40)}`} className="site-card-quiet h-full p-5">
              <blockquote className="text-sm leading-relaxed text-site-ink">
                «{item.quote}»
              </blockquote>
              <footer className="mt-4 flex items-center gap-3 border-t border-site-border pt-4">
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
