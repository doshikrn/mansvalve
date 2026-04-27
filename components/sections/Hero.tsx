import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import { getCategoryVisual } from "@/lib/category-visuals";
import { applyCountTemplate } from "@/lib/site-content/models";
import { resolveHomeHero } from "@/lib/site-content/public";
import { buildCompanyWhatsAppUrl, COMPANY_GMAIL_COMPOSE_KP_URL } from "@/lib/company";

const HERO_KP_WHATSAPP_MESSAGE =
  "Здравствуйте! Хочу получить КП по промышленной запорной арматуре.";

/** Маркетинговая цифра для блока статистики (не подменяет счётчики в карточках категорий). */
const HERO_MARKETING_POSITIONS_LABEL = "700+ позиций";

function getFeaturedProducts(
  categories: Awaited<ReturnType<typeof getPublicCatalogCategories>>,
  products: Awaited<ReturnType<typeof getPublicCatalogProducts>>,
) {
  return categories
    .slice(0, 4)
    .map((cat) => products.find((p) => p.category === cat.id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

export async function Hero() {
  const [cats, prods] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicCatalogProducts(),
  ]);
  const heroContent = await resolveHomeHero(prods.length);
  const featured = getFeaturedProducts(cats, prods);
  const productCount = prods.length;

  const stats = [
    { val: heroContent.stat1Val, label: heroContent.stat1Label },
    { val: HERO_MARKETING_POSITIONS_LABEL, label: heroContent.stat2Label },
    { val: heroContent.stat3Val, label: heroContent.stat3Label },
  ];

  const featuredLink = applyCountTemplate(heroContent.featuredLinkTemplate, productCount);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-200">
              <MapPin className="h-4 w-4" />
              {heroContent.eyebrow}
            </div>

            <h1 className="mb-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              {heroContent.h1Line1}{" "}
              <span className="text-blue-400">{heroContent.h1Highlight}</span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {heroContent.subhead}
            </p>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-blue-500 px-9 text-base font-semibold shadow-[0_12px_32px_-8px_rgba(59,130,246,0.65)] ring-1 ring-blue-300/30 transition-all hover:bg-blue-400 hover:shadow-[0_18px_40px_-8px_rgba(59,130,246,0.75)]"
              >
                <a
                  href={buildCompanyWhatsAppUrl(HERO_KP_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  {heroContent.primaryCta}
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
                </a>
              </Button>

              <Link
                href={COMPANY_GMAIL_COMPOSE_KP_URL}
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-base font-medium text-slate-200 transition-colors hover:text-white"
              >
                <FileText className="h-5 w-5 text-blue-300 transition-colors group-hover:text-blue-200" />
                <span className="border-b border-dashed border-slate-500 pb-0.5 group-hover:border-white">
                  {heroContent.secondaryCta}
                </span>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {heroContent.trustPoints.map((point, i) => (
                <span
                  key={`${i}-${point.slice(0, 12)}`}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 border-t border-slate-700/70 pt-6 sm:grid-cols-3 sm:gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-lg font-bold text-white sm:text-xl">
                    {s.val}
                  </div>
                  <div className="mt-1 text-xs leading-snug text-slate-400 sm:text-[13px]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.8)] backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                    {heroContent.featuredEyebrow}
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    {heroContent.featuredTitle}
                  </div>
                </div>
                <Link
                  href="/catalog"
                  className="shrink-0 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200"
                >
                  {featuredLink}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-3">
                {featured.map((product) => {
                  const visual = getCategoryVisual(product.category);
                  const hasDirectPrice =
                    product.price != null && !product.priceByRequest;

                  return (
                    <article
                      key={product.id}
                      className="group relative overflow-hidden rounded-xl border border-white/12 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/70 hover:bg-white/[0.09] hover:shadow-[0_20px_40px_-20px_rgba(59,130,246,0.8)]"
                    >
                      <Link
                        href={`/catalog/${product.slug}`}
                        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        <div className="relative aspect-[4/3] w-full border-b border-white/10 bg-slate-100">
                          <Image
                            src={visual.imageSrc}
                            alt={visual.imageAlt}
                            fill
                            quality={100}
                            sizes="(max-width: 640px) 50vw, 240px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                        </div>
                      </Link>
                      <div className="p-3">
                        <p className="line-clamp-2 text-left text-xs font-semibold leading-snug text-white sm:text-[13px]">
                          {product.name}
                        </p>
                        <p className="mt-1 truncate text-left text-[11px] text-slate-400">
                          {product.categoryName}
                        </p>

                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-blue-200">
                              {hasDirectPrice && product.price != null
                                ? formatPrice(product.price)
                                : "По запросу"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {hasDirectPrice ? "ориентир по прайсу" : "цена в КП"}
                            </p>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-semibold text-white transition-all duration-300 hover:bg-white/20 group-hover:border-blue-300/70 group-hover:bg-blue-500/20"
                          >
                            <Link href={`/catalog/${product.slug}`}>
                              Подробнее
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
