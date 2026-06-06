"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  Gauge,
  Package,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { Button } from "@/components/ui/button";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";
import { buildPublicProductCardView } from "@/lib/public-catalog/product-view";
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

const CATALOG_TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Проверенное качество",
    desc: "Паспорта, сертификаты и контроль партии",
  },
  {
    icon: Truck,
    title: "Доставка по Казахстану",
    desc: "Срок и маршрут фиксируем в КП",
  },
  {
    icon: FileCheck2,
    title: "Документы под объект",
    desc: "Договор, НДС и закрывающие документы",
  },
] as const;

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
  const view = product ? buildPublicProductCardView(product) : null;
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
    if (products.length <= 1 || reducedMotion) return;
    let intervalId: number | undefined;

    const stop = () => {
      if (intervalId === undefined) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const start = () => {
      if (document.visibilityState !== "visible" || intervalId !== undefined) return;
      intervalId = window.setInterval(() => {
        if (document.visibilityState !== "visible") return;
        setActive((a) => (a + 1) % products.length);
      }, 7000);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [products.length, reducedMotion]);

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
    return {
      dn: product.dn != null ? String(product.dn) : "По запросу",
      pn: product.pn != null ? String(product.pn) : "По запросу",
      mat: (product.material || "Не указан").trim(),
    };
  }, [product]);

  if (!product || !view) return null;

  const hasDirectPrice = product.price != null && !product.priceByRequest;
  const slideKey = `${variant}-${active}-${product.slug}`;
  const imgSizes = isHero ? "(max-width: 1024px) 100vw, 720px" : "(max-width: 1024px) 100vw, 760px";

  const slideTransition = {
    duration: reducedMotion ? 0.2 : isHero ? 0.62 : 0.56,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div
      className={cn(
        "w-full max-w-full",
        isHero && "relative z-10 max-lg:mx-0 lg:w-full lg:max-w-full lg:self-start",
        isHero ? "showcase-card-hero rounded-2xl" : "showcase-card-catalog rounded-xl",
      )}
    >
      <div
        className={cn(
          "relative z-[2] flex items-start justify-between gap-3 border-b",
          isHero ? "px-5 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-5" : "min-h-[72px] px-5 py-3.5 sm:px-6 sm:py-4",
          isHero ? "border-white/[0.08]" : "border-slate-200/80 bg-white/70",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", isHero ? "text-site-cta/95" : "text-site-primary")}>
            {eyebrow}
          </p>
          <h3 className={cn("mt-1 text-lg font-bold leading-snug sm:text-xl", isHero ? "text-white" : "text-site-ink", !isHero && "line-clamp-2")}>
            {title}
          </h3>
        </div>
      </div>

      <div
        className={cn(
          "relative z-[2] isolate w-full",
          isHero
            ? "max-lg:min-h-0 lg:min-h-[480px] lg:overflow-hidden"
            : "max-lg:min-h-0 lg:min-h-[470px]",
        )}
      >
        <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slideKey}
              className={cn(
                "flex w-full flex-col",
                isHero
                  ? "max-lg:relative max-lg:h-auto max-lg:min-h-0 lg:absolute lg:inset-0 lg:h-full"
                  : "max-lg:relative max-lg:h-auto lg:absolute lg:inset-0 lg:h-full",
              )}
              initial={{ opacity: 0, scale: 0.992, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.992, y: -3 }}
              transition={slideTransition}
            >
              <div
                className={cn(
                  "grid lg:items-stretch",
                  isHero
                    ? "max-lg:flex-none lg:flex-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
                    : "max-lg:flex-none lg:flex-1 lg:grid-cols-[minmax(320px,0.88fr)_minmax(0,1.12fr)]",
                )}
              >
                <Link
                  href={view.canonicalPath}
                  className={cn(
                    "block w-full lg:border-r",
                    isHero
                      ? "border-white/[0.06] lg:h-full"
                      : "border-slate-200/85 lg:h-full lg:rounded-l-[calc(1rem-1px)]",
                  )}
                >
                  <ProductImageFrame
                    src={view.primaryImageUrl}
                    alt={view.primaryImageAlt}
                    priority={isHero && active === 0}
                    quality={isHero ? 88 : 85}
                    sizes={imgSizes}
                    unoptimized={view.primaryImageUnoptimized}
                    tone={isHero ? "dark" : "light"}
                    className={cn(
                      "rounded-none",
                      isHero
                        ? "aspect-[16/10] lg:h-full lg:aspect-auto"
                        : "aspect-[4/3] sm:aspect-[16/10] lg:h-full lg:aspect-auto lg:rounded-l-[calc(1rem-1px)]",
                    )}
                    safeAreaClassName={isHero ? "p-6 sm:p-8 lg:p-10" : "p-6 sm:p-8 lg:p-12"}
                    imageClassName="group-hover:scale-[1.015]"
                  >
                    {isHero ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-site-deep/56 via-site-deep/8 to-transparent" />
                        <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-md border border-white/10 bg-site-deep/85 px-3 py-2 shadow-sm">
                          <p className="text-[10px] font-semibold uppercase text-slate-300">{product.categoryName}</p>
                          <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white">{product.subcategoryName}</p>
                        </div>
                      </>
                    ) : null}
                  </ProductImageFrame>
                </Link>

                {isHero ? (
                  <div className="flex min-w-0 flex-col gap-y-3 px-5 pb-5 pt-4 max-lg:pb-4 sm:px-6 lg:flex-1 lg:px-7 lg:pb-5 lg:pt-5">
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400/95">{heroRibbonLabel}</p>
                    <h4 className="break-words text-[1.2rem] font-bold leading-snug tracking-tight text-white sm:text-[1.35rem] lg:line-clamp-3 lg:text-[1.55rem] lg:leading-[1.2]">
                      {view.displayName}
                    </h4>
                    <p className="line-clamp-2 text-sm leading-snug text-slate-300/95 sm:text-[15px] lg:line-clamp-3">{view.shortDescription}</p>
                    {heroSpecSummary ? (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-200 sm:text-sm lg:mt-2">
                        <span className="font-medium text-slate-400">DN</span> {heroSpecSummary.dn}
                        <span className="mx-1.5 text-slate-500">·</span>
                        <span className="font-medium text-slate-400">PN</span> {heroSpecSummary.pn}
                        <span className="mx-1.5 text-slate-500">·</span>
                        <span className="text-slate-100">{heroSpecSummary.mat}</span>
                      </p>
                    ) : null}
                    <div className="mt-4 border-t border-white/[0.06] pt-4 max-lg:mt-3 lg:mt-auto">
                      <p className="text-xs font-semibold uppercase text-slate-500">{hasDirectPrice ? "Ориентир по прайсу" : "Цена в КП"}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-white lg:min-h-[2rem]">
                        {hasDirectPrice && product.price != null ? formatPrice(product.price) : "По запросу"}
                      </p>
                      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                        <Button asChild className="site-primary-cta min-h-11 flex-1 px-5 font-semibold shadow-lg shadow-black/40">
                          <Link href={view.canonicalPath}>Подробнее <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:min-h-[470px] lg:justify-between lg:px-7">
                    <div className="flex min-w-0 flex-col gap-4">
                      <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#2F6BFF]/25 bg-[#2F6BFF]/10 px-2.5 py-1 text-xs font-semibold text-[#8bb4ff]">
                        <Package className="h-3.5 w-3.5" />
                        {catalogBadgeLabel}
                      </div>
                      <div className="min-w-0">
                        <h4 className="line-clamp-3 break-words text-[1.45rem] font-bold leading-[1.14] tracking-tight text-site-ink sm:text-[1.8rem] lg:line-clamp-2 lg:text-[2rem]">
                          {view.displayName}
                        </h4>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-site-muted sm:text-[15px] lg:line-clamp-2">
                          {view.shortDescription}
                        </p>
                      </div>
                      <div className="hidden grid-cols-3 gap-2 pt-1 sm:grid">
                        {specs.map(({ icon: Icon, label, value }) => (
                          <div
                            key={`${label}-${product.slug}`}
                            className="flex min-h-[5.25rem] min-w-0 flex-col rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                          >
                            <Icon className="mb-1.5 h-4 w-4 text-site-primary" />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
                            <p
                              className={cn(
                                "break-words font-bold leading-snug text-site-ink",
                                label === "Материал" ? "text-[13px]" : "line-clamp-2 text-sm",
                              )}
                            >
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="hidden grid-cols-1 gap-2 pt-1 lg:grid">
                        {CATALOG_TRUST_POINTS.map(({ icon: Icon, title: trustTitle, desc }) => (
                          <div
                            key={trustTitle}
                            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#f8fbff] px-3 py-2.5"
                          >
                            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2F6BFF]/12 text-[#8bb4ff]">
                              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold leading-snug text-site-ink">{trustTitle}</span>
                              <span className="mt-0.5 block text-xs leading-snug text-site-muted">{desc}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">{hasDirectPrice ? "Ориентир по прайсу" : "Цена в КП"}</p>
                      <p className="mt-1 text-[1.85rem] font-bold leading-none tabular-nums text-site-cta sm:text-[2rem]">
                        {hasDirectPrice && product.price != null ? formatPrice(product.price) : "По запросу"}
                      </p>
                      <div className="mt-4 flex flex-col gap-3">
                        <Button asChild className="site-primary-cta min-h-11 flex-1 px-5 font-semibold">
                          <Link href={view.canonicalPath}>Подробнее <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                        {showCatalogButton ? (
                          <Link href={linkHref} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-slate-100 transition hover:border-[#2F6BFF]/45 hover:text-white">
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

      {isHero ? (
        <div className="relative z-[2] flex shrink-0 flex-col gap-2 border-t border-white/[0.08] bg-black/[0.14] px-5 py-2.5 sm:px-6 lg:min-h-[44px] lg:gap-0 lg:px-7 lg:py-3">
          <div className="flex min-w-0 w-full items-center justify-between gap-2 lg:flex-1">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
              {products.map((item, index) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Показать ${item.name}`}
                  title={item.name}
                  className={cn(
                    "shrink-0 rounded-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    index === active
                      ? "h-[6px] w-8 bg-site-cta shadow-[0_0_14px_rgb(34_197_94_/_.38)]"
                      : "h-[5px] w-[5px] bg-white/25 hover:bg-white/38",
                  )}
                />
              ))}
            </div>
            {products.length > 1 ? (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={prev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-white/55 transition-all duration-300 ease-out hover:border-white/14 hover:bg-white/[0.09] hover:text-white/88"
                  aria-label="Предыдущий товар"
                >
                  <ArrowLeft className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-white/55 transition-all duration-300 ease-out hover:border-white/14 hover:bg-white/[0.09] hover:text-white/88"
                  aria-label="Следующий товар"
                >
                  <ArrowRight className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
                </button>
              </div>
            ) : null}
          </div>
          {products.length > 1 ? (
            <div className="relative h-[2px] w-full shrink-0 overflow-hidden lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:h-[2px] lg:w-full">
              <motion.div
                key={`progress-${active}`}
                initial={{ width: "0%", opacity: 0.6 }}
                animate={{ width: reducedMotion ? "0%" : "100%", opacity: reducedMotion ? 0 : 1 }}
                transition={{ duration: reducedMotion ? 0.01 : 7, ease: "linear" }}
                className="h-full bg-gradient-to-r from-site-cta/85 via-site-cta to-site-cta/85"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative z-[2] flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/90 bg-white/72 px-5 py-2.5 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5">
            {products.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Показать ${item.name}`}
                title={item.name}
                className={cn(
                  "shrink-0 rounded-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  index === active ? "h-[6px] w-8 bg-site-cta shadow-[0_0_14px_rgb(34_197_94_/_.32)]" : "h-[5px] w-[5px] bg-slate-300 hover:bg-slate-400",
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-site-ink shadow-sm transition-all duration-300 ease-out hover:border-[#2F6BFF]/35 hover:text-site-primary"
              aria-label="Предыдущий товар"
            >
              <ArrowLeft className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-site-ink shadow-sm transition-all duration-300 ease-out hover:border-[#2F6BFF]/35 hover:text-site-primary"
              aria-label="Следующий товар"
            >
              <ArrowRight className="h-3.5 w-3.5 opacity-80" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
