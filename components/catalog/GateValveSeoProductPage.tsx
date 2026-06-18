import Link from "next/link";
import { BadgeCheck, ChevronRight, FileText, Phone, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { QuickContactSheet } from "@/components/catalog/QuickContactSheet";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategoryVisual } from "@/lib/category-visuals";
import {
  buildCompanyProductInquiryEmailUrl,
  buildCompanyProductInquiryWhatsAppUrl,
  COMPANY,
} from "@/lib/company";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import {
  getSeriesPageCatalogCategoryId,
  getSeriesPageCatalogSubcategoryId,
  getSeriesPageCategoryLabel,
  getSeriesPagePath,
  type ProductSeriesSeoPage,
} from "@/lib/seo-product-pages/product-series";
import {
  catalogCategoryPath,
  catalogSubcategoryListingHref,
} from "@/lib/catalog-routes";

interface Props {
  page: ProductSeriesSeoPage;
  product?: PublicCatalogProduct;
  relatedPages: ProductSeriesSeoPage[];
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Сертификаты", sub: "Паспорт и документы" },
  { icon: Truck, label: "Доставка по РК", sub: "Алматы, Астана, регионы" },
  { icon: BadgeCheck, label: "Работаем с НДС", sub: "Для B2B и тендеров" },
] as const;

export function GateValveSeoProductPage({ page, product, relatedPages }: Props) {
  const view = product ? buildPublicProductView(product) : null;
  const introParagraphs =
    view?.detailContent?.descriptionParagraphs?.length
      ? view.detailContent.descriptionParagraphs
      : page.introParagraphs;
  const characteristicsRows =
    view?.detailContent?.characteristics?.length
      ? view.detailContent.characteristics
      : page.characteristics;
  const qualityDocumentsItems =
    view && view.detailContent.qualityDocuments.length > 0
      ? view.detailContent.qualityDocuments
      : page.qualityDocuments;
  const standardsItems = view ? view.contentSections.standards : page.standards;
  const advantagesItems = view ? view.contentSections.advantages : page.benefits;
  const applicationItems = view ? view.contentSections.application : page.applications;
  const deliveryTermsItems = view ? view.contentSections.deliveryTerms : page.supplyTerms;
  const catalogCategoryId = getSeriesPageCatalogCategoryId(page);
  const catalogSubcategoryId = getSeriesPageCatalogSubcategoryId(page);
  const categoryLabel = getSeriesPageCategoryLabel(page);
  const categoryVisual = getCategoryVisual(catalogCategoryId);
  const displayName = view?.displayName ?? page.title;
  const imageSrc = view?.primaryImageUrl ?? categoryVisual.imageSrc;
  const imageAlt = view?.primaryImageAlt ?? page.imageAlt;
  const canonicalPath = view?.canonicalPath ?? getSeriesPagePath(page);
  const waUrl = buildCompanyProductInquiryWhatsAppUrl(displayName, {
    dn: page.dn,
    pn: page.pn,
  });
  const formattedPrice =
    product?.price && !product.priceByRequest ? formatPrice(product.price) : null;
  const productJsonLd = buildGateValveJsonLd(page, product, imageSrc, view);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(page, displayName, canonicalPath);

  return (
    <div className="bg-site-card">
      <JsonLd id={`breadcrumbs-${page.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`product-${page.slug}`} data={productJsonLd} />

      <div className="border-b border-site-border bg-site-bg">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav aria-label="Хлебные крошки">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <li>
                <Link href="/" className="transition-colors hover:text-slate-900">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <Link href="/catalog" className="transition-colors hover:text-slate-900">
                  Каталог
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <Link href={catalogCategoryPath(catalogCategoryId)} className="transition-colors hover:text-slate-900">
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <Link
                  href={catalogSubcategoryListingHref(catalogCategoryId, catalogSubcategoryId)}
                  className="transition-colors hover:text-slate-900"
                >
                  {"catalogSubcategoryName" in page ? page.catalogSubcategoryName : catalogSubcategoryId}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  {displayName}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)] lg:py-14">
        <div className="flex flex-col">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-site-primary">
              {page.model}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              DN{page.dn}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              PN{page.pn}
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {view?.h1 ?? page.h1}
          </h1>

          <div className="mt-6 space-y-4 text-base leading-[1.75] text-slate-650">
            {introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <QuickContactSheet
              whatsAppUrl={waUrl}
              emailUrl={buildCompanyProductInquiryEmailUrl(displayName, {
                dn: page.dn,
                pn: page.pn,
              })}
              formTarget="#request-name"
              analytics={{
                source: "series-landing",
                product_id: product?.id,
                product_slug: product?.slug ?? page.slug,
                product_name: displayName,
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
            src={imageSrc}
            alt={imageAlt}
            priority
            quality={92}
            unoptimized={view?.primaryImageUnoptimized ?? mediaImageNeedsUnoptimized(imageSrc)}
            sizes="(max-width: 1024px) 100vw, 480px"
            className="min-h-[320px] rounded-2xl border border-site-border shadow-sm"
            safeAreaClassName="p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-slate-900/65 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {page.imageAlt}
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
                  Укажите количество и сроки — подготовим КП за 15 минут.
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
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Основные характеристики</h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-site-border bg-site-card">
              <table className="w-full">
                <tbody>
                  {characteristicsRows.map((item, index) => (
                    <tr key={item.label} className={index % 2 === 0 ? "bg-white" : "bg-site-bg"}>
                      <td className="w-2/5 border-r border-slate-100 px-5 py-3 text-sm font-medium text-slate-500">
                        {item.label}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
          </div>
        </div>
      </section>

      {standardsItems.length ||
      advantagesItems.length ||
      applicationItems.length ||
      deliveryTermsItems.length ? (
        <section className="border-t border-site-border bg-site-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
            {standardsItems.length ? (
              <InfoBlock title="Стандарты и соответствие" items={standardsItems} />
            ) : null}
            {advantagesItems.length ? (
              <InfoBlock title="Преимущества" items={advantagesItems} />
            ) : null}
            {applicationItems.length ? (
              <InfoBlock title="Область применения" items={applicationItems} />
            ) : null}
            {deliveryTermsItems.length ? (
              <InfoBlock title="Условия поставки" items={deliveryTermsItems} />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="border-t border-site-border bg-site-bg">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Другие диаметры этой серии</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {relatedPages.map((related) => (
              <Link
                key={related.slug}
                href={getSeriesPagePath(related)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  related.slug === page.slug
                    ? "border-site-primary bg-site-primary text-white"
                    : "border-site-border bg-site-card text-slate-700 hover:border-site-primary hover:text-site-primary"
                }`}
              >
                DN{related.dn} PN{related.pn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="request-section" className="scroll-mt-24 bg-site-primary py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Нужно коммерческое предложение?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/85">
              MANSVALVE GROUP поставляет промышленную трубопроводную арматуру для бизнеса,
              промышленности и государственных объектов Казахстана.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-white/25 bg-white/10 p-5 text-left sm:p-6">
            <p className="mb-4 text-sm font-semibold text-white">Быстрая заявка по этой позиции</p>
            <QuickRequestForm
              variant="dark"
              source={`series-${page.slug}`}
              anchorId="request-name"
              productContext={{
                productId: product?.id,
                productName: displayName,
                productSlug: product?.slug ?? page.slug,
                productCategory: categoryLabel,
              }}
            />
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-xl bg-white text-site-primary hover:bg-white/90" asChild>
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="mr-2 h-4 w-4" />
                Написать в WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

function absoluteUrl(path: string): string {
  return new URL(path, `${getSiteBaseUrl()}/`).toString();
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return absoluteUrl(url);
}

function buildBreadcrumbJsonLd(
  page: ProductSeriesSeoPage,
  displayName: string,
  canonicalPath: string,
): Record<string, unknown> {
  const catalogCategoryId = getSeriesPageCatalogCategoryId(page);
  const catalogSubcategoryId = getSeriesPageCatalogSubcategoryId(page);
  const categoryLabel = getSeriesPageCategoryLabel(page);
  const subLabel =
    "catalogSubcategoryName" in page ? page.catalogSubcategoryName : catalogSubcategoryId;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Каталог", item: absoluteUrl("/catalog") },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryLabel,
        item: absoluteUrl(catalogCategoryPath(catalogCategoryId)),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: subLabel,
        item: absoluteUrl(
          catalogSubcategoryListingHref(catalogCategoryId, catalogSubcategoryId),
        ),
      },
      {
        "@type": "ListItem",
        position: 5,
        name: displayName,
        item: absoluteUrl(canonicalPath),
      },
    ],
  };
}

function buildGateValveJsonLd(
  page: ProductSeriesSeoPage,
  product: PublicCatalogProduct | undefined,
  imageSrc: string,
  view: ReturnType<typeof buildPublicProductView> | null,
): Record<string, unknown> {
  const canonicalPath = view?.canonicalPath ?? getSeriesPagePath(page);
  const description =
    (view?.fullDescription || view?.shortDescription || page.seoDescription)
      .replace(/\s+/g, " ")
      .trim();
  const imageUrl = view?.primaryImageUrl ?? imageSrc;
  const characteristics =
    view?.detailContent.characteristics?.length
      ? view.detailContent.characteristics
      : page.characteristics;
  const model = product?.model || page.model;
  const dn = product?.dn ?? page.dn;
  const pn = product?.pn ?? page.pn;
  const material = product?.material || page.series;
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "KZT",
    url: absoluteUrl(canonicalPath),
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: COMPANY.name,
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "KZ",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 10,
          unitCode: "DAY",
        },
      },
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "KZT",
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "KZ",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnShippingFees",
    },
  };

  if (product?.price && !product.priceByRequest) {
    offer.price = String(product.price);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: view?.displayName ?? page.title,
    description,
    sku: product?.id ?? page.slug,
    mpn: `${model} DN${dn} PN${pn}`,
    brand: {
      "@type": "Brand",
      name: COMPANY.name,
    },
    category: view?.categoryLabel || product?.categoryName || page.categorySlug,
    material,
    image: [normalizeImageUrl(imageUrl)],
    url: absoluteUrl(canonicalPath),
    additionalProperty: characteristics.map((item) => ({
      "@type": "PropertyValue",
      name: item.label,
      value: item.value,
    })),
    offers: offer,
  };
}
