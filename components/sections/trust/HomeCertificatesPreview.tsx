import Link from "next/link";
import { ArrowRight, FileCheck2, ShieldCheck, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TrustProofImage } from "@/components/sections/trust/TrustProofImage";
import { isDatabaseConfigured } from "@/lib/db/client";
import { resolveHomeCertificatesPreview } from "@/lib/site-content/public";
import { listPublicActiveCertificates } from "@/lib/services/certificates";

export async function HomeCertificatesPreview() {
  if (!isDatabaseConfigured()) return null;

  const [settings, certificates] = await Promise.all([
    resolveHomeCertificatesPreview(),
    listPublicActiveCertificates(),
  ]);

  const items = certificates.slice(0, settings.limit);
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-white py-12 sm:py-14" aria-labelledby="home-certificates-heading">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_82%_0%,rgba(47,107,255,0.08),transparent_58%)]" aria-hidden />
      <div className="site-container relative">
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.68fr)_minmax(0,1.32fr)] lg:items-center">
          <div className="max-w-xl">
            <p className="site-eyebrow">Документы и качество</p>
            <h2 id="home-certificates-heading" className="site-heading">
              {settings.title}
            </h2>
            {settings.subtitle?.trim() ? (
              <p className="mt-3 text-base leading-relaxed text-site-muted sm:text-lg">
                {settings.subtitle}
              </p>
            ) : null}
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#f8fbff] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-site-primary/10 text-site-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-site-ink">Сертификаты и паспорта</span>
                  <span className="mt-0.5 block text-xs leading-snug text-site-muted">Документы под позицию и объект.</span>
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#f8fbff] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-site-cta/10 text-site-cta">
                  <FileCheck2 className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-site-ink">Готово для закупок</span>
                  <span className="mt-0.5 block text-xs leading-snug text-site-muted">КП, НДС, договор и закрывающие.</span>
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="lg" className="mt-6 h-12 border-site-deep bg-site-deep px-6 text-white hover:bg-site-deep-soft hover:text-white">
              <Link href="/certificates">
                Все сертификаты
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((certificate) => (
            <li key={certificate.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-[0_22px_44px_-34px_rgba(15,23,42,0.55)] transition hover:-translate-y-[2px] hover:border-site-primary/35 hover:shadow-[0_28px_58px_-38px_rgba(15,23,42,0.65)] motion-reduce:hover:translate-y-0">
              <div className="relative aspect-[4/5] w-full bg-[#eef3f8]">
                <TrustProofImage
                  src={certificate.mediaUrl}
                  alt={certificate.mediaAlt ?? certificate.title}
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.015]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              </div>
              <div className="space-y-3 border-t border-slate-200 p-4">
                <h3 className="text-sm font-bold leading-snug text-site-ink">{certificate.title}</h3>
                {certificate.description?.trim() ? (
                  <p className="text-xs leading-relaxed text-site-muted line-clamp-3">
                    {certificate.description}
                  </p>
                ) : null}
                <a
                  href={certificate.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-site-primary hover:text-site-primary-hover"
                >
                  Смотреть сертификат
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
