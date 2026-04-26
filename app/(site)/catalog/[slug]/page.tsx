import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Phone,
  ShieldCheck,
  Truck,
  BadgeCheck,
  ArrowRight,
  Cpu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/ProductCard";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
  getPublicCategoryById,
  getPublicProductBySlug,
  type PublicCatalogCategory,
  type PublicCatalogProduct,
} from "@/lib/public-catalog";
import { buildProductBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/structured-data";
import {
  COMPANY,
  COMPANY_PHONE_HREF,
  buildCompanyProductInquiryWhatsAppUrl,
} from "@/lib/company";
import { getCategoryVisual } from "@/lib/category-visuals";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

/* ── Static generation for all 303 products ──────────────────────── */

export async function generateStaticParams() {
  const products = await getPublicCatalogProducts();
  return products.map((p) => ({ slug: p.slug }));
}

/* ── Per-product SEO metadata ────────────────────────────────────── */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return { title: "Товар не найден" };
  }

  const specs = [
    product.dn != null ? `DN${product.dn}` : null,
    product.pn != null ? `PN${product.pn}` : null,
    product.material || null,
  ]
    .filter(Boolean)
    .join(", ");

  const priceHint =
    product.price && !product.priceByRequest
      ? `Цена: ${formatPrice(product.price)}.`
      : "Цена по запросу.";

  const standard = product.specs["Стандарт"] ?? "";
  const canonicalPath = `/catalog/${product.slug}`;
  const ogTitle = `${product.name} | ${COMPANY.name}`;
  const ogDescription = product.shortDescription;

  return {
    title: `${product.name} — купить в Казахстане`,
    description: `${product.categoryName} ${product.name}. ${specs}. ${standard ? standard + ". " : ""}${priceHint} Поставки по всему Казахстану. Запросить КП: ${COMPANY.phoneDisplay}.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

function getRelatedProducts(
  allProducts: PublicCatalogProduct[],
  productId: string,
  subcategory: string,
  category: string,
  count: number,
) {
  let pool = allProducts.filter(
    (p) => p.subcategory === subcategory && p.id !== productId,
  );
  if (pool.length < count) {
    const extra = allProducts.filter(
      (p) =>
        p.category === category &&
        p.id !== productId &&
        !pool.some((r) => r.id === p.id),
    );
    pool = [...pool, ...extra];
  }
  return pool.slice(0, count);
}

function getActuatorSubcategorySlug(
  categoryId: string,
  categories: PublicCatalogCategory[],
): string | undefined {
  const targetSubcategoryIdByCategory: Record<string, string> = {
    zadvizhki: "elektroprivody-dlya-zadvizhek",
    zatvory: "elektroprivody-dlya-zatvorov",
    klapany: "elektroprivody-dlya-klapanov",
  };
  const subcategoryId = targetSubcategoryIdByCategory[categoryId];
  if (!subcategoryId) return undefined;

  for (const category of categories) {
    const subcategory = category.subcategories.find((sub) => sub.id === subcategoryId);
    if (subcategory) return subcategory.slug;
  }
  return undefined;
}

/* ── Trust strip data ────────────────────────────────────────────── */

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Гарантия качества", sub: "Сертификаты и паспорта" },
  { icon: Truck, label: "Доставка по РК", sub: "Алматы, Астана и регионы" },
  { icon: BadgeCheck, label: "Официальный импорт", sub: "Таможенные декларации" },
] as const;

/* ── Page component ──────────────────────────────────────────────── */

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, categories, allProducts] = await Promise.all([
    getPublicProductBySlug(slug),
    getPublicCatalogCategories(),
    getPublicCatalogProducts(),
  ]);

  if (!product) notFound();

  const category = await getPublicCategoryById(product.category);
  const related = getRelatedProducts(
    allProducts,
    product.id,
    product.subcategory,
    product.category,
    4,
  );
  const specsEntries = Object.entries(product.specs);
  const waUrl = buildCompanyProductInquiryWhatsAppUrl(product.name, {
    dn: product.dn,
    pn: product.pn,
  });
  const categoryVisual = getCategoryVisual(product.category);
  const breadcrumbJsonLd = buildProductBreadcrumbJsonLd(product);
  const productJsonLd = buildProductJsonLd(product);
  const actuatorSubcategorySlug = getActuatorSubcategorySlug(
    product.category,
    categories,
  );
  const showActuatorBlock =
    Boolean(actuatorSubcategorySlug) && product.controlType !== "Электропривод";
  const actuatorHref = actuatorSubcategorySlug
    ? `/catalog/subcategory/${actuatorSubcategorySlug}`
    : "/catalog/category/elektroprivody";
  const heroImageSrc =
    product.primaryImageUrl || product.images?.[0]?.url || categoryVisual.imageSrc;
  const heroImageAlt =
    product.primaryImageAlt ||
    product.images?.[0]?.alt ||
    `${product.categoryName} — ${product.name}`;
  const heroImageRemote =
    heroImageSrc.startsWith("http://") || heroImageSrc.startsWith("https://");

  const formattedPrice =
    product.price && !product.priceByRequest ? formatPrice(product.price) : null;

  return (
    <div className="bg-white">
      <JsonLd id={`breadcrumbs-${product.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`product-${product.slug}`} data={productJsonLd} />
      {/* ── Breadcrumbs ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-slate-50">
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
                  href={`/catalog/category/${category?.slug ?? product.category}`}
                  className="hover:text-slate-900 transition-colors"
                >
                  {product.categoryName}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-300" />
              </li>
              <li>
                <span className="font-medium text-slate-900 line-clamp-1">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Main product section ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — Product image (DB) with category fallback */}
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:min-h-[400px]">
            <Image
              src={heroImageSrc}
              alt={heroImageAlt}
              fill
              priority
              quality={95}
              unoptimized={heroImageRemote}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/15 to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {product.categoryName}
            </span>
          </div>

          {/* RIGHT — Product info */}
          <div className="flex flex-col">
            {/* Category + subcategory label */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
                {product.categoryName}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {product.subcategoryName}
              </span>
            </div>

            {/* Product title */}
            <h1 className="mb-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Spec chips */}
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

            {/* Short description */}
            <p className="mb-8 text-base leading-relaxed text-slate-600">
              {product.shortDescription}
            </p>

            {showActuatorBlock && (
              <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 text-blue-700">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Комплектация электроприводом
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Для этой позиции доступна комплектация электроприводом с подбором
                      по DN/PN и условиям эксплуатации.
                    </p>
                    <Link
                      href={actuatorHref}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-600"
                    >
                      Смотреть электроприводы
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Price block */}
            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              {formattedPrice ? (
                <>
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                    Цена за единицу
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {formattedPrice}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Без НДС. Цена уточняется при оформлении заказа.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-blue-700">
                    Цена по запросу
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Укажите количество и сроки — подготовим КП в течение 2 часов.
                  </p>
                </>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 rounded-xl bg-blue-700 text-base font-semibold hover:bg-blue-600"
                asChild
              >
                <a href="#request-section">
                  <Phone className="mr-2 h-4 w-4" />
                  Запросить КП
                </a>
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-xl border-0 bg-green-500 text-base font-semibold text-white hover:bg-green-600"
                asChild
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <Icon size={20} strokeWidth={1.5} className="text-blue-700" />
                  <p className="text-xs font-semibold leading-tight text-slate-800">
                    {label}
                  </p>
                  <p className="text-[11px] leading-tight text-slate-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Specs table ─────────────────────────────────────────────── */}
      {specsEntries.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
              {/* Description column */}
              <div>
                <h2 className="mb-5 text-xl font-bold text-slate-900">
                  Описание
                </h2>
                <p className="text-base leading-[1.75] text-slate-600">
                  {product.shortDescription}
                </p>
                {category && (
                  <div className="mt-6">
                    <Link
                      href={`/catalog/category/${category.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-600 transition-colors"
                    >
                      Все {category.name.toLowerCase()}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Specs table column */}
              <div>
                <h2 className="mb-5 text-xl font-bold text-slate-900">
                  Технические характеристики
                </h2>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full">
                    <tbody>
                      {specsEntries.map(([label, value], idx) => (
                        <tr
                          key={label}
                          className={
                            idx % 2 === 0
                              ? "bg-white"
                              : "bg-slate-50"
                          }
                        >
                          <td className="w-1/2 border-r border-slate-100 px-5 py-3 text-sm font-medium text-slate-500">
                            {label}
                          </td>
                          <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Request CTA + embedded form ─────────────────────────────── */}
      <div id="request-section" className="bg-blue-700 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Нужна помощь с подбором?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-blue-200">
            Наши инженеры помогут выбрать арматуру по рабочим параметрам.
            Звоните или пишите — ответим быстро.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-xl bg-white text-base font-semibold text-blue-800 hover:bg-blue-50"
              asChild
            >
              <a href={COMPANY_PHONE_HREF}>
                <Phone className="mr-2 h-4 w-4" />
                Позвонить нам
              </a>
            </Button>
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

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/20 bg-white/5 p-5 text-left">
            <p className="mb-4 text-sm font-semibold text-white">
              Быстрая заявка по этой позиции
            </p>
            <QuickRequestForm
              variant="dark"
              source={`product-${product.slug}`}
              productContext={{
                productName: product.name,
                productSlug: product.slug,
                productCategory: product.categoryName,
                productSubcategory: product.subcategoryName,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Related products ─────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">
                Похожие позиции
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/catalog/category/${category?.slug ?? product.category}`}>
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
