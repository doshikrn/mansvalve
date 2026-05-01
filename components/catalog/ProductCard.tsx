import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";
import { buildCompanyProductInquiryWhatsAppUrl } from "@/lib/company";
import { buildProductCatalogName, getCatalogCategoryLabel } from "@/lib/catalog-seo";
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
  const productName = buildProductCatalogName(product);
  const categoryLabel = getCatalogCategoryLabel(product.category, product.categoryName);
  const visual = getCategoryVisual(product.category);
  const imageSrc = product.primaryImageUrl || visual.imageSrc;
  const imageAlt =
    product.primaryImageAlt ||
    `${categoryLabel} — ${productName}` ||
    visual.imageAlt;
  const isRemoteImage = imageSrc.startsWith("http://") || imageSrc.startsWith("https://");
  warnInvalidMediaUrl(imageSrc, `ProductCard:${product.slug}`);

  return (
    <article className="site-card group flex flex-col overflow-hidden p-0 active:scale-[0.98] motion-reduce:active:scale-100">
      {/* Category visual fallback */}
      <Link
        href={detailHref}
        className="relative flex h-40 items-center justify-center bg-site-bg"
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
        <span className="absolute bottom-2 left-2 rounded-md bg-site-card px-2 py-0.5 text-[11px] font-medium text-site-muted">
          {categoryLabel}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Spec badges */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {product.dn != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-site-bg px-2 py-0.5 text-xs font-medium text-site-muted">
              <span className="text-site-primary">DN</span>
              {product.dn}
            </span>
          )}
          {product.pn != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-site-bg px-2 py-0.5 text-xs font-medium text-site-muted">
              <span className="text-site-primary">PN</span>
              {product.pn}
            </span>
          )}
          {product.thread && (
            <span className="inline-flex items-center gap-1 rounded-md bg-site-bg px-2 py-0.5 text-xs font-medium text-site-muted">
              <span className="text-site-primary">M</span>
              {product.thread.replace(/^M/i, "")}
            </span>
          )}
          {product.material && (
            <span className="rounded-md bg-site-bg px-2 py-0.5 text-xs font-medium text-site-muted">
              {product.material}
            </span>
          )}
          {product.model && (
            <span className="rounded-md bg-site-bg px-2 py-0.5 text-xs font-medium text-site-muted">
              {product.model}
            </span>
          )}
        </div>

        {/* Product name */}
        <Link
          href={detailHref}
          className="mb-1.5 block text-sm font-semibold leading-snug text-site-ink transition-colors line-clamp-2 hover:text-site-primary-hover"
        >
          {productName}
        </Link>

        <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-site-muted">
          <SpecItem label="Марка" value={product.model} />
          <SpecItem label="Соединение" value={product.connectionType} />
          <SpecItem label="Управление" value={product.controlType} />
          <SpecItem label="Статус" value="В наличии / под заказ" />
        </dl>

        {/* Description */}
        <p className="mb-3 text-xs text-site-muted leading-relaxed line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Price */}
        <div className="mb-3">
          {product.price && !product.priceByRequest ? (
            <p className="text-lg font-bold text-site-ink tracking-tight">
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
            <Link href={`${detailHref}#request-section`}>
              Получить КП
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 border-0 !bg-site-whatsapp text-xs !text-white hover:!bg-site-whatsapp-hover"
            asChild
          >
            <a
              href={buildCompanyProductInquiryWhatsAppUrl(productName, {
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

function SpecItem({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  if (!value || value === "Не указано" || value === "Не указан") return null;

  return (
    <div className="min-w-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="truncate font-medium text-site-ink">{value}</dd>
    </div>
  );
}
