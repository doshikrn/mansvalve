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
    <section className="border-t border-slate-200 bg-white py-10 sm:py-12" aria-labelledby="home-client-logos-heading">
      <div className="site-container">
        <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-5 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="site-eyebrow">Доверие B2B</p>
              <h2 id="home-client-logos-heading" className="text-2xl font-bold tracking-tight text-site-ink sm:text-3xl">
                {content.title}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-site-muted">
              Логотипы размещены с согласия компаний-клиентов.
            </p>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((item) => (
              <li key={`${item.companyName}-${item.logoUrl}`} className="flex items-center justify-center">
                {item.websiteUrl?.trim() ? (
                  <a
                    href={item.websiteUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex h-16 w-full max-w-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-site-primary/40"
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
                  <div className="relative flex h-16 w-full max-w-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
        </div>
      </div>
    </section>
  );
}
