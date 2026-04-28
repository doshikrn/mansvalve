import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import { isDatabaseConfigured } from "@/lib/db/client";
import { warnInvalidMediaUrl } from "@/lib/media-url";
import { applyPlaceholders } from "@/lib/site-content/models";
import { resolveCertificatesPage } from "@/lib/site-content/public";
import { listPublicActiveCertificates } from "@/lib/services/certificates";

function isRemoteMedia(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

export async function generateMetadata(): Promise<Metadata> {
  const c = await resolveCertificatesPage();
  const title = applyPlaceholders(c.metaTitle, COMPANY.name);
  const description = applyPlaceholders(c.metaDescription, COMPANY.name);
  const ogDesc = applyPlaceholders(c.ogDescription, COMPANY.name);
  const twDesc = applyPlaceholders(c.twitterDescription, COMPANY.name);
  const socialTitle = `${title} | ${COMPANY.name}`;
  return {
    title,
    description,
    alternates: {
      canonical: "/certificates",
    },
    openGraph: {
      title: socialTitle,
      description: ogDesc,
      url: "/certificates",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: twDesc,
    },
  };
}

export default async function CertificatesPage() {
  const cms = await resolveCertificatesPage();
  if (cms.headerImageSrc) warnInvalidMediaUrl(cms.headerImageSrc, "CertificatesPage:header");

  const certificates = isDatabaseConfigured()
    ? await listPublicActiveCertificates()
    : [];

  const lead = applyPlaceholders(cms.lead, COMPANY.name);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  {cms.breadcrumbLabel}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {cms.h1}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-500">{lead}</p>

          {cms.headerImageSrc ? (
            <div className="relative mt-8 h-56 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src={cms.headerImageSrc}
                alt=""
                fill
                className="object-cover"
                unoptimized={isRemoteMedia(cms.headerImageSrc)}
                sizes="(max-width: 768px) 100vw, 48rem"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {certificates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-base font-semibold text-slate-900">{cms.emptyTitle}</p>
            <p className="mt-2 text-sm text-slate-500">{cms.emptySubtitle}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => {
              warnInvalidMediaUrl(
                certificate.mediaUrl,
                `CertificatesPage:${certificate.id}`,
              );
              return (
                <article
                  key={certificate.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative h-56 border-b border-slate-100 bg-slate-100">
                    <Image
                      src={certificate.mediaUrl}
                      alt={certificate.mediaAlt || certificate.title}
                      fill
                      unoptimized={isRemoteMedia(certificate.mediaUrl)}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-base font-semibold text-slate-900">
                      {certificate.title}
                    </h2>
                    {certificate.issuedAt ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {cms.issuedAtLabel}{" "}
                        {new Date(certificate.issuedAt).toLocaleDateString("ru-RU")}
                      </p>
                    ) : null}
                    {certificate.description ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                        {certificate.description}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a
                          href={certificate.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cms.openDocumentLabel}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
