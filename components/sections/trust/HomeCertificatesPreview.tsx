import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

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
    <section className="site-section" aria-labelledby="home-certificates-heading">
      <div className="site-container">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h2 id="home-certificates-heading" className="site-heading">
            {settings.title}
          </h2>
          {settings.subtitle?.trim() ? (
            <p className="mt-3 text-base leading-relaxed text-site-muted sm:text-lg">
              {settings.subtitle}
            </p>
          ) : null}
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((certificate) => (
            <li key={certificate.id} className="site-card overflow-hidden p-0">
              <div className="relative aspect-[3/4] w-full bg-slate-100">
                <TrustProofImage
                  src={certificate.mediaUrl}
                  alt={certificate.mediaAlt ?? certificate.title}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              </div>
              <div className="space-y-3 p-4">
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

        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" size="lg" className="h-12 px-6">
            <Link href="/certificates">
              Все сертификаты
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
