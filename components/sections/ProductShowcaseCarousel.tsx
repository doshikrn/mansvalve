"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Gauge, Package, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { getCategoryVisual } from "@/lib/category-visuals";
import { MOTION_EASE } from "@/lib/motion";
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
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
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
    }, 6500);
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

  const slideKey = `${product.slug}-${active}`;
  const slideTransition = {
    duration: reduce ? 0 : 0.55,
    ease: MOTION_EASE,
  };
  const slideInitial = reduce
    ? { opacity: 1, x: 0, scale: 1 }
    : { opacity: 0, x: 40, scale: 0.98 };
  const slideAnimate = { opacity: 1, x: 0, scale: 1 };
  const slideExit = reduce
    ? { opacity: 1, x: 0, scale: 1 }
    : { opacity: 0, x: -40, scale: 0.98 };

  const imgSizes = isHero ? "(max-width: 1024px) 100vw, 460px" : "(max-width: 1024px) 100vw, 720px";

  return (
    <div
      className={cn(
        "w-full max-w-full overflow-hidden rounded-xl shadow-[0_24px_48px_-28px_rgba(15,27,45,0.35)]",
        isHero
          ? "border border-white/10 bg-white/[0.06] shadow-black/25 backdrop-blur-md"
          : "rounded-lg border border-site-border bg-white shadow-[0_18px_44px_-30px_rgba(15,27,45,0.28)]",
      )}
    >
      <div
        className={cn(
          "flex min-h-[76px] shrink-0 items-start justify-between gap-4 px-5 py-4 sm:px-6",
          isHero ? "border-b border-white/[0.07]" : "border-b border-site-border",
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

      <div className={cn("relative min-h-0 w-full", isHero ? "min-h-[420px] lg:min-h-[460px]" : "min-h-[520px] lg:min-h-[540px]")}>
        <AnimatePresence initial={false} mode="sync">
          <motion.article
            key={slideKey}
            layout={false}
            initial={slideInitial}
            animate={slideAnimate}
            exit={slideExit}
            transition={slideTransition}
            className="absolute inset-0 flex h-full min-h-0 flex-col"
          >
            <div
              className={cn(
                "grid min-h-0 flex-1 lg:items-stretch",
                isHero ? "lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]" : "lg:grid-cols-[1.22fr_0.78fr]",
              )}
            >
              <Link
                href={`/catalog/${product.slug}`}
                className={cn(
                  "relative block w-full shrink-0 overflow-hidden",
                  isHero
                    ? "h-[260px] sm:h-[300px] lg:h-[380px] lg:max-h-[380px]"
                    : "h-[280px] sm:h-[340px] lg:h-[400px] lg:max-h-[400px]",
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
                <div className="absolute inset-0 bg-gradient-to-t from-site-deep/65 via-site-deep/5 to-transparent" />
                <div
                  className={cn(
                    "absolute bottom-3 left-3 max-w-[min(100%,calc(100%-1.5rem))] rounded-md px-3 py-2 backdrop-blur-sm",
                    isHero ? "bg-black/35" : "border border-white/20 bg-white/[0.92]",
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
                  "flex min-h-0 min-w-0 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6",
                  isHero ? "lg:h-[380px] lg:justify-between" : "lg:h-[400px]",
                )}
              >
                {!isHero ? (
                  <div
                    className={cn(
                      "mb-4 inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border px-3 py-1 text-xs font-semibold",
                      "border-site-border bg-site-bg text-site-primary",
                    )}
                  >
                    <Package className="h-4 w-4" aria-hidden />
                    {catalogBadgeLabel}
                  </div>
                ) : (
                  <p className="mb-3 shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                    {heroRibbonLabel}
                  </p>
                )}
                <h4
                  className={cn(
                    "min-h-[4.75rem] max-w-full shrink-0 break-words font-bold leading-snug [overflow-wrap:anywhere]",
                    isHero
                      ? "line-clamp-3 text-xl text-white sm:text-2xl"
                      : "line-clamp-2 min-h-[3.5rem] text-[1.35rem] text-site-ink sm:min-h-[4rem] sm:text-3xl",
                  )}
                >
                  {product.name}
                </h4>
                <p
                  className={cn(
                    "mt-3 min-h-[3.25rem] shrink-0 text-sm leading-relaxed sm:text-[15px]",
                    isHero ? "line-clamp-2 text-slate-300/95" : "line-clamp-2 text-site-muted",
                  )}
                >
                  {product.shortDescription}
                </p>

                {isHero && heroSpecSummary ? (
                  <p className="mt-5 min-h-[2.75rem] max-w-full text-[13px] leading-relaxed text-slate-200 line-clamp-2 [overflow-wrap:anywhere] sm:text-sm">
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
                  <div className="mt-4 grid shrink-0 grid-cols-3 gap-2">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div
                        key={`${label}-${product.slug}`}
                        className={cn(
                          "flex min-h-[5.25rem] min-w-0 flex-col rounded-lg border px-2.5 py-2",
                          "border-site-border bg-site-bg",
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

                <div className={cn("mt-6 shrink-0", isHero ? "mt-8" : "mt-auto pt-4")}>
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
          </motion.article>
        </AnimatePresence>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-4 px-5 py-2.5 sm:px-6",
          isHero ? "border-t border-white/[0.06] bg-black/10" : "border-t border-site-border bg-site-bg py-3",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {products.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Показать ${item.name}`}
              title={item.name}
              className={cn(
                "shrink-0 rounded-full transition-all duration-300 ease-out",
                index === active
                  ? isHero
                    ? "h-1.5 w-6 bg-white/55"
                    : "h-2.5 w-8 bg-site-primary"
                  : isHero
                    ? "h-1.5 w-1.5 bg-white/18 hover:bg-white/30"
                    : "h-2.5 w-2.5 bg-site-border hover:bg-site-primary/45",
              )}
            />
          ))}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={prev}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md transition duration-200 disabled:opacity-45",
              isHero
                ? "border border-white/10 bg-white/[0.06] text-white/75 hover:border-white/18 hover:bg-white/[0.1] hover:text-white"
                : "border border-site-border bg-white text-site-ink hover:border-site-primary/45 hover:text-site-primary",
            )}
            aria-label="Предыдущий товар"
          >
            <ArrowLeft className="h-3.5 w-3.5 opacity-90" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md transition duration-200 disabled:opacity-45",
              isHero
                ? "border border-white/10 bg-white/[0.06] text-white/75 hover:border-white/18 hover:bg-white/[0.1] hover:text-white"
                : "border border-site-border bg-white text-site-ink hover:border-site-primary/45 hover:text-site-primary",
            )}
            aria-label="Следующий товар"
          >
            <ArrowRight className="h-3.5 w-3.5 opacity-90" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
