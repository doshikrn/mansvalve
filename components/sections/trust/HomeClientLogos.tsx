import { TrustProofImage } from "@/components/sections/trust/TrustProofImage";
import { getActiveTrustItems, hasActiveTrustItems } from "@/lib/site-content/trust-proof";
import { resolveHomeClientLogos } from "@/lib/site-content/public";

export async function HomeClientLogos() {
  const content = await resolveHomeClientLogos();
  const items = getActiveTrustItems(content.items).filter(
    (item) => item.companyName.trim() && item.logoUrl.trim(),
  );

  if (
    !hasActiveTrustItems(content.items, (item) =>
      Boolean(item.companyName.trim() && item.logoUrl.trim()),
    )
  ) {
    return null;
  }

  return (
    <section className="site-section" aria-labelledby="home-client-logos-heading">
      <div className="site-container">
        <h2 id="home-client-logos-heading" className="site-heading text-center">
          {content.title}
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <li key={`${item.companyName}-${item.logoUrl}`} className="flex items-center justify-center">
              {item.websiteUrl?.trim() ? (
                <a
                  href={item.websiteUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-16 w-full max-w-[180px] items-center justify-center rounded-xl border border-site-border bg-white px-4 py-3 transition-colors hover:border-site-primary/40"
                  aria-label={item.companyName}
                >
                  <span className="relative h-10 w-full">
                    <TrustProofImage
                      src={item.logoUrl}
                      alt={`Логотип ${item.companyName}`}
                      className="object-contain object-center"
                      sizes="160px"
                    />
                  </span>
                </a>
              ) : (
                <div className="relative flex h-16 w-full max-w-[180px] items-center justify-center rounded-xl border border-site-border bg-white px-4 py-3">
                  <span className="relative h-10 w-full">
                    <TrustProofImage
                      src={item.logoUrl}
                      alt={`Логотип ${item.companyName}`}
                      className="object-contain object-center"
                      sizes="160px"
                    />
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-site-muted">
          Логотипы размещены с согласия компаний-клиентов.
        </p>
      </div>
    </section>
  );
}
