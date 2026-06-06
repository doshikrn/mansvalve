import { TrustProofImage } from "@/components/sections/trust/TrustProofImage";
import { getActiveTrustItems, hasActiveTrustItems } from "@/lib/site-content/trust-proof";
import { resolveHomeTrustCases } from "@/lib/site-content/public";

export async function HomeTrustCases() {
  const content = await resolveHomeTrustCases();
  const items = getActiveTrustItems(content.items).filter(
    (item) => item.title.trim() && item.imageUrl.trim(),
  );

  if (
    !hasActiveTrustItems(content.items, (item) =>
      Boolean(item.title.trim() && item.imageUrl.trim()),
    )
  ) {
    return null;
  }

  return (
    <section className="site-section bg-site-bg" aria-labelledby="home-trust-cases-heading">
      <div className="site-container">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h2 id="home-trust-cases-heading" className="site-heading">
            {content.title}
          </h2>
          {content.subtitle?.trim() ? (
            <p className="mt-3 text-base leading-relaxed text-site-muted sm:text-lg">
              {content.subtitle}
            </p>
          ) : null}
        </div>

        <ul className="grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <li key={`${item.title}-${item.imageUrl}`} className="site-card overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full bg-slate-100">
                <TrustProofImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-3 p-5 sm:p-6">
                <h3 className="text-lg font-bold tracking-tight text-site-ink">{item.title}</h3>
                {item.industry.trim() ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-site-primary">
                    {item.industry}
                  </p>
                ) : null}
                {item.suppliedProducts.trim() ? (
                  <p className="text-sm text-site-muted">
                    <span className="font-medium text-site-ink">Поставка: </span>
                    {item.suppliedProducts}
                  </p>
                ) : null}
                {item.description.trim() ? (
                  <p className="text-sm leading-relaxed text-site-muted">{item.description}</p>
                ) : null}
                {item.result?.trim() ? (
                  <p className="rounded-lg bg-site-bg px-3 py-2 text-sm text-site-ink">
                    <span className="font-semibold">Результат: </span>
                    {item.result}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
