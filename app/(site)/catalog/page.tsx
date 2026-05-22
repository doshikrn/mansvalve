import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  FileCheck2,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";

import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { buildCompanyWhatsAppUrl, COMPANY_BRAND_SEO } from "@/lib/company";
import { buildCollectionPageJsonLd } from "@/lib/structured-data";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
} from "@/lib/public-catalog";
import { getOrderedCatalogCategories } from "@/lib/catalog-seo";

export const revalidate = 300;

/* ── SEO ──────────────────────────────────────────────────────────── */

const CATALOG_TITLE = "Каталог промышленной арматуры";
const CATALOG_DESCRIPTION =
  "Задвижки, затворы дисковые, краны шаровые, клапаны обратные, компенсаторы, фланцы и электроприводы. Подбор по типу товара, DN, PN, марке и материалу.";

const CATALOG_REQUEST_WA_MESSAGE =
  "Здравствуйте! Помогите подобрать арматуру по проекту. Готов скинуть спецификацию.";

const CATALOG_TRUST_PILLS = [
  { label: "ГОСТ / DIN / ISO", Icon: ShieldCheck },
  { label: "КП за 15 минут", Icon: Timer },
  { label: "Доставка по РК", Icon: Truck },
  { label: "Документы и НДС", Icon: FileCheck2 },
] as const;

export const metadata: Metadata = {
  title: CATALOG_TITLE,
  description: CATALOG_DESCRIPTION,
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    title: `${CATALOG_TITLE} | ${COMPANY_BRAND_SEO}`,
    description: CATALOG_DESCRIPTION,
    url: "/catalog",
    siteName: COMPANY_BRAND_SEO,
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${CATALOG_TITLE} | ${COMPANY_BRAND_SEO}`,
    description: CATALOG_DESCRIPTION,
  },
};

/* ── Page ─────────────────────────────────────────────────────────── */

interface PageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getPublicCatalogListingProducts(),
    getPublicCatalogCategories(),
  ]);
  const orderedCategories = getOrderedCatalogCategories(categories);
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    path: "/catalog",
  });

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id="collection-page-catalog" data={collectionPageJsonLd} />

      {/* Premium hero band */}
      <section
        className="relative isolate overflow-hidden bg-[#081428] text-white"
        aria-labelledby="catalog-page-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(226,232,240,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-[10%] top-0 h-full w-[60%] bg-gradient-to-r from-[rgb(47_107_255_/_.10)] via-transparent to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-[min(120%,820px)] w-[min(100vw,720px)] -translate-y-1/2 rounded-full opacity-[0.18]"
          style={{
            background: "radial-gradient(circle at center, #2F6BFF 0%, transparent 68%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-500" />
              </li>
              <li>
                <span className="font-medium text-white" aria-current="page">
                  Каталог
                </span>
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_minmax(280px,360px)] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8bb4ff]">
                Промышленная арматура · опт и розница
              </p>
              <h1
                id="catalog-page-heading"
                className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[44px]"
              >
                {CATALOG_TITLE}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-[17px]">
                {CATALOG_DESCRIPTION}
              </p>

              <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Позиций</dt>
                  <dd className="text-lg font-bold tabular-nums text-white">
                    {products.length}
                  </dd>
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    позиций
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Категорий</dt>
                  <dd className="text-lg font-bold tabular-nums text-white">
                    {orderedCategories.length}
                  </dd>
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    категорий
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Диапазон DN</dt>
                  <dd className="text-lg font-bold tabular-nums text-white">DN15–DN1000</dd>
                </div>
              </dl>

              <ul className="mt-5 flex flex-wrap gap-1.5 sm:gap-2">
                {CATALOG_TRUST_PILLS.map(({ label, Icon }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-200 sm:text-xs"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#8bb4ff]" strokeWidth={2} aria-hidden />
                    <span className="whitespace-nowrap">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-stretch gap-2.5 self-end">
              <Button asChild size="lg" className="site-primary-cta h-12 px-5 text-base">
                <a
                  href={buildCompanyWhatsAppUrl(CATALOG_REQUEST_WA_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Запросить подбор
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <Link
                href="/certificates"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/22 bg-white/[0.05] px-5 text-sm font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/[0.08]"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#8bb4ff]" aria-hidden />
                Все сертификаты
              </Link>
              <p className="text-center text-xs leading-relaxed text-slate-400 sm:text-left">
                Технический менеджер ответит за 15 минут в рабочее время.
              </p>
            </div>
          </div>
        </div>

        <div className="h-[10px] bg-gradient-to-b from-[#081428] via-[#1b2b46] to-site-bg" aria-hidden />
      </section>

      {/* Filters + grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <CatalogShell
          products={products}
          categories={orderedCategories}
          searchParams={params}
        />
      </div>
    </div>
  );
}
