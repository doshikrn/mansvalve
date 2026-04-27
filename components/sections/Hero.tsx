import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, FileText, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import { getCategoryVisual } from "@/lib/category-visuals";
import { applyCountTemplate, MARKETING_CATALOG_LINK_COUNT } from "@/lib/site-content/models";
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

  const stats = [
    { val: heroContent.stat1Val, label: heroContent.stat1Label },
    { val: HERO_MARKETING_POSITIONS_LABEL, label: heroContent.stat2Label },
    { val: heroContent.stat3Val, label: heroContent.stat3Label },
  ];

  const featuredLink = applyCountTemplate(
    heroContent.featuredLinkTemplate,
    MARKETING_CATALOG_LINK_COUNT,
  );

  const statIcons = [Clock, Package, MapPin] as const;

  return (
    <section className="relative overflow-hidden border-b border-site-deep bg-site-deep">
      {/* Controlled industrial depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,27,45,0.98)_0%,rgba(18,40,67,0.98)_48%,rgba(21,49,80,0.95)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_70%_at_-12%_18%,rgba(29,78,216,0.42)_0%,rgba(29,78,216,0.14)_42%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_62%_at_96%_16%,rgba(234,88,12,0.12)_0%,rgba(234,88,12,0.035)_36%,transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.08)_100%)] lg:block"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.32) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.5)_0%,transparent_34%,rgba(2,6,23,0.62)_100%)]"
        aria-hidden
      />

      <div className="site-container relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10 xl:gap-12">
          <div className="hero-enter-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-4 py-1.5 text-sm font-semibold text-slate-200 shadow-sm">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              {heroContent.eyebrow}
            </div>

            <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              {heroContent.h1Line1}{" "}
              <span className="text-[#bfdbfe]">
                {heroContent.h1Highlight}
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-[17px]">
              {heroContent.subhead}
            </p>

            <div className="relative">
              <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                asChild
                size="lg"
                className="site-primary-cta h-auto min-h-[3.5rem] px-8 py-[0.875rem] text-base font-semibold tracking-tight sm:min-h-[3.625rem] sm:text-lg"
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
                className="group inline-flex min-h-[3.5rem] items-center justify-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:border-white/30 hover:bg-white/[0.12] hover:text-white sm:self-center"
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-white" />
                <span>
                  {heroContent.secondaryCta}
                </span>
              </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {heroContent.trustPoints.map((point, i) => (
                <span
                  key={`${i}-${point.slice(0, 12)}`}
                  className="rounded-lg border border-white/12 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-8 border-t border-white/15 pt-8 sm:flex-row sm:gap-0 sm:divide-x sm:divide-white/15">
              {stats.map((s, idx) => {
                const Icon = statIcons[idx] ?? Clock;
                return (
                  <div
                    key={s.label}
                    className="flex gap-3 rounded-lg transition-colors duration-200 ease-out hover:bg-white/[0.05] motion-reduce:hover:bg-transparent sm:flex-1 sm:px-6 first:sm:pl-0 last:sm:pr-0"
                  >
                    <Icon
                    className="mt-1 h-5 w-5 shrink-0 text-site-cta"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="text-2xl font-bold tabular-nums tracking-tight text-white sm:text-[1.65rem] lg:text-[1.75rem]">
                        {s.val}
                      </div>
                      <div className="mt-1 max-w-[13rem] text-[10px] leading-snug text-slate-400 sm:text-[11px]">
                        {s.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:mt-6 lg:translate-y-2">
            <div className="hero-enter-right rounded-lg border border-site-border bg-white p-5 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-site-primary">
                    {heroContent.featuredEyebrow}
                  </div>
                  <div className="mt-1 text-base font-semibold text-site-ink">
                    {heroContent.featuredTitle}
                  </div>
                </div>
                <Link
                  href="/catalog"
                  className="shrink-0 text-sm font-semibold text-site-cta transition-colors hover:text-orange-700"
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
                      className="group relative overflow-hidden rounded-lg border border-site-border bg-white transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:border-site-primary/45 hover:shadow-md hover:shadow-site-deep/10 motion-reduce:hover:translate-y-0"
                    >
                      <Link
                        href={`/catalog/${product.slug}`}
                        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary/50 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-[4/3] w-full border-b border-site-border bg-slate-100">
                          <Image
                            src={visual.imageSrc}
                            alt={visual.imageAlt}
                            fill
                            quality={100}
                            sizes="(max-width: 640px) 50vw, 240px"
                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent opacity-55 transition-opacity duration-300 group-hover:opacity-70" />
                        </div>
                      </Link>
                      <div className="p-3">
                        <p className="line-clamp-2 text-left text-xs font-semibold leading-snug text-site-ink sm:text-[13px]">
                          {product.name}
                        </p>
                        <p className="mt-1 truncate text-left text-[11px] text-slate-500">
                          {product.categoryName}
                        </p>

                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-site-primary">
                              {hasDirectPrice && product.price != null
                                ? formatPrice(product.price)
                                : "По запросу"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {hasDirectPrice ? "ориентир по прайсу" : "цена в КП"}
                            </p>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-lg border border-site-border bg-slate-100 px-3 text-[11px] font-semibold text-slate-700 transition-all duration-200 hover:border-site-primary/45 hover:bg-slate-200"
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
