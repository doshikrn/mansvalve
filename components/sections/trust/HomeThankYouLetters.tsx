import { ExternalLink } from "lucide-react";

import { TrustProofImage } from "@/components/sections/trust/TrustProofImage";
import { getActiveTrustItems, hasActiveTrustItems } from "@/lib/site-content/trust-proof";
import { resolveHomeThankYouLetters } from "@/lib/site-content/public";

export async function HomeThankYouLetters() {
  const content = await resolveHomeThankYouLetters();
  const items = getActiveTrustItems(content.items).filter(
    (item) =>
      item.title.trim() &&
      item.companyName.trim() &&
      item.previewImageUrl.trim() &&
      item.documentUrl.trim(),
  );

  if (
    !hasActiveTrustItems(content.items, (item) =>
      Boolean(
        item.title.trim() &&
          item.companyName.trim() &&
          item.previewImageUrl.trim() &&
          item.documentUrl.trim(),
      ),
    )
  ) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 bg-[#f5f8fc] py-12 sm:py-14" aria-labelledby="home-thank-you-heading">
      <div className="site-container">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="site-eyebrow">Документальное подтверждение</p>
            <h2 id="home-thank-you-heading" className="site-heading">
              {content.title}
            </h2>
          </div>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.title}-${item.companyName}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.45)]">
              <a
                href={item.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative aspect-[3/4] w-full bg-[#eef3f8]">
                  <TrustProofImage
                    src={item.previewImageUrl}
                    alt={`${item.title} — ${item.companyName}`}
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.015]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="space-y-1 border-t border-slate-200 p-4">
                  <p className="text-sm font-bold text-site-ink">{item.title}</p>
                  <p className="text-xs text-site-muted">{item.companyName}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-site-primary">
                    Открыть документ
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
