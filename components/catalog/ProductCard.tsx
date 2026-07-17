import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Hand,
  Link2,
  Tag,
} from "lucide-react";

import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { Button } from "@/components/ui/button";
import { QuickContactSheet } from "@/components/catalog/QuickContactSheet";
import {
  buildCompanyProductInquiryEmailUrl,
  buildCompanyProductInquiryWhatsAppUrl,
} from "@/lib/company";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";
import { buildPublicProductCardView } from "@/lib/public-catalog/product-view";
import { CATALOG_COMMERCIAL_FALLBACK, CATALOG_SPEC_HINTS } from "@/lib/catalog/spec-hints";
import { warnInvalidMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
}

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const view = buildPublicProductCardView(product);
  const detailHref = view.canonicalPath;
  const productName = view.displayName;
  const isList = layout === "list";
  warnInvalidMediaUrl(view.primaryImageUrl, `ProductCard:${product.slug}`);

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border border-site-border bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md",
        isList ? "md:grid md:grid-cols-[260px_minmax(0,1fr)]" : "flex h-full flex-col",
      )}
    >
      <Link
        href={detailHref}
        className={cn("relative block", isList && "md:border-r md:border-site-border")}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImageFrame
          src={view.primaryImageUrl}
          alt={view.primaryImageAlt}
          quality={85}
          unoptimized={view.primaryImageUnoptimized}
          sizes={
            isList
              ? "(max-width: 768px) 100vw, 260px"
              : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          }
          className={cn("bg-[#F7F8FA]", isList && "md:aspect-auto md:h-full md:min-h-[310px]")}
          safeAreaClassName="p-5 sm:p-6"
        >
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50/95 px-2 py-1 text-[11px] font-semibold leading-none text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {CATALOG_COMMERCIAL_FALLBACK.availabilityLabel}
          </span>
          <span className="absolute right-2.5 top-2.5 max-w-[42%] truncate rounded border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-medium leading-none text-slate-600 shadow-sm">
            {view.categoryLabel}
          </span>
        </ProductImageFrame>
      </Link>

      <div className={cn("flex min-w-0 flex-1 flex-col p-4", isList && "md:p-5")}>
        <div className="mb-3 flex min-h-7 flex-wrap gap-1.5">
          {product.dn != null ? <SpecBadge label="DN" value={String(product.dn)} /> : null}
          {product.pn != null ? <SpecBadge label="PN" value={String(product.pn)} /> : null}
          {product.material ? <SpecBadge value={product.material} muted /> : null}
          {product.model ? <SpecBadge value={product.model} muted /> : null}
        </div>

        <Link
          href={detailHref}
          className={cn(
            "block font-bold leading-snug tracking-tight text-site-ink transition-colors hover:text-site-primary-hover focus-visible:text-site-primary-hover",
            isList ? "text-lg sm:text-xl" : "min-h-[3.1rem] text-[17px] line-clamp-2",
          )}
        >
          {productName}
        </Link>

        {view.shortDescription ? (
          <p className={cn("mt-2 text-sm leading-relaxed text-site-muted", isList ? "line-clamp-3" : "min-h-10 line-clamp-2")}>
            {view.shortDescription}
          </p>
        ) : null}

        <dl className={cn("mt-4 grid gap-x-4 gap-y-3 border-y border-slate-200 py-3", isList ? "sm:grid-cols-3" : "grid-cols-2")}>
          <SpecItem icon={Tag} label="Марка" hint={CATALOG_SPEC_HINTS.model} value={product.model} />
          <SpecItem icon={Link2} label="Соединение" hint={CATALOG_SPEC_HINTS.connection} value={product.connectionType} />
          <SpecItem icon={Hand} label="Управление" hint={CATALOG_SPEC_HINTS.control} value={product.controlType} />
        </dl>

        <p className="mt-3 flex items-center gap-2 text-xs leading-relaxed text-site-muted">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          {CATALOG_COMMERCIAL_FALLBACK.deliveryHint}
        </p>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Цена</p>
              <p className="mt-0.5 text-xl font-extrabold tracking-tight text-site-ink">
                {product.price && !product.priceByRequest
                  ? `от ${formatPrice(product.price)}`
                  : "по запросу"}
              </p>
            </div>
            <span className="text-right text-[11px] leading-snug text-slate-500">
              КП с ценой и сроком
              <br />
              в рабочее время
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="h-10 border-slate-300 font-bold text-site-ink">
              <Link href={detailHref}>
                Подробнее
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <QuickContactSheet
              whatsAppUrl={buildCompanyProductInquiryWhatsAppUrl(productName, {
                dn: product.dn,
                pn: product.pn,
              })}
              emailUrl={buildCompanyProductInquiryEmailUrl(productName, {
                dn: product.dn,
                pn: product.pn,
              })}
              formTarget={`${detailHref}#request-name`}
              analytics={{
                source: "product-card",
                product_id: product.id,
                product_slug: product.slug,
                product_name: productName,
                category: view.categoryLabel,
              }}
              triggerSize="sm"
              triggerClassName="site-primary-cta h-10 w-full justify-center rounded-md px-2 text-xs font-bold"
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Получить КП
            </QuickContactSheet>
          </div>
        </div>
      </div>
    </article>
  );
}

function SpecBadge({
  label,
  value,
  muted = false,
}: {
  label?: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded border px-2 py-1 text-[11px] font-semibold",
        muted
          ? "border-slate-200 bg-slate-50 text-slate-600"
          : "border-blue-200 bg-blue-50 text-site-primary",
      )}
    >
      {label ? <span>{label}</span> : null}
      <span className="truncate">{value}</span>
    </span>
  );
}

function SpecItem({
  icon: Icon,
  label,
  hint,
  value,
}: {
  icon: typeof Tag;
  label: string;
  hint?: string;
  value: string | undefined;
}) {
  if (!value || /^не\s+указан/iu.test(value)) return null;

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <dt className="truncate" title={hint}>{label}</dt>
      </div>
      <dd className="mt-1 truncate text-xs font-bold text-site-ink">{value}</dd>
    </div>
  );
}
