"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Gauge, Package, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { getCategoryVisual } from "@/lib/category-visuals";
import { cn } from "@/lib/utils";

type ProductShowcaseCarouselProps = {
  products: PublicCatalogProduct[];
  eyebrow: string;
  title: string;
  linkLabel: string;
  linkHref?: string;
  variant?: "hero" | "catalog";
  heroRibbonLabel?: string;
  catalogBadgeLabel?: string;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductImage(product: PublicCatalogProduct) {
  const visual = getCategoryVisual(product.category);
  return {
    src: product.primaryImageUrl || visual.imageSrc,
    alt: product.primaryImageAlt || visual.imageAlt,
  };
}

export function ProductShowcaseCarousel({
  products,
  eyebrow,
  title,
  linkLabel,
  linkHref = "/catalog",
  variant = "hero",
  heroRibbonLabel = "Витрина",
  catalogBadgeLabel = "Часто запрашивают",
}: ProductShowcaseCarouselProps) {
  const [active, setActive] = useState(0);
  /** Смена nonce при каждом перелистывании — гарантирует remount и перезапуск CSS animation */
  const [animationNonce, setAnimationNonce] = useState(0);
  const product = products[active];
  const image = product ? getProductImage(product) : null;
  const isHero = variant === "hero";

  const bumpSlide = useCallback(() => {
    setAnimationNonce((n) => n + 1);
  }, []);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (products.length <= 1 || nextIndex === active) return;
      bumpSlide();
      setActive(nextIndex);
    },
    [active, products.length, bumpSlide],
  );

  const next = useCallback(() => {
    if (products.length <= 1) return;
    bumpSlide();
    setActive((a) => (a + 1) % products.length);
  }, [products.length, bumpSlide]);

  const prev = useCallback(() => {
    if (products.length <= 1) return;
    bumpSlide();
    setActive((a) => (a - 1 + products.length) % products.length);
  }, [products.length, bumpSlide]);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = window.setInterval(() => {
      bumpSlide();
      setActive((a) => (a + 1) % products.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [products.length, bumpSlide]);

  const specs = useMemo(() => {
    if (!product) return [];
    return [
      { icon: Ruler, label: "DN", value: product.dn != null ? String(product.dn) : "По запросу" },
      { icon: Gauge, label: "PN", value: product.pn != null ? String(product.pn) : "По запросу" },
      { icon: ShieldCheck, label: "Материал", value: product.material || "Не указан" },
    ];
  }, [product]);

  const heroSpecSummary = useMemo(() => {
    if (!product) return null;
    const dn = product.dn != null ? String(product.dn) : "По запросу";
    const pn = product.pn != null ? String(product.pn) : "По запросу";
    const mat = (product.material || "Не указан").trim();
    return { dn, pn, mat };
  }, [product]);

  if (!product || !image) return null;

  const hasDirectPrice = product.price != null && !product.priceByRequest;

  const slideKey = `${variant}-${active}-${product.slug}`;
  const slideReactKey = `${variant}-${animationNonce}-${active}-${product.slug}`;

  const imgSizes = isHero ? "(max-width: 1024px) 100vw, 720px" : "(max-width: 1024px) 100vw, 760px";

  return (
    <div
      className={cn(
        "w-full max-w-full",
        isHero &&
          "relative z-10 max-lg:mx-0 lg:w-[126%] lg:max-w-none lg:self-start",
        isHero ? "showcase-card-hero rounded-2xl" : "showcase-card-catalog rounded-xl",
      )}
    >
      <div
        className={cn(
          "relative z-[2] flex min-h-[72px] shrink-0 items-start justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4",
          isHero ? "border-b border-white/[0.08]" : "border-b border-site-border",
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.14em]",
              isHero ? "text-site-cta/95" : "text-site-primary",
            )}
          >
            {eyebrow}
          </p>
          <h3
            className={cn(
              "mt-1.5 text-lg font-bold leading-snug sm:text-xl",
              isHero ? "text-pretty text-white" : "text-site-ink line-clamp-2",
            )}
          >
            {title}
          </h3>
        </div>
      </div>

      <div
        className={cn(
          "relative z-[2] isolate min-h-0 w-full overflow-visible",
          isHero ? "min-h-[480px] lg:min-h-[580px]" : "min-h-[520px] lg:min-h-[540px]",
        )}
      >
        <div
          key={slideReactKey}
          data-motion="product-slide"
          data-slide-key={slideKey}
          data-active-index={active}
          className="animate-product-slide absolute inset-0 flex h-full min-h-0 flex-col"
        >
            <div
              className={cn(
                "grid min-h-0 w-full flex-1 lg:items-stretch",
                isHero
                  ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
                  : "lg:h-full lg:min-h-0 lg:grid-cols-[1.22fr_0.78fr]",
              )}
            >
              <Link
                href={`/catalog/${product.slug}`}
                className={cn(
                  "relative block min-h-0 w-full overflow-hidden lg:border-r",
                  isHero
                    ? "shrink-0 h-[300px] sm:h-[340px] lg:h-[min(500px,100%)] lg:min-h-[500px] border-white/[0.06]"
                    : "h-[280px] shrink-0 sm:h-[300px] lg:h-full lg:min-h-0 lg:shrink lg:self-stretch lg:rounded-l-[calc(0.75rem-1px)] border-site-border/80",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  quality={100}
                  sizes={imgSizes}
                  unoptimized={image.src.startsWith("http://") || image.src.startsWith("https://")}
                  className="object-cover motion-reduce:transition-none transition-transform duration-500 ease-out hover:scale-[1.02] motion-reduce:hover:scale-100"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t to-transparent",
                    isHero ? "from-site-deep/65 via-site-deep/5" : "from-black/[0.12] via-transparent",
                  )}
                  aria-hidden
                />
                <div
                  className={cn(
                    "absolute bottom-3 left-3 max-w-[min(100%,calc(100%-1.5rem))] rounded-md border px-3 py-2 shadow-sm",
                    isHero ? "border-white/10 bg-site-deep/85" : "border-site-border/70 bg-white",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase leading-tight",
                      isHero ? "text-slate-300" : "text-site-muted",
                    )}
                  >
                    {product.categoryName}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-bold leading-snug",
                      isHero ? "text-white line-clamp-2 [overflow-wrap:anywhere]" : "text-site-ink line-clamp-2",
                    )}
                  >
                    {product.subcategoryName}
                  </p>
                </div>
              </Link>

              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-5 sm:pt-5",
                  isHero
                    ? "lg:min-h-[500px] lg:justify-between lg:pt-5"
                    : "gap-y-3 lg:h-full lg:min-h-0 lg:gap-y-4 lg:self-stretch lg:py-5",
                )}
              >
                {!isHero ? (
                  <div
                    className={cn(
                      "inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                      "border-site-border/90 bg-site-bg text-site-primary",
                    )}
                  >
                    <Package className="h-3.5 w-3.5" aria-hidden />
                    {catalogBadgeLabel}
                  </div>
                ) : (
                  <p className="mb-2 shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                    {heroRibbonLabel}
                  </p>
                )}
                <h4
                  className={cn(
                    "max-w-full shrink-0 break-words font-bold leading-[1.2] tracking-tight [overflow-wrap:anywhere]",
                    isHero
                      ? "min-h-[4.5rem] line-clamp-3 text-[1.35rem] text-white sm:text-2xl lg:text-[1.65rem]"
                      : "line-clamp-2 text-[1.35rem] text-site-ink sm:text-3xl",
                  )}
                >
                  {product.name}
                </h4>
                <p
                  className={cn(
                    "shrink-0 text-sm sm:text-[15px]",
                    isHero
                      ? "mt-2.5 line-clamp-4 min-h-[4.5rem] leading-relaxed text-slate-300/95"
                      : "line-clamp-3 leading-snug text-site-muted",
                  )}
                >
                  {product.shortDescription}
                </p>

                {isHero && heroSpecSummary ? (
                  <p className="mt-4 min-h-[2.5rem] max-w-full text-[13px] leading-snug text-slate-200 line-clamp-2 [overflow-wrap:anywhere] sm:text-sm">
                    <span className="font-medium text-slate-400">DN</span> {heroSpecSummary.dn}
                    <span className="mx-1.5 text-slate-500" aria-hidden>
                      ·
                    </span>
                    <span className="font-medium text-slate-400">PN</span> {heroSpecSummary.pn}
                    <span className="mx-1.5 text-slate-500" aria-hidden>
                      ·
                    </span>
                    <span className="text-slate-100">{heroSpecSummary.mat}</span>
                  </p>
                ) : (
                  <div className="mt-1 grid shrink-0 grid-cols-3 gap-2 sm:mt-2">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div
                        key={`${label}-${product.slug}`}
                        className={cn(
                          "flex min-h-[5rem] min-w-0 flex-col rounded-lg border px-2.5 py-2",
                          "border-site-border/90 bg-site-bg",
                        )}
                      >
                        <Icon className="mb-1 h-4 w-4 shrink-0 text-site-primary" aria-hidden />
                        <p className="text-[10px] font-semibold uppercase text-site-muted">{label}</p>
                        <p className="line-clamp-2 break-words text-sm font-bold leading-snug text-site-ink">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className={cn("shrink-0", isHero ? "mt-5 lg:mt-4" : "mt-5 border-t border-site-border/60 pt-5")}>
                  <p className={cn("text-xs font-semibold uppercase", isHero ? "text-slate-500" : "text-site-muted")}>
                    {hasDirectPrice ? "Ориентир по прайсу" : "Цена в КП"}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-bold tabular-nums",
                      isHero ? "text-white" : "truncate text-site-primary",
                    )}
                  >
                    {hasDirectPrice && product.price != null ? formatPrice(product.price) : "По запросу"}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      className={cn(
                        "site-primary-cta min-h-11 flex-1 px-5 font-semibold",
                        isHero ? "shadow-lg shadow-black/40" : "",
                      )}
                    >
                      <Link href={`/catalog/${product.slug}`}>
                        Подробнее
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {!isHero ? (
                      <Link
                        href={linkHref}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-site-border px-5 text-sm font-semibold text-site-ink transition hover:border-site-primary/45 hover:text-site-primary"
                      >
                        {linkLabel}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-[2] flex shrink-0 items-center justify-between gap-3 px-5 py-2 sm:px-6",
          isHero ? "border-t border-white/[0.07] bg-black/20" : "border-t border-site-border bg-site-bg/95 py-2.5",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5">
          {products.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Показать ${item.name}`}
              title={item.name}
              className={cn(
                "shrink-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                index === active
                  ? isHero
                    ? "h-[5px] w-7 bg-white/42"
                    : "h-[5px] w-7 bg-site-primary/85"
                  : isHero
                    ? "h-[5px] w-[5px] bg-white/14 hover:bg-white/26"
                    : "h-[5px] w-[5px] bg-slate-300/90 hover:bg-site-primary/40",
              )}
            />
          ))}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={prev}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ease-out disabled:opacity-40 motion-reduce:transition-none",
              isHero
                ? "border border-white/[0.08] bg-white/[0.05] text-white/55 hover:border-white/14 hover:bg-white/[0.09] hover:text-white/88"
                : "border border-site-border/80 bg-white text-site-ink/80 hover:border-site-primary/30 hover:bg-site-bg hover:text-site-primary",
            )}
            aria-label="Предыдущий товар"
          >
            <ArrowLeft className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ease-out disabled:opacity-40 motion-reduce:transition-none",
              isHero
                ? "border border-white/[0.08] bg-white/[0.05] text-white/55 hover:border-white/14 hover:bg-white/[0.09] hover:text-white/88"
                : "border border-site-border/80 bg-white text-site-ink/80 hover:border-site-primary/30 hover:bg-site-bg hover:text-site-primary",
            )}
            aria-label="Следующий товар"
          >
            <ArrowRight className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
