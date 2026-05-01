"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
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
  showCatalogButton?: boolean;
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
  showCatalogButton = true,
}: ProductShowcaseCarouselProps) {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion() === true;
  const product = products[active];
  const image = product ? getProductImage(product) : null;
  const isHero = variant === "hero";

  const goTo = useCallback(
    (nextIndex: number) => {
      if (products.length <= 1 || nextIndex === active) return;
      setActive(nextIndex);
    },
    [active, products.length],
  );

  const next = useCallback(() => {
    if (products.length <= 1) return;
    setActive((a) => (a + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    if (products.length <= 1) return;
    setActive((a) => (a - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % products.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [products.length]);

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
  const imgSizes = isHero ? "(max-width: 1024px) 100vw, 720px" : "(max-width: 1024px) 100vw, 760px";
  const flowEase = [0.22, 1, 0.36, 1] as const;

  const slideTransition = {
    duration: reducedMotion ? 0.2 : isHero ? 0.62 : 0.56,
    ease: flowEase,
  };
  const slideInitial = isHero ? { opacity: 0, scale: 0.988, y: 6 } : { opacity: 0, scale: 0.992, y: 5 };
  const slideAnimate = { opacity: 1, scale: 1 };
  const slideExit = isHero ? { opacity: 0, scale: 0.988, y: -4 } : { opacity: 0, scale: 0.992, y: -3 };

  return (
    <div
      className={cn(
        "w-full max-w-full",
        isHero && "relative z-10 max-lg:mx-0 lg:w-[126%] lg:max-w-none lg:self-start",
        isHero ? "showcase-card-hero rounded-2xl" : "showcase-card-catalog rounded-xl",
      )}
    >
      <div
        className={cn(
          "relative z-[2] flex shrink-0 items-start justify-between gap-3",
          isHero
            ? "border-b border-white/[0.08] px-7 py-5"
            : "min-h-[72px] border-b border-white/[0.08] px-5 py-3.5 sm:px-6 sm:py-4",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", "text-site-cta/95")}>
            {eyebrow}
          </p>
          <h3
            className={cn(
              "mt-1 text-lg font-bold leading-snug sm:text-xl",
              isHero ? "text-pretty text-white" : "text-pretty text-white line-clamp-2",
            )}
          >
            {title}
          </h3>
        </div>
      </div>

      <div className={cn("relative z-[2] isolate min-h-0 w-full", isHero ? "min-h-[420px] lg:min-h-[480px]" : "min-h-[520px] overflow-visible lg:min-h-[520px]")}>
        <MotionConfig reducedMotion="never">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideKey}
              className="absolute inset-0 flex h-full min-h-0 flex-col"
              initial={slideInitial}
              animate={slideAnimate}
              exit={slideExit}
              transition={slideTransition}
            >
              <div
                className={cn(
                  "grid min-h-0 w-full flex-1 lg:items-stretch",
                  isHero ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" : "min-h-[460px] lg:min-h-[500px] lg:[grid-template-columns:60%_40%]",
                )}
              >
                <Link
                  href={`/catalog/${product.slug}`}
                  className={cn(
                    "relative block min-h-0 w-full overflow-hidden lg:border-r",
                    isHero
                      ? "h-[280px] shrink-0 border-white/[0.06] sm:h-[300px] lg:h-[min(400px,100%)] lg:min-h-[400px]"
                      : "h-[280px] shrink-0 border-white/[0.06] sm:h-[300px] lg:h-full lg:min-h-[500px] lg:self-stretch lg:rounded-l-[calc(0.75rem-1px)]",
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    quality={100}
                    sizes={imgSizes}
                    unoptimized={image.src.startsWith("http://") || image.src.startsWith("https://")}
                    className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
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
                      isHero ? "border-white/10 bg-site-deep/85" : "border-white/15 bg-black/55",
                    )}
                  >
                    <p className={cn("text-[10px] font-semibold uppercase leading-tight", isHero ? "text-slate-300" : "text-slate-400")}>
                      {product.categoryName}
                    </p>
                    <p className={cn("mt-1 text-sm font-bold leading-snug", isHero ? "text-white line-clamp-2 [overflow-wrap:anywhere]" : "text-white line-clamp-2")}>
                      {product.subcategoryName}
                    </p>
                  </div>
                </Link>

                {isHero ? (
                  <div className="flex min-h-0 min-w-0 flex-col gap-y-3 px-7 pb-5 pt-5 lg:flex-1">
                    <p className="mb-1 shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400/95">
                      {heroRibbonLabel}
                    </p>
                    <h4 className="max-w-full min-h-[3.6rem] shrink-0 break-words text-[1.35rem] font-bold leading-[1.2] tracking-tight text-white line-clamp-3 [overflow-wrap:anywhere] sm:text-2xl lg:text-[1.55rem]">
                      {product.name}
                    </h4>
                    <p className="min-h-[3.8rem] shrink-0 text-sm leading-snug text-slate-300/95 line-clamp-3 sm:text-[15px]">
                      {product.shortDescription}
                    </p>

                    {heroSpecSummary ? (
                      <p className="mt-2 max-w-full text-[13px] leading-snug text-slate-200 line-clamp-2 [overflow-wrap:anywhere] sm:text-sm">
                        <span className="font-medium text-slate-400">DN</span> {heroSpecSummary.dn}
                        <span className="mx-1.5 text-slate-500" aria-hidden>·</span>
                        <span className="font-medium text-slate-400">PN</span> {heroSpecSummary.pn}
                        <span className="mx-1.5 text-slate-500" aria-hidden>·</span>
                        <span className="text-slate-100">{heroSpecSummary.mat}</span>
                      </p>
                    ) : null}

                    <div className="mt-auto shrink-0 border-t border-white/[0.06] pt-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        {hasDirectPrice ? "Ориентир по прайсу" : "Цена в КП"}
                      </p>
                      <p className="mt-1 min-h-[2rem] text-2xl font-bold tabular-nums text-white">
                        {hasDirectPrice && product.price != null ? formatPrice(product.price) : "По запросу"}
                      </p>
                      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                        <Button asChild className="site-primary-cta min-h-11 flex-1 px-5 font-semibold shadow-lg shadow-black/40">
                          <Link href={`/catalog/${product.slug}`}>
                            Подробнее
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 min-w-0 flex-col justify-between px-5 pb-5 pt-4 sm:px-6 lg:min-h-[500px] lg:py-6">
                    <div className="flex min-h-0 flex-col gap-3">
                      <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-[#2F6BFF]">
                        <Package className="h-3.5 w-3.5" aria-hidden />
                        {catalogBadgeLabel}
                      </div>
                      <h4 className="max-w-full min-h-[3.5rem] shrink-0 break-words text-[1.35rem] font-bold leading-[1.2] tracking-tight text-white line-clamp-2 [overflow-wrap:anywhere] sm:text-3xl">
                        {product.name}
                      </h4>
                      <p className="min-h-[3.9rem] shrink-0 text-sm leading-snug text-slate-400 line-clamp-3 sm:text-[15px]">
                        {product.shortDescription}
                      </p>

                      <div className="grid shrink-0 grid-cols-3 gap-2 pt-1">
                        {specs.map(({ icon: Icon, label, value }) => (
                          <div key={`${label}-${product.slug}`} className="flex min-h-[5rem] min-w-0 flex-col rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-2">
                            <Icon className="mb-1 h-4 w-4 shrink-0 text-[#2F6BFF]" aria-hidden />
                            <p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p>
                            <p className={cn("text-sm font-bold leading-snug text-slate-100", label === "Материал" ? "line-clamp-3 whitespace-normal break-words [overflow-wrap:anywhere]" : "line-clamp-2 break-words")}>
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto shrink-0 border-t border-white/10 pt-5">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        {hasDirectPrice ? "Ориентир по прайсу" : "Цена в КП"}
                      </p>
                      <p className="mt-1 min-h-[2rem] truncate text-2xl font-bold tabular-nums text-[#2F6BFF]">
                        {hasDirectPrice && product.price != null ? formatPrice(product.price) : "По запросу"}
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="site-primary-cta min-h-11 flex-1 px-5 font-semibold">
                          <Link href={`/catalog/${product.slug}`}>
                            Подробнее
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        {showCatalogButton ? (
                          <Link
                            href={linkHref}
                            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-slate-100 transition hover:border-[#2F6BFF]/45 hover:text-white"
                          >
                            {linkLabel}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
      </div>

      <div
        className={cn(
          "relative z-[2] flex shrink-0 items-center justify-between gap-2",
          isHero ? "min-h-[44px] border-t border-white/[0.06] bg-black/[0.14] px-7 py-3" : "gap-3 border-t border-white/[0.08] bg-black/30 px-5 py-2.5 backdrop-blur-sm sm:px-6",
        )}
      >
        <div className={cn("flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto", !isHero && "pb-0.5")}>
          {products.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Показать ${item.name}`}
              title={item.name}
              className={cn(
                "shrink-0 rounded-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                index === active
                  ? "h-[6px] w-8 bg-site-cta shadow-[0_0_14px_rgb(234_88_12_/_.42)]"
                  : "h-[5px] w-[5px] bg-white/25 hover:bg-white/38",
              )}
            />
          ))}
        </div>
        {products.length > 1 ? (
          <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">
            <motion.div
              key={`progress-${active}`}
              initial={{ width: "0%", opacity: 0.6 }}
              animate={{ width: reducedMotion ? "0%" : "100%", opacity: reducedMotion ? 0 : 1 }}
              transition={{ duration: reducedMotion ? 0.01 : 7, ease: "linear" }}
              className="h-full bg-gradient-to-r from-site-cta/85 via-site-cta to-site-cta/85"
            />
          </div>
        ) : null}
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={prev}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ease-out",
              isHero
                ? "border border-white/[0.08] bg-white/[0.05] text-white/55 hover:border-white/14 hover:bg-white/[0.09] hover:text-white/88"
                : "border border-white/[0.12] bg-white/[0.06] text-slate-200 hover:border-[#2F6BFF]/35 hover:bg-white/[0.1] hover:text-white",
            )}
            aria-label="Предыдущий товар"
          >
            <ArrowLeft className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ease-out",
              isHero
                ? "border border-white/[0.08] bg-white/[0.05] text-white/55 hover:border-white/14 hover:bg-white/[0.09] hover:text-white/88"
                : "border border-white/[0.12] bg-white/[0.06] text-slate-200 hover:border-[#2F6BFF]/35 hover:bg-white/[0.1] hover:text-white",
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
