import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, FileText, MapPin, Package } from "lucide-react";
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

  const statIcons = [Clock, Package, MapPin] as const;

  return (
    <section className="relative overflow-hidden bg-[#0F1C2E]">
      {/* Left: cool blue luminance */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_110%_90%_at_-5%_45%,rgba(29,78,216,0.38)_0%,rgba(29,78,216,0.08)_38%,transparent_62%)]"
        aria-hidden
      />
      {/* Right: warm accent (subtle) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_108%_18%,rgba(234,88,12,0.14)_0%,rgba(234,88,12,0.03)_35%,transparent_58%)]"
        aria-hidden
      />
      {/* Soft lift toward center */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_100%,rgba(15,28,46,0.55)_0%,transparent_58%)]"
        aria-hidden
      />
      {/* Grid: very low contrast */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.28) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      {/* Depth: dark vignette / floor */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070b12]/85 via-transparent to-[#05080e]/95"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(0,0,0,0.35)_0%,transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10 xl:gap-12">
          <div className="hero-enter-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-600/70 bg-zinc-950/90 px-4 py-1.5 text-sm font-medium text-zinc-400">
              <MapPin className="h-4 w-4 shrink-0 text-zinc-500" />
              {heroContent.eyebrow}
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              {heroContent.h1Line1}{" "}
              <span className="bg-gradient-to-r from-[#bfdbfe] via-[#60a5fa] to-[#1d4ed8] bg-clip-text text-transparent">
                {heroContent.h1Highlight}
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-[17px]">
              {heroContent.subhead}
            </p>

            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-x-6 -inset-y-5 rounded-[3rem] bg-[radial-gradient(ellipse_at_50%_50%,rgba(234,88,12,0.18)_0%,rgba(234,88,12,0.05)_42%,transparent_72%)] opacity-90 sm:-inset-x-10"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Button
                asChild
                size="lg"
                className="h-auto min-h-[3.75rem] rounded-full border border-orange-950/80 bg-gradient-to-b from-orange-600 via-orange-700 to-orange-900 px-10 py-[0.875rem] text-lg font-semibold tracking-tight text-white shadow-[0_0_0_1px_rgba(251,146,60,0.35),0_0_40px_-4px_rgba(234,88,12,0.55),0_6px_0_0_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.55)] ring-1 ring-orange-400/30 transition-[transform,box-shadow,filter] duration-300 ease-out hover:-translate-y-1 hover:from-orange-500 hover:via-orange-600 hover:to-orange-800 hover:shadow-[0_0_0_1px_rgba(253,186,116,0.5),0_0_56px_-2px_rgba(234,88,12,0.62),0_10px_0_0_rgba(0,0,0,0.38),0_18px_40px_-10px_rgba(234,88,12,0.42)] hover:ring-orange-300/50 active:translate-y-0 active:scale-[0.98] active:shadow-[0_0_28px_-6px_rgba(234,88,12,0.45),0_4px_0_0_rgba(0,0,0,0.52)] motion-reduce:hover:-translate-y-0 motion-reduce:hover:shadow-[0_0_0_1px_rgba(251,146,60,0.35),0_0_40px_-4px_rgba(234,88,12,0.55),0_6px_0_0_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.55)] motion-reduce:active:scale-100 sm:min-h-[3.875rem]"
              >
                <a
                  href={buildCompanyWhatsAppUrl(HERO_KP_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center"
                >
                  {heroContent.primaryCta}
                  <ArrowRight className="ml-2.5 h-5 w-5 shrink-0" />
                </a>
              </Button>

              <Link
                href={COMPANY_GMAIL_COMPOSE_KP_URL}
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                className="group inline-flex items-center justify-center gap-2 self-start rounded-full border border-zinc-600 bg-zinc-950/90 px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 sm:self-center"
              >
                <FileText className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                <span className="border-b border-transparent pb-px transition-[border-color,color] group-hover:border-zinc-500 group-hover:text-zinc-100">
                  {heroContent.secondaryCta}
                </span>
              </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {heroContent.trustPoints.map((point, i) => (
                <span
                  key={`${i}-${point.slice(0, 12)}`}
                  className="rounded-full border border-zinc-700 bg-zinc-950/70 px-3 py-1 text-xs font-medium text-zinc-400"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-8 border-t border-zinc-700/90 pt-8 sm:flex-row sm:gap-0 sm:divide-x sm:divide-zinc-700/90">
              {stats.map((s, idx) => {
                const Icon = statIcons[idx] ?? Clock;
                return (
                  <div
                    key={s.label}
                    className="flex gap-3 rounded-lg transition-colors duration-300 ease-out hover:bg-white/[0.04] motion-reduce:hover:bg-transparent sm:flex-1 sm:px-6 first:sm:pl-0 last:sm:pr-0"
                  >
                    <Icon
                      className="mt-1 h-5 w-5 shrink-0 text-orange-700/85"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="text-2xl font-bold tabular-nums tracking-tight text-white sm:text-[1.65rem] lg:text-[1.75rem]">
                        {s.val}
                      </div>
                      <div className="mt-1 max-w-[13rem] text-[10px] leading-snug text-zinc-500 sm:text-[11px]">
                        {s.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:mt-6 lg:translate-y-2">
            <div className="hero-enter-right rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_28px_56px_-28px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl backdrop-saturate-150 sm:p-6">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700/95">
                    {heroContent.featuredEyebrow}
                  </div>
                  <div className="mt-1 text-base font-semibold text-zinc-100">
                    {heroContent.featuredTitle}
                  </div>
                </div>
                <Link
                  href="/catalog"
                  className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-500"
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
                      className="group relative overflow-hidden rounded-xl border border-zinc-700 bg-[#0c121c] transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform hover:-translate-y-1 hover:border-zinc-500/85 hover:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.62)] motion-reduce:hover:translate-y-0 motion-reduce:hover:border-zinc-700 motion-reduce:hover:shadow-none"
                    >
                      <Link
                        href={`/catalog/${product.slug}`}
                        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1C2E]"
                      >
                        <div className="relative aspect-[4/3] w-full border-b border-zinc-800 bg-zinc-900">
                          <Image
                            src={visual.imageSrc}
                            alt={visual.imageAlt}
                            fill
                            quality={100}
                            sizes="(max-width: 640px) 50vw, 240px"
                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-[0.85]" />
                        </div>
                      </Link>
                      <div className="p-3">
                        <p className="line-clamp-2 text-left text-xs font-semibold leading-snug text-zinc-100 sm:text-[13px]">
                          {product.name}
                        </p>
                        <p className="mt-1 truncate text-left text-[11px] text-zinc-500">
                          {product.categoryName}
                        </p>

                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#9bb9d6]">
                              {hasDirectPrice && product.price != null
                                ? formatPrice(product.price)
                                : "По запросу"}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {hasDirectPrice ? "ориентир по прайсу" : "цена в КП"}
                            </p>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-full border border-zinc-600 bg-zinc-800 px-3 text-[11px] font-semibold text-zinc-200 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-700 group-hover:border-orange-900/80 group-hover:bg-orange-950/80"
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
