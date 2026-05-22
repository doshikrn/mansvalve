import Link from "next/link";
import {
  ChevronRight,
  Phone,
  ShieldCheck,
  Truck,
  BadgeCheck,
  ArrowRight,
  Cpu,
  Download,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

import type { TovarProductPageData } from "@/components/catalog/tovar-product-presentation";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Гарантия качества", sub: "Сертификаты и паспорта" },
  { icon: Truck, label: "Доставка по РК", sub: "Алматы, Астана и регионы" },
  { icon: BadgeCheck, label: "Официальный импорт", sub: "Таможенные декларации" },
] as const;

export function CatalogProductTovarView(data: TovarProductPageData) {
  const {
    product,
    category,
    related,
    view,
    waUrl,
    breadcrumbJsonLd,
    productJsonLd,
    showActuatorBlock,
    actuatorHref,
    formattedPrice,
    productDocuments,
  } = data;
  const detailContent = view.detailContent;
  const specsEntries = detailContent.characteristics;
  const productName = view.displayName;
  const productH1 = view.h1;
  const categoryLabel = view.categoryLabel;
  const heroImageSrc = view.primaryImageUrl;
  const heroImageAlt = view.primaryImageAlt;
  const hasProductDocuments = productDocuments.some((entry) => Boolean(entry.doc?.url));

  return (
    <div className="bg-site-card">
      <JsonLd id={`breadcrumbs-${product.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`product-${product.slug}`} data={productJsonLd} />
      <div className="border-b border-site-border bg-site-bg">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav aria-label="Хлебные крошки">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-slate-900 transition-colors">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <Link href="/catalog" className="hover:text-slate-900 transition-colors">
                  Каталог
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <Link
                  href={catalogCategoryPath(category?.slug ?? product.category)}
                  className="hover:text-slate-900 transition-colors"
                >
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <Link
                  href={catalogSubcategoryPath(
                    category?.slug ?? product.category,
                    product.subcategory,
                  )}
                  className="hover:text-slate-900 transition-colors"
                >
                  {product.subcategoryName}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <span className="line-clamp-1 font-medium text-slate-900">{productName}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductImageFrame
            src={heroImageSrc}
            alt={heroImageAlt}
            priority
            quality={95}
            unoptimized={view.primaryImageUnoptimized}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="min-h-[280px] rounded-2xl border border-site-border lg:min-h-[400px]"
            safeAreaClassName="p-6 sm:p-8 lg:p-10"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/15 to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {categoryLabel}
            </span>
          </ProductImageFrame>

          <div className="flex flex-col">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-site-primary">
                {categoryLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {product.subcategoryName}
              </span>
            </div>

            <h1 className="mb-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {productH1}
            </h1>

            <div className="mb-5 flex flex-wrap gap-2">
              {product.dn != null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                  <span className="text-xs text-slate-400">DN</span>
                  {product.dn}
                </span>
              )}
              {product.pn != null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                  <span className="text-xs text-slate-400">PN</span>
                  {product.pn}
                </span>
              )}
              {product.thread && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                  <span className="text-xs text-slate-400">Резьба</span>
                  {product.thread}
                </span>
              )}
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                {product.material}
              </span>
              {product.weight != null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                  <span className="text-xs text-slate-400">Вес</span>
                  {product.weight} кг
                </span>
              )}
            </div>

            <div className="mb-8 space-y-3 text-base leading-relaxed text-slate-600">
              {detailContent.descriptionParagraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {showActuatorBlock && (
              <div className="mb-8 rounded-xl border border-site-border bg-site-bg p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-site-card p-2 text-site-primary shadow-sm">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Комплектация электроприводом</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Для этой позиции доступна комплектация электроприводом с подбором по DN/PN и
                      условиям эксплуатации.
                    </p>
                    <Link
                      href={actuatorHref}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-site-primary transition-colors hover:text-site-primary-hover"
                    >
                      Смотреть электроприводы
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 rounded-xl border border-site-border bg-site-bg p-5">
              {formattedPrice ? (
                <>
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                    Цена за единицу
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{formattedPrice}</p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Без НДС. Цена уточняется при оформлении заказа.
                  </p>
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 rounded-xl bg-site-primary text-base font-semibold hover:bg-site-primary-hover"
                asChild
              >
                <a href="#request-section">
                  <Phone className="mr-2 h-4 w-4" />
                  Запросить КП
                </a>
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-xl border-0 bg-site-cta text-base font-semibold text-white hover:opacity-90"
                asChild
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={20} strokeWidth={1.5} className="text-site-primary" />
                  <p className="text-xs font-semibold leading-tight text-slate-800">{label}</p>
                  <p className="text-[11px] leading-tight text-slate-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-site-border bg-site-bg">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="mb-5 text-xl font-bold text-slate-900">Описание</h2>
              <div className="space-y-4 text-base leading-[1.75] text-slate-600">
                {detailContent.descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {category && (
                <div className="mt-6">
                  <Link
                    href={catalogCategoryPath(category.slug)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-site-primary transition-colors hover:text-site-primary-hover"
                  >
                    Все {category.name.toLowerCase()}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {specsEntries.length > 0 ? (
              <div>
                <h2 className="mb-5 text-xl font-bold text-slate-900">Технические характеристики</h2>
                <div className="overflow-hidden rounded-xl border border-site-border bg-site-card">
                  <table className="w-full">
                    <tbody>
                      {specsEntries.map(({ label, value }, idx) => (
                        <tr key={label} className={idx % 2 === 0 ? "bg-white" : "bg-site-bg"}>
                          <td className="w-1/2 border-r border-slate-100 px-5 py-3 text-sm font-medium text-slate-500">
                            {label}
                          </td>
                          <td className="px-5 py-3 text-sm font-semibold text-slate-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {view.contentSections.standards.length ||
      view.contentSections.advantages.length ||
      view.contentSections.application.length ||
      view.contentSections.documentsQuality.length ||
      view.contentSections.deliveryTerms.length ? (
        <div className="border-t border-site-border bg-site-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
            {view.contentSections.standards.length ? (
              <InfoList title="Стандарты и соответствие" items={view.contentSections.standards} />
            ) : null}
            {view.contentSections.advantages.length ? (
              <InfoList title="Преимущества" items={view.contentSections.advantages} />
            ) : null}
            {view.contentSections.application.length ? (
              <InfoList title="Область применения" items={view.contentSections.application} />
            ) : null}
            {view.contentSections.documentsQuality.length ? (
              <InfoList
                title="Документация и контроль качества"
                items={view.contentSections.documentsQuality}
              />
            ) : null}
            {view.contentSections.deliveryTerms.length ? (
              <InfoList title="Условия поставки" items={view.contentSections.deliveryTerms} />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border-t border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="rounded-2xl border border-site-border bg-site-bg p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-site-primary" />
              <h2 className="text-lg font-bold text-slate-900">Документы по товару</h2>
            </div>

            {hasProductDocuments ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {productDocuments.map((entry) =>
                  entry.doc?.url ? (
                    <a
                      key={entry.id}
                      href={entry.doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center justify-between rounded-xl border border-site-border bg-site-card px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-site-primary hover:text-site-primary-hover"
                    >
                      <span className="pr-3">{entry.label}</span>
                      <Download className="h-4 w-4 shrink-0" />
                    </a>
                  ) : null,
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Документы предоставляются по запросу. Свяжитесь с менеджером для получения
                спецификации и опросного листа.
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        id="request-section"
        className="scroll-mt-20 bg-site-primary py-14 sm:scroll-mt-24 sm:py-16 md:scroll-mt-32"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Нужна помощь с подбором?</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/90">
            Наши инженеры помогут выбрать арматуру по рабочим параметрам. Звоните или пишите —
            ответим быстро.
          </p>
          <div className="flex flex-wrap items-center justify-center">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-white/40 text-base font-semibold text-white hover:bg-white/10"
              asChild
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="mr-2 h-4 w-4" />
                Написать в WhatsApp
              </a>
            </Button>
          </div>

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/25 bg-white/10 p-5 text-left">
            <p className="mb-4 text-sm font-semibold text-white">Быстрая заявка по этой позиции</p>
            <QuickRequestForm
              variant="dark"
              source={`product-${product.slug}`}
              productContext={{
                productName,
                productSlug: product.slug,
                productCategory: categoryLabel,
                productSubcategory: product.subcategoryName,
              }}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">Похожие позиции</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={catalogCategoryPath(category?.slug ?? product.category)}>
                  Смотреть все
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
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
