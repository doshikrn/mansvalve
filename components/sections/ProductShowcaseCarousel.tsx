"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
}: ProductShowcaseCarouselProps) {
  const [active, setActive] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const switchTimerRef = useRef<number | null>(null);
  const product = products[active];
  const image = product ? getProductImage(product) : null;
  const isHero = variant === "hero";

  const goTo = useCallback(
    (nextIndex: number) => {
      if (products.length <= 1 || nextIndex === active) return;
      if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);

      setIsSwitching(true);
      switchTimerRef.current = window.setTimeout(() => {
        setActive(nextIndex);
        window.requestAnimationFrame(() => setIsSwitching(false));
      }, 140);
    },
    [active, products.length],
  );

  useEffect(() => {
    if (products.length <= 1) return;
    const id = window.setInterval(() => {
      goTo((active + 1) % products.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [active, goTo, products.length]);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    };
  }, []);

  const specs = useMemo(() => {
    if (!product) return [];
    return [
      { icon: Ruler, label: "DN", value: product.dn ? String(product.dn) : "По запросу" },
      { icon: Gauge, label: "PN", value: product.pn ? String(product.pn) : "По запросу" },
      { icon: ShieldCheck, label: "Материал", value: product.material || "Не указан" },
    ];
  }, [product]);

  if (!product || !image) return null;

  const hasDirectPrice = product.price != null && !product.priceByRequest;
  const next = () => goTo((active + 1) % products.length);
  const prev = () => goTo((active - 1 + products.length) % products.length);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border shadow-[0_24px_48px_-28px_rgba(15,27,45,0.35)]",
        isHero
          ? "border-white/15 bg-white/[0.07] shadow-black/30 ring-1 ring-white/10 backdrop-blur"
          : "border-site-border bg-white shadow-[0_18px_44px_-30px_rgba(15,27,45,0.28)]",
      )}
    >
      <div
        className={cn(
          "flex min-h-[84px] items-start justify-between gap-4 border-b px-5 py-4 sm:px-6",
          isHero ? "border-white/12" : "border-site-border",
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.16em]",
              isHero ? "text-site-cta" : "text-site-primary",
            )}
          >
            {eyebrow}
          </p>
          <h3
            className={cn(
              "mt-1 line-clamp-2 text-lg font-bold leading-tight sm:text-xl",
              isHero ? "text-white" : "text-site-ink",
            )}
          >
            {title}
          </h3>
        </div>
      </div>

      <article
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out will-change-transform",
          isHero
            ? "m-3 rounded-lg border border-white/10 bg-site-deep-soft/80 shadow-inner shadow-white/[0.03]"
            : "",
          isSwitching ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <div
          className={cn(
            "grid",
            isHero ? "lg:grid-cols-[1.03fr_0.97fr]" : "lg:grid-cols-[1.22fr_0.78fr]",
          )}
        >
          <Link
            href={`/catalog/${product.slug}`}
            className={cn(
              "relative block h-[300px] overflow-hidden sm:h-[370px] lg:h-[430px]",
              isHero ? "bg-site-deep" : "bg-site-bg",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={100}
              sizes={isHero ? "(max-width: 1024px) 100vw, 460px" : "(max-width: 1024px) 100vw, 720px"}
              unoptimized={image.src.startsWith("http://") || image.src.startsWith("https://")}
              className="object-cover transition duration-500 hover:scale-[1.025] motion-reduce:hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-site-deep/70 via-site-deep/10 to-transparent" />
            <div
              className={cn(
                "absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-lg border px-3 py-2 shadow-sm backdrop-blur",
                isHero
                  ? "border-white/15 bg-site-deep/85"
                  : "border-white/20 bg-white/[0.92]",
              )}
            >
              <p
                className={cn(
                  "truncate text-[11px] font-semibold uppercase",
                  isHero ? "text-slate-300" : "text-site-muted",
                )}
              >
                {product.categoryName}
              </p>
              <p
                className={cn(
                  "mt-0.5 truncate text-sm font-bold",
                  isHero ? "text-white" : "text-site-ink",
                )}
              >
                {product.subcategoryName}
              </p>
            </div>
          </Link>

          <div
            className={cn(
              "flex flex-col p-5 sm:p-6",
              isHero ? "h-[430px] overflow-hidden" : "min-h-[430px]",
            )}
          >
            <div
              className={cn(
                "mb-4 inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-1 text-xs font-semibold",
                isHero
                  ? "border-white/12 bg-white/[0.07] text-slate-200"
                  : "border-site-border bg-site-bg text-site-primary",
              )}
            >
              <Package className="h-4 w-4" aria-hidden />
              Часто запрашивают
            </div>
            <h4
              className={cn(
                "line-clamp-2 min-h-[3.45rem] overflow-hidden break-words text-[1.45rem] font-bold leading-tight sm:min-h-[3.9rem] sm:text-2xl",
                isHero ? "text-white" : "text-site-ink sm:text-3xl",
              )}
            >
              {product.name}
            </h4>
            <p
              className={cn(
                "mt-3 line-clamp-2 min-h-[3.35rem] overflow-hidden text-sm leading-relaxed sm:text-[15px]",
                isHero ? "text-slate-300" : "text-site-muted",
              )}
            >
              {product.shortDescription}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {specs.map(({ icon: Icon, label, value }) => (
                <div
                  key={`${label}-${value}`}
                  className={cn(
                    "min-w-0 rounded-lg border px-2.5 py-2",
                    isHero ? "border-white/10 bg-white/[0.06]" : "border-site-border bg-site-bg",
                  )}
                >
                  <Icon
                    className={cn("mb-1 h-4 w-4", isHero ? "text-site-cta" : "text-site-primary")}
                    aria-hidden
                  />
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase",
                      isHero ? "text-slate-400" : "text-site-muted",
                    )}
                  >
                    {label}
                  </p>
                  <p className={cn("truncate text-sm font-bold", isHero ? "text-white" : "text-site-ink")}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <p className={cn("text-xs font-semibold uppercase", isHero ? "text-slate-400" : "text-site-muted")}>
                {hasDirectPrice ? "Ориентир по прайсу" : "Цена в КП"}
              </p>
              <p
                className={cn(
                  "mt-1 truncate text-2xl font-bold",
                  isHero ? "text-white" : "text-site-primary",
                )}
              >
                {hasDirectPrice && product.price != null ? formatPrice(product.price) : "По запросу"}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="site-primary-cta min-h-11 flex-1 px-5">
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
      </article>

      <div
        className={cn(
          "flex items-center justify-between gap-4 border-t px-5 py-3 sm:px-6",
          isHero ? "border-white/12 bg-white/[0.04]" : "border-site-border bg-site-bg",
        )}
      >
        <div className="flex gap-2">
          {products.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Показать ${item.name}`}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === active
                  ? isHero
                    ? "w-8 bg-site-cta"
                    : "w-8 bg-site-primary"
                  : isHero
                    ? "w-2.5 bg-white/20 hover:bg-white/40"
                    : "w-2.5 bg-site-border hover:bg-site-primary/45",
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition duration-200 disabled:opacity-50",
              isHero
                ? "border-white/15 bg-white/10 text-white hover:border-white/30 hover:bg-white/15"
                : "border-site-border bg-white text-site-ink hover:border-site-primary/45 hover:text-site-primary",
            )}
            aria-label="Предыдущий товар"
            disabled={isSwitching}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition duration-200 disabled:opacity-50",
              isHero
                ? "border-white/15 bg-white/10 text-white hover:border-white/30 hover:bg-white/15"
                : "border-site-border bg-white text-site-ink hover:border-site-primary/45 hover:text-site-primary",
            )}
            aria-label="Следующий товар"
            disabled={isSwitching}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
