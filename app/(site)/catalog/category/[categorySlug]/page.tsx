import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, BadgeCheck, FileText } from "lucide-react";

import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
  getPublicCategoryBySlug,
  getPublicProductsByCategory,
  type PublicCatalogCategory as Category,
} from "@/lib/public-catalog";
import {
  resolveCategoryHeroImageUrl,
  resolveCategorySeoForPublicPage,
  resolveCategorySeoMetaDescription,
} from "@/lib/services/category-public-content";
import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { getCategoryVisual } from "@/lib/category-visuals";
import {
  getCategoryQuickLinks,
  getCategorySeo,
  getOrderedCatalogCategories,
} from "@/lib/catalog-seo";
import {
  buildCategoryBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/structured-data";

/* ── Static generation for all 6 categories ─────────────────────── */

export async function generateStaticParams() {
  const categories = await getPublicCatalogCategories();
  return categories.map((cat) => ({ categorySlug: cat.slug }));
}

/* ── Per-category SEO metadata ───────────────────────────────────── */

interface PageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getPublicCategoryBySlug(categorySlug);

  if (!category) return { title: "Категория не найдена" };

  const productCount = (await getPublicProductsByCategory(category.id)).length;
  const seoPreset = getCategorySeo(category);
  const customMeta = await resolveCategorySeoMetaDescription(categorySlug);
  const description =
    seoPreset?.description ||
    customMeta?.trim() ||
    buildCategoryPageDescription(category, productCount);

  const title = seoPreset?.title || `${category.name} — каталог арматуры`;

  const canonicalPath = `/catalog/category/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

const TRUST_ICONS = [ShieldCheck, BadgeCheck, Truck, FileText] as const;

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params;
  const category = await getPublicCategoryBySlug(categorySlug);

  if (!category) notFound();

  const resolvedSearch = await searchParams;
  const [allProducts, allCategories, categoryProducts, seo, heroImageUrl, metaDescriptionOverride] =
    await Promise.all([
      getPublicCatalogProducts(),
      getPublicCatalogCategories(),
      getPublicProductsByCategory(category.id),
      resolveCategorySeoForPublicPage(categorySlug),
      resolveCategoryHeroImageUrl(categorySlug),
      resolveCategorySeoMetaDescription(categorySlug),
    ]);
  const metaDescription =
    getCategorySeo(category)?.description ||
    metaDescriptionOverride?.trim() ||
    buildCategoryPageDescription(category, categoryProducts.length);
  const h1 = getCategorySeo(category)?.h1 ?? category.name;
  const displayCategories = getOrderedCatalogCategories(allCategories);
  const subcategoryCounts = categoryProducts.reduce((acc, product) => {
    acc.set(product.subcategory, (acc.get(product.subcategory) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());
  const breadcrumbJsonLd = buildCategoryBreadcrumbJsonLd(category);
  const categoryVisual = getCategoryVisual(category.id);
  const quickLinks = getCategoryQuickLinks(category.id);
  const heroSrc = heroImageUrl ?? categoryVisual.imageSrc;
  const heroAlt = categoryVisual.imageAlt;
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: h1,
    description: metaDescription,
    path: `/catalog/category/${category.slug}`,
  });

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id={`breadcrumbs-${category.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`collection-page-${category.slug}`} data={collectionPageJsonLd} />
      {/* Page header */}
      <div className="border-b border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Хлебные крошки" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Каталог
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  {h1}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {h1}
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            {categoryProducts.length}{" "}
            {pluralProducts(categoryProducts.length)} · {category.subcategories.length}{" "}
            {pluralSubcategories(category.subcategories.length)}
          </p>

          <div className="relative mt-6 h-40 overflow-hidden rounded-2xl border border-site-border bg-slate-100 sm:h-52">
            <Image
              src={heroSrc}
              alt={heroAlt}
              fill
              priority
              unoptimized={Boolean(heroImageUrl)}
              quality={95}
              sizes="(max-width: 640px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-slate-900/25" />
          </div>

          {/* Subcategory links */}
          {(quickLinks.length > 0 || category.subcategories.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickLinks.length > 0 ? (
                quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-site-border bg-site-bg px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-site-primary hover:bg-[#EFF6FF] hover:text-site-primary-hover"
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/catalog/subcategory/${sub.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-site-border bg-site-bg px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-site-primary hover:bg-[#EFF6FF] hover:text-site-primary-hover"
                >
                  {sub.name}
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] text-slate-700">
                    {subcategoryCounts.get(sub.id) ?? 0}
                  </span>
                </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Top SEO text block ─────────────────────────────────────── */}
      {seo && (
        <section className="border-b border-site-border bg-site-card">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="prose prose-slate max-w-3xl">
              {seo.topSeo.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust / commercial block ───────────────────────────────── */}
      {seo && (
        <section className="bg-site-bg">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {seo.trust.map((text, i) => {
                const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-site-border bg-site-card p-5 shadow-sm"
                  >
                    <Icon size={22} className="mt-0.5 shrink-0 text-site-primary" />
                    <p className="text-sm leading-relaxed text-slate-700">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Filters + grid — locked to this category ───────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CatalogShell
          products={allProducts}
          categories={displayCategories}
          searchParams={resolvedSearch}
          lockedCategoryId={category.id}
        />
      </div>

      {/* ── Bottom SEO text block ──────────────────────────────────── */}
      {seo && (
        <section className="border-t border-site-border bg-site-card">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="prose prose-slate max-w-3xl">
              {seo.bottomSeo.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA block with embedded form ───────────────────────────── */}
      {seo && (
        <section className="bg-site-primary text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:flex lg:items-start lg:gap-12">
            <div className="mb-8 lg:mb-0 lg:w-1/2">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {seo.ctaHeading}
              </h2>
              <p className="mt-3 text-lg text-white/90">
                {seo.ctaDescription}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/85">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-white/80" />
                  Бесплатная консультация инженера
                </li>
                <li className="flex items-center gap-2">
                  <Truck size={16} className="text-white/80" />
                  Доставка по всему Казахстану
                </li>
                <li className="flex items-center gap-2">
                  <FileText size={16} className="text-white/80" />
                  КП с ценами за 15 минут
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <QuickRequestForm
                variant="dark"
                source={`category-${categorySlug}`}
                productContext={{
                  productName: category.name,
                  productSlug: categorySlug,
                  productCategory: category.name,
                }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function pluralProducts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "позиция";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "позиции";
  return "позиций";
}

function pluralSubcategories(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "подкатегория";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "подкатегории";
  return "подкатегорий";
}

function buildCategoryPageDescription(category: Category, productCount: number): string {
  const subcategoryNames = category.subcategories.map((s) => s.name).join(", ");
  return (
    `${category.name} — промышленная трубопроводная арматура: ${productCount} позиций в наличии и под заказ. ` +
    `Подкатегории: ${subcategoryNames}. ` +
    "Сертификаты ГОСТ/DIN/ISO, КП, доставка по Казахстану."
  );
}
