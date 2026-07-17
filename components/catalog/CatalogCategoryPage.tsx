import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, BadgeCheck, FileText, Phone } from "lucide-react";

import {
  countPublicProductsBySubcategory,
  countPublicProductsByCategory,
  getPublicCatalogCategories,
  getPublicProductsByCategory,
  getPublicCategoryBySlug,
  type PublicCatalogCategory as Category,
  type PublicCatalogSubcategory as Subcategory,
} from "@/lib/public-catalog";
import {
  resolveCategoryHeroImageUrl,
  resolveCategorySeoForPublicPage,
  resolveCategorySeoMetaDescription,
} from "@/lib/services/category-public-content";
import { CatalogRouteError } from "@/components/catalog/CatalogRouteError";
import { CatalogShellSuspense } from "@/components/catalog/CatalogShellSuspense";
import type { CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { withCatalogRouteLoad } from "@/lib/catalog/runtime";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import {
  COMPANY,
  COMPANY_BRAND_SEO,
  COMPANY_PHONE_HREF,
  COMPANY_WHATSAPP_BASE_URL,
} from "@/lib/company";
import { getCategoryVisual } from "@/lib/category-visuals";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";
import {
  getCategoryQuickLinks,
  getCategorySeo,
  getOrderedCatalogCategories,
} from "@/lib/catalog-seo";
import { appendPageNumberSuffix, buildPagedMeta } from "@/lib/seo/metadata";
import {
  buildCategoryBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/structured-data";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { resolveCatalogTaxonomySeo } from "@/lib/catalog-taxonomy-seo";

const TRUST_ICONS = [ShieldCheck, BadgeCheck, Truck, FileText] as const;

function findSelectedSubcategory(
  category: Category,
  searchParams?: CatalogSearchParams,
): Subcategory | undefined {
  const selectedSlug = searchParams?.subcategory?.trim();
  if (!selectedSlug) return undefined;
  return category.subcategories.find(
    (sub) => sub.slug === selectedSlug || sub.id === selectedSlug,
  );
}

function resolveSubcategoryIntro(
  category: Category,
  subcategory: Subcategory,
  productCount: number,
): string {
  return (
    subcategory.description?.trim() ||
    subcategory.seoMetaDescription?.trim() ||
    `${subcategory.name} (${category.name}): ${productCount} позиций в наличии и под заказ. Подбор по DN/PN, КП, НДС, сертификаты и доставка по Казахстану.`
  );
}

export async function getCatalogCategoryMetadata(
  categorySlug: string,
  searchParams?: CatalogSearchParams,
): Promise<Metadata> {
  let category: Category | undefined;
  try {
    category = await getPublicCategoryBySlug(categorySlug);
  } catch (error) {
    console.error("[catalog-category] metadata load failed", {
      categorySlug,
      error,
    });
    return { title: "Каталог MANSVALVE GROUP" };
  }

  if (!category) return { title: "Категория не найдена" };

  try {
  const selectedSubcategory = findSelectedSubcategory(category, searchParams);
  const productCount = selectedSubcategory
    ? await countPublicProductsBySubcategory(selectedSubcategory.id)
    : await countPublicProductsByCategory(category.id);
  const seoPreset = getCategorySeo(category);
  const customMeta = await resolveCategorySeoMetaDescription(categorySlug);
  const adminDescription = category.description?.trim();
  const autoDescription = selectedSubcategory
    ? resolveSubcategoryIntro(category, selectedSubcategory, productCount)
    : adminDescription ||
      seoPreset?.description ||
      buildCategoryPageDescription(category, productCount);

  const canonicalPath = catalogCategoryPath(category.slug);
  const autoTitle = selectedSubcategory
    ? `${selectedSubcategory.name} — ${category.name} · Казахстан`
    : seoPreset?.title || `${category.name} — каталог арматуры`;
  const resolvedSeo = resolveCatalogTaxonomySeo({
    name: selectedSubcategory?.name ?? category.name,
    h1Override: selectedSubcategory ? selectedSubcategory.h1Override : category.h1Override,
    seoTitle: selectedSubcategory ? selectedSubcategory.seoTitle : category.seoTitle,
    seoMetaDescription: selectedSubcategory
      ? selectedSubcategory.seoMetaDescription
      : customMeta ?? category.seoMetaDescription,
    autoH1: selectedSubcategory?.name ?? seoPreset?.h1 ?? category.name,
    autoTitle,
    autoDescription,
  });
  const meta = buildPagedMeta({
    title: resolvedSeo.title,
    description: resolvedSeo.description,
    canonicalPath,
    searchParams,
  });

  return {
    title: meta.metadataTitle,
    description: meta.description,
    robots: meta.robots,
    alternates: {
      canonical: meta.canonicalPath,
    },
    openGraph: {
      title: meta.socialTitle,
      description: meta.description,
      url: meta.canonicalPath,
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.socialTitle,
      description: meta.description,
    },
  };
  } catch (error) {
    console.error("[catalog-category] metadata resolve failed", {
      categorySlug,
      error,
    });
    return { title: category.name };
  }
}

interface CatalogCategoryPageProps {
  categorySlug: string;
  searchParams: Promise<CatalogSearchParams>;
}

export async function CatalogCategoryPage({ categorySlug, searchParams }: CatalogCategoryPageProps) {
  const query = await searchParams;
  const route = `/catalog/${categorySlug}`;
  const loaded = await withCatalogRouteLoad(
    { route, categorySlug },
    async () => {
      const category = await getPublicCategoryBySlug(categorySlug);
      if (!category) return null;

      const [allCategories, categoryProducts, seo, heroImageUrl, metaDescriptionOverride] =
        await Promise.all([
          getPublicCatalogCategories(),
          getPublicProductsByCategory(category.id),
          resolveCategorySeoForPublicPage(categorySlug),
          resolveCategoryHeroImageUrl(categorySlug),
          resolveCategorySeoMetaDescription(categorySlug),
        ]);

      return {
        category,
        allCategories,
        categoryProducts,
        seo,
        heroImageUrl,
        metaDescriptionOverride,
      };
    },
    (data) =>
      data
        ? {
            productsCount: data.categoryProducts.length,
            categoriesCount: data.allCategories.length,
          }
        : {},
  );

  if (!loaded.ok) {
    return <CatalogRouteError route={route} />;
  }

  if (!loaded.data) {
    notFound();
  }

  const {
    category,
    allCategories,
    categoryProducts,
    seo,
    heroImageUrl,
    metaDescriptionOverride,
  } = loaded.data;
  const selectedSubcategory = findSelectedSubcategory(category, query);
  const selectedSubcategoryProducts = selectedSubcategory
    ? categoryProducts.filter((product) => product.subcategory === selectedSubcategory.slug)
    : [];
  const selectedSubcategoryDescription = selectedSubcategory
    ? resolveSubcategoryIntro(
        category,
        selectedSubcategory,
        selectedSubcategoryProducts.length,
      )
    : undefined;
  const categorySeoPreset = getCategorySeo(category);
  const autoDescription =
    selectedSubcategoryDescription ||
    category.description?.trim() ||
    categorySeoPreset?.description ||
    buildCategoryPageDescription(category, categoryProducts.length);
  const visibleDescription =
    selectedSubcategoryDescription || category.description?.trim() || autoDescription;
  const autoH1 = selectedSubcategory?.name ?? categorySeoPreset?.h1 ?? category.name;
  const autoTitle = selectedSubcategory
    ? `${selectedSubcategory.name} — ${category.name} · Казахстан`
    : categorySeoPreset?.title || `${category.name} — каталог арматуры`;
  const resolvedSeo = resolveCatalogTaxonomySeo({
    name: selectedSubcategory?.name ?? category.name,
    h1Override: selectedSubcategory ? selectedSubcategory.h1Override : category.h1Override,
    seoTitle: selectedSubcategory ? selectedSubcategory.seoTitle : category.seoTitle,
    seoMetaDescription: selectedSubcategory
      ? selectedSubcategory.seoMetaDescription
      : metaDescriptionOverride ?? category.seoMetaDescription,
    autoH1,
    autoTitle,
    autoDescription,
  });
  const pageCanonicalPath = selectedSubcategory
    ? catalogSubcategoryPath(category.slug, selectedSubcategory.slug)
    : catalogCategoryPath(category.slug);
  const pageMeta = buildPagedMeta({
    title: resolvedSeo.title,
    description: resolvedSeo.description,
    canonicalPath: pageCanonicalPath,
    searchParams: query,
  });
  const pageH1 = appendPageNumberSuffix(resolvedSeo.h1, pageMeta.pageNumber);
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
    name: pageH1,
    description: pageMeta.description,
    path: pageMeta.canonicalPath,
  });

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id={`breadcrumbs-${category.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`collection-page-${category.slug}`} data={collectionPageJsonLd} />
      <div className="border-b border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
                  {resolvedSeo.h1}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="site-heading text-slate-900">
            {pageH1}
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            {categoryProducts.length}{" "}
            {pluralProducts(categoryProducts.length)} · {category.subcategories.length}{" "}
            {pluralSubcategories(category.subcategories.length)}
          </p>
          {!pageMeta.pageNumber && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 line-clamp-2">
              {visibleDescription}
            </p>
          )}

          <ul className="site-catalog-benefits mt-4">
            <li className="inline-flex items-center gap-2">
              <FileText size={16} className="shrink-0 text-site-primary" aria-hidden />
              КП за 15 минут
            </li>
            <li className="inline-flex items-center gap-2">
              <Truck size={16} className="shrink-0 text-site-primary" aria-hidden />
              Склад в Алматы
            </li>
            <li className="inline-flex items-center gap-2">
              <BadgeCheck size={16} className="shrink-0 text-site-primary" aria-hidden />
              Сертификаты ГОСТ и ISO
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={COMPANY_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-primary-cta inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold"
            >
              <WhatsappIcon className="h-4 w-4" />
              Написать в WhatsApp
            </a>
            <a
              href={COMPANY_PHONE_HREF}
              aria-label={`Позвонить: ${COMPANY.phoneDisplay}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-site-border bg-site-card px-5 text-sm font-semibold text-site-primary shadow-sm transition-colors hover:border-site-primary hover:bg-[#EFF6FF]"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              Позвонить
            </a>
          </div>

          <div className="site-catalog-hero-frame relative mt-5 h-32 sm:h-40">
            <Image
              src={heroSrc}
              alt={heroAlt}
              fill
              priority
              loading="eager"
              unoptimized={mediaImageNeedsUnoptimized(heroSrc)}
              quality={88}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1200px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-slate-900/25" />
          </div>

          {(quickLinks.length > 0 || category.subcategories.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quickLinks.length > 0 ? (
                quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-site-border bg-site-bg px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-site-primary hover:bg-[#EFF6FF] hover:text-site-primary-hover"
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={catalogSubcategoryPath(category.slug, sub.slug)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-site-border bg-site-bg px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-site-primary hover:bg-[#EFF6FF] hover:text-site-primary-hover"
                  >
                    {sub.name}
                    <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] text-slate-700">
                      {subcategoryCounts.get(sub.id) ?? 0}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CatalogShellSuspense
          products={categoryProducts}
          categories={displayCategories}
          searchParams={searchParams}
          lockedCategoryId={category.id}
        />
      </div>

      {seo && !pageMeta.pageNumber && (
        <section className="bg-site-bg">
          <div className="mx-auto max-w-7xl px-4 pt-2 pb-10 sm:px-6">
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

      {seo && !pageMeta.pageNumber && (
        <section className="border-t border-site-border bg-site-card">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="prose prose-slate max-w-3xl">
              {seo.topSeo.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {seo.bottomSeo.map((p, i) => (
                <p key={`bottom-${i}`}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {seo && !pageMeta.pageNumber && (
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
  return `${category.name}: ${productCount} позиций в наличии и под заказ. Подбор по DN/PN, КП, НДС, сертификаты и доставка по Казахстану.`;
}
