import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import { isDatabaseConfigured } from "@/lib/db/client";
import { warnInvalidMediaUrl } from "@/lib/media-url";
import { listPublicActiveCertificates } from "@/lib/services/certificates";

const CERT_TITLE = "Сертификаты соответствия ГОСТ, DIN, ISO — документация на арматуру";

export const metadata: Metadata = {
  title: CERT_TITLE,
  description:
    `Сертификаты и паспорта качества на трубопроводную арматуру ${COMPANY.name}: задвижки, краны, клапаны, затворы. Подтверждение стандартов, комплект документов к поставке по Казахстану.`,
  alternates: {
    canonical: "/certificates",
  },
  openGraph: {
    title: `${CERT_TITLE} | ${COMPANY.name}`,
    description:
      `Документы и сертификаты ГОСТ/DIN/ISO на поставляемую промышленную арматуру. ${COMPANY.name}, Казахстан.`,
    url: "/certificates",
    siteName: COMPANY.name,
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${CERT_TITLE} | ${COMPANY.name}`,
    description:
      `Сертификаты и документация на арматуру: ГОСТ, DIN, ISO. ${COMPANY.name} — поставки по РК.`,
  },
};

function isRemoteMedia(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

export default async function CertificatesPage() {
  const certificates = isDatabaseConfigured()
    ? await listPublicActiveCertificates()
    : [];

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
                  Сертификаты
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Сертификаты
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Подтверждающие документы и сертификаты на поставляемую продукцию.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {certificates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-base font-semibold text-slate-900">
              Сертификаты скоро появятся
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Мы обновляем раздел документами и подтверждающими материалами.
            </p>
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
                      Дата документа:{" "}
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
                        Открыть документ
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
