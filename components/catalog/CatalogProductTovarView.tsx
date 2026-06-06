import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Download, FileText, Phone, ShieldCheck, Truck } from "lucide-react";

import { QuickContactSheet } from "@/components/catalog/QuickContactSheet";
import { ProductCard } from "@/components/catalog/ProductCard";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { CATALOG_SPEC_HINTS } from "@/lib/catalog/spec-hints";
import { buildCompanyProductInquiryEmailUrl } from "@/lib/company";

import type { TovarProductPageData } from "@/components/catalog/tovar-product-presentation";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Сертификаты", sub: "Паспорт и документы" },
  { icon: Truck, label: "Доставка по РК", sub: "Алматы, Астана, регионы" },
  { icon: BadgeCheck, label: "Работаем с НДС", sub: "Для B2B и тендеров" },
] as const;

const FALLBACK_DOCUMENTS = [
  "Паспорт изделия",
  "Сертификаты соответствия",
  "Декларации соответствия",
  "Гидравлические испытания",
  "Контроль герметичности и прочности согласно требованиям ГОСТ",
];

export function CatalogProductTovarView(data: TovarProductPageData) {
  const {
    product,
    category,
    related,
    view,
    waUrl,
    breadcrumbJsonLd,
    productJsonLd,
    formattedPrice,
    productDocuments,
  } = data;

  const detailContent = view.detailContent;
  const productName = view.displayName;
  const productH1 = view.h1;
  const categoryLabel = view.categoryLabel;
  const subcategoryLabel = product.subcategoryName || product.subcategory;
  const categorySlug = category?.slug ?? product.category;
  const descriptionParagraphs = detailContent.descriptionParagraphs.length
    ? detailContent.descriptionParagraphs
    : [view.shortDescription].filter(Boolean);
  const heroParagraphs = descriptionParagraphs.slice(0, 3);
  const specsEntries = detailContent.characteristics;
  const qualityDocumentsItems = detailContent.qualityDocuments.length
    ? detailContent.qualityDocuments
    : FALLBACK_DOCUMENTS;
  const productDocsWithUrls = productDocuments.filter((entry) => Boolean(entry.doc?.url));
  const standardsItems = view.contentSections.standards;
  const advantagesItems = view.contentSections.advantages;
  const applicationItems = view.contentSections.application;
  const deliveryTermsItems = view.contentSections.deliveryTerms;

  return (
    <div className="bg-site-card">
      <JsonLd id={`breadcrumbs-${product.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`product-${product.slug}`} data={productJsonLd} />

      <div className="border-b border-site-border bg-site-bg">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav aria-label="Хлебные крошки">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
              <BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink>
              <BreadcrumbLink href={catalogCategoryPath(categorySlug)}>{categoryLabel}</BreadcrumbLink>
              <BreadcrumbLink href={catalogSubcategoryPath(categorySlug, product.subcategory)}>
                {subcategoryLabel}
              </BreadcrumbLink>
              <li>
                <span className="line-clamp-1 font-medium text-slate-900" aria-current="page">
                  {productName}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)] lg:py-14">
        <div className="flex flex-col">
          <div className="mb-4 flex flex-wrap gap-2">
            {product.model ? (
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-site-primary">
                {product.model}
              </span>
            ) : null}
            {product.dn != null ? <MetaPill label={`DN${product.dn}`} /> : null}
            {product.pn != null ? <MetaPill label={`PN${product.pn}`} /> : null}
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {productH1}
          </h1>

          <div className="mt-6 space-y-4 text-base leading-[1.75] text-slate-650">
            {heroParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <QuickContactSheet
              whatsAppUrl={waUrl}
              emailUrl={buildCompanyProductInquiryEmailUrl(productName, {
                dn: product.dn,
                pn: product.pn,
              })}
              formTarget="#request-name"
              analytics={{
                source: "product-pdp",
                product_slug: product.slug,
                product_name: productName,
                category: categoryLabel,
              }}
              triggerSize="lg"
              triggerClassName="rounded-xl bg-site-primary text-base font-semibold hover:bg-site-primary-hover"
            >
              <Phone className="mr-2 h-4 w-4" />
              Получить КП
            </QuickContactSheet>
            <Button
              size="lg"
              className="rounded-xl border-0 bg-site-cta text-base font-semibold text-white hover:opacity-90"
              asChild
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <aside className="space-y-5">
          <ProductImageFrame
            src={view.primaryImageUrl}
            alt={view.primaryImageAlt}
            priority
            quality={92}
            unoptimized={view.primaryImageUnoptimized}
            sizes="(max-width: 1024px) 100vw, 480px"
            className="min-h-[320px] rounded-2xl border border-site-border shadow-sm"
            safeAreaClassName="p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-slate-900/65 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {view.primaryImageAlt}
            </span>
          </ProductImageFrame>

          <div className="rounded-2xl border border-site-border bg-site-bg p-5">
            {formattedPrice ? (
              <>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Цена за единицу</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{formattedPrice}</p>
                <p className="mt-1.5 text-sm text-slate-500">Цена уточняется при оформлении КП.</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-site-primary">Цена по запросу</p>
                <p className="mt-1.5 text-sm text-slate-500">
                  Укажите количество и сроки - подготовим КП за 15 минут.
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-xl border border-site-border bg-site-bg p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-site-primary" strokeWidth={1.7} />
                <p className="mt-2 text-xs font-semibold leading-tight text-slate-800">{label}</p>
                <p className="mt-1 text-[11px] leading-tight text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-t border-site-border bg-site-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {specsEntries.length ? (
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Основные характеристики</h2>
              <div className="mt-5 overflow-hidden rounded-xl border border-site-border bg-site-card">
                <table className="w-full">
                  <tbody>
                    {specsEntries.map((item, index) => (
                      <tr key={item.label} className={index % 2 === 0 ? "bg-white" : "bg-site-bg"}>
                        <td
                          className="w-2/5 border-r border-slate-100 px-5 py-3 text-sm font-medium text-slate-500"
                          title={getSpecTableHint(item.label)}
                        >
                          {item.label}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-site-border bg-site-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-site-primary" />
              <h2 className="text-lg font-bold text-slate-900">Документация и контроль качества</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
              {qualityDocumentsItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-site-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {productDocsWithUrls.length ? (
              <div className="mt-5 space-y-2 border-t border-site-border pt-4">
                {productDocsWithUrls.map((entry) => (
                  <a
                    key={entry.id}
                    href={entry.doc?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex w-full items-center justify-between rounded-lg border border-site-border bg-site-bg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-site-primary hover:text-site-primary-hover"
                  >
                    <span className="pr-3">{entry.label}</span>
                    <Download className="h-4 w-4 shrink-0" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {standardsItems.length ||
      advantagesItems.length ||
      applicationItems.length ||
      deliveryTermsItems.length ? (
        <section className="border-t border-site-border bg-site-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
            {standardsItems.length ? <InfoBlock title="Стандарты и соответствие" items={standardsItems} /> : null}
            {advantagesItems.length ? <InfoBlock title="Преимущества" items={advantagesItems} /> : null}
            {applicationItems.length ? <InfoBlock title="Область применения" items={applicationItems} /> : null}
            {deliveryTermsItems.length ? <InfoBlock title="Условия поставки" items={deliveryTermsItems} /> : null}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="border-t border-site-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Похожие позиции</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={catalogCategoryPath(categorySlug)}>
                  Смотреть все
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <>
      <li>
        <Link href={href} className="transition-colors hover:text-slate-900">
          {children}
        </Link>
      </li>
      <li aria-hidden="true">
        <ChevronRight size={14} className="text-slate-300" />
      </li>
    </>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-site-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getSpecTableHint(label: string): string | undefined {
  const normalized = label.trim().toLowerCase();
  if (normalized === "dn" || normalized.startsWith("dn ")) return CATALOG_SPEC_HINTS.dn;
  if (normalized === "pn" || normalized.startsWith("pn ")) return CATALOG_SPEC_HINTS.pn;
  if (normalized.includes("соединен")) return CATALOG_SPEC_HINTS.connection;
  if (normalized.includes("управлен")) return CATALOG_SPEC_HINTS.control;
  if (normalized.includes("материал")) return CATALOG_SPEC_HINTS.material;
  if (normalized.includes("марка") || normalized.includes("модел")) return CATALOG_SPEC_HINTS.model;
  return undefined;
}
