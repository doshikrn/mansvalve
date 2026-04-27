import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";
import { buildCompanyProductInquiryWhatsAppUrl } from "@/lib/company";
import { getCategoryVisual } from "@/lib/category-visuals";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { warnInvalidMediaUrl } from "@/lib/media-url";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const detailHref = `/catalog/${product.slug}`;
  const visual = getCategoryVisual(product.category);
  const imageSrc = product.primaryImageUrl || visual.imageSrc;
  const imageAlt =
    product.primaryImageAlt ||
    `${product.categoryName} — ${product.name}` ||
    visual.imageAlt;
  const isRemoteImage = imageSrc.startsWith("http://") || imageSrc.startsWith("https://");
  warnInvalidMediaUrl(imageSrc, `ProductCard:${product.slug}`);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-site-border bg-site-card transition-all duration-200 hover:border-site-primary hover:shadow-lg hover:shadow-slate-900/10">
      {/* Category visual fallback */}
      <Link
        href={detailHref}
        className="relative flex h-40 items-center justify-center bg-slate-50"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          quality={90}
          unoptimized={isRemoteImage}
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
        <span className="absolute bottom-2 left-2 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          {product.categoryName}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Spec badges */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {product.dn != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <span className="text-slate-400">DN</span>
              {product.dn}
            </span>
          )}
          {product.pn != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <span className="text-slate-400">PN</span>
              {product.pn}
            </span>
          )}
          {product.thread && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <span className="text-slate-400">M</span>
              {product.thread.replace(/^M/i, "")}
            </span>
          )}
          {product.material && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {product.material}
            </span>
          )}
        </div>

        {/* Product name */}
        <Link
          href={detailHref}
          className="mb-1.5 block text-sm font-semibold leading-snug text-slate-900 transition-colors line-clamp-2 hover:text-site-primary-hover"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="mb-3 text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Price */}
        <div className="mb-3">
          {product.price && !product.priceByRequest ? (
            <p className="text-lg font-bold text-slate-900 tracking-tight">
              {formatPrice(product.price)}
            </p>
          ) : (
            <p className="text-sm font-semibold text-site-primary">
              Цена по запросу
            </p>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
            <Link href={detailHref}>
              Подробнее
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 border-0 bg-site-cta text-xs text-white hover:opacity-90"
            asChild
          >
            <a
              href={buildCompanyProductInquiryWhatsAppUrl(product.name, {
                dn: product.dn,
                pn: product.pn,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon className="mr-1 h-3.5 w-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
