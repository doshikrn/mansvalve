import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  ExternalLink,
  Factory,
  FileText,
  Flame,
  HardHat,
  Landmark,
  ShieldCheck,
} from "lucide-react";

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

const PROVIDED_ITEMS = [
  "Паспорт изделия",
  "Сертификаты соответствия",
  "Декларации соответствия",
  "Протоколы испытаний",
  "Гарантийные обязательства",
  "Технические характеристики",
  "Чертежи и каталожные данные",
  "Счета, договоры, закрывающие документы",
] as const;

const INDUSTRIES = [
  { label: "ТЭЦ и теплосетей", icon: Flame },
  { label: "Водоканалов", icon: Droplets },
  { label: "Промышленных предприятий", icon: Factory },
  { label: "Нефтегазовых объектов", icon: HardHat },
  { label: "Государственных и тендерных проектов", icon: Landmark },
] as const;

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
    alternates: { canonical: "/certificates" },
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
  const certificates = isDatabaseConfigured() ? await listPublicActiveCertificates() : [];
  const lead = applyPlaceholders(cms.lead, COMPANY.name);

  const pageImages = cms.headerImageSrc
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  pageImages.forEach((src, index) => {
    warnInvalidMediaUrl(src, `CertificatesPage:image:${index}`);
  });

  const heroMainImage = pageImages[0] ?? certificates[0]?.mediaUrl ?? "";
  const qualityImages = pageImages.slice(1, 4);
  const trustImage = pageImages[4] ?? pageImages[3] ?? certificates[1]?.mediaUrl ?? "";

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 transition-colors hover:text-slate-900">
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

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-site-primary">
                Сертификаты
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-site-ink sm:text-5xl">
                СЕРТИФИКАТЫ
                <br />
                И ГАРАНТИЯ КАЧЕСТВА
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-700">
                MANSVALVE GROUP уделяет особое внимание качеству поставляемой продукции и соответствию требованиям клиентов.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                Вся поставляемая арматура и комплектующие сопровождаются необходимым пакетом документов в зависимости от типа продукции и требований проекта.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                {lead}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <Feature icon={ShieldCheck} title="Надежность" text="Проверенные поставщики и контроль качества" />
                <Feature icon={FileText} title="Документы" text="Полный пакет документов на продукцию" />
                <Feature icon={BadgeCheck} title="Гарантия" text="Гарантийные обязательства на всю продукцию" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {heroMainImage ? (
                <Image
                  src={heroMainImage}
                  alt="Промышленная арматура"
                  width={1100}
                  height={760}
                  className="h-full min-h-[280px] w-full object-cover lg:min-h-[520px]"
                  unoptimized={isRemoteMedia(heroMainImage)}
                />
              ) : (
                <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-500 lg:min-h-[520px]">
                  Изображение продукции
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold text-site-primary">По запросу предоставляем:</h2>
            <ul className="mt-4 space-y-2.5">
              {PROVIDED_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-base text-site-ink">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-site-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {certificates.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {certificates.slice(0, 4).map((certificate) => (
                <article
                  key={certificate.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="relative h-52 border-b border-slate-100">
                    <Image
                      src={certificate.mediaUrl}
                      alt={certificate.mediaAlt || certificate.title}
                      fill
                      className="object-cover"
                      unoptimized={isRemoteMedia(certificate.mediaUrl)}
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-site-ink">{certificate.title}</p>
                    <Button asChild variant="ghost" className="mt-2 h-8 px-0 text-site-primary hover:text-site-primary-hover">
                      <a href={certificate.mediaUrl} target="_blank" rel="noopener noreferrer">
                        {cms.openDocumentLabel}
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <p className="font-semibold text-site-ink">{cms.emptyTitle}</p>
              <p className="mt-1">{cms.emptySubtitle}</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-site-primary/10 text-site-primary">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-site-primary">Контроль качества</h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    Перед поставкой продукция проходит проверку комплектности, маркировки, внешнего состояния и соответствия заявленным характеристикам.
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    Для отдельных позиций возможно предоставление гидравлических испытаний, заводских тестов и дополнительной проверки по запросу заказчика.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {qualityImages.map((src, index) => (
                <div key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Image
                    src={src}
                    alt="Контроль качества"
                    width={520}
                    height={360}
                    className="h-40 w-full object-cover sm:h-48"
                    unoptimized={isRemoteMedia(src)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-site-primary">Работаем с объектами повышенных требований</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            Мы поставляем оборудование для:
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {INDUSTRIES.map(({ label, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                <Icon className="h-5 w-5 text-site-primary" />
                <p className="mt-2 text-sm font-semibold text-site-ink">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Поэтому понимаем важность корректной документации и соблюдения технических требований.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-site-primary" />
                <h2 className="text-2xl font-bold text-site-primary">Гарантия надежности</h2>
              </div>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                Мы заинтересованы в долгосрочном сотрудничестве, поэтому предлагаем клиентам только проверенные решения, соответствующие заявленным параметрам и условиям эксплуатации.
              </p>
              <p className="mt-4 text-base font-semibold text-site-ink">
                MANSVALVE GROUP — качество, подтвержденное документально.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {trustImage ? (
                <Image
                  src={trustImage}
                  alt="Партнерство и надежность"
                  width={860}
                  height={420}
                  className="h-full min-h-48 w-full object-cover"
                  unoptimized={isRemoteMedia(trustImage)}
                />
              ) : (
                <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
                  Фото партнерства
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <Icon className="h-5 w-5 text-site-primary" />
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-site-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
