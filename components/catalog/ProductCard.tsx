import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { Button } from "@/components/ui/button";
import { buildCompanyProductInquiryWhatsAppUrl } from "@/lib/company";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
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
  const view = buildPublicProductView(product);
  const detailHref = view.canonicalPath;
  const productName = view.displayName;
  const imageSrc = view.primaryImageUrl;
  const imageAlt = view.primaryImageAlt;
  warnInvalidMediaUrl(imageSrc, `ProductCard:${product.slug}`);

  return (
    <article className="site-card group flex flex-col overflow-hidden p-0 active:scale-[0.98] motion-reduce:active:scale-100">
      <Link
        href={detailHref}
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImageFrame
          src={imageSrc}
          alt={imageAlt}
          quality={90}
          unoptimized={view.primaryImageUnoptimized}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="rounded-t-[inherit]"
          safeAreaClassName="p-3.5 sm:p-4"
        >
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/28 to-transparent" />
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-site-muted shadow-sm">
            {view.categoryLabel}
          </span>
        </ProductImageFrame>
      </Link>

      <div className="flex flex-1 flex-col p-4">
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

        <p className="mb-3 text-xs text-site-muted leading-relaxed line-clamp-2 flex-1">
          {view.shortDescription}
        </p>

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
