import Link from "next/link";
import { ArrowRight, CalendarDays, Hand, Link2, Tag, Zap } from "lucide-react";

import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
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
  const view = buildPublicProductCardView(product);
  const detailHref = view.canonicalPath;
  const productName = view.displayName;
  const imageSrc = view.primaryImageUrl;
  const imageAlt = view.primaryImageAlt;
  warnInvalidMediaUrl(imageSrc, `ProductCard:${product.slug}`);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-[0_16px_44px_-38px_rgba(15,23,42,0.75)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_24px_58px_-44px_rgba(15,23,42,0.82)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100">
      <Link
        href={detailHref}
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImageFrame
          src={imageSrc}
          alt={imageAlt}
          quality={85}
          unoptimized={view.primaryImageUnoptimized}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="rounded-lg border border-slate-100 bg-[#F7F9FC]"
          safeAreaClassName="p-5 sm:p-6"
        >
          <span className="absolute left-2 top-2 inline-flex max-w-[58%] items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/95 px-2 py-1 text-[11px] font-semibold leading-none text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,0.12)]" aria-hidden />
            <span className="truncate">
            {CATALOG_COMMERCIAL_FALLBACK.availabilityLabel}
            </span>
          </span>
          <span className="absolute right-2 top-2 max-w-[36%] truncate rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[11px] font-medium leading-none text-slate-600 shadow-sm">
            {view.categoryLabel}
          </span>
        </ProductImageFrame>
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {product.dn != null && (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-site-primary shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.dn}
            >
              <span className="text-site-primary" aria-label={CATALOG_SPEC_HINTS.dn}>
                DN
              </span>
              {product.dn}
            </span>
          )}
          {product.pn != null && (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-site-primary shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.pn}
            >
              <span className="text-site-primary" aria-label={CATALOG_SPEC_HINTS.pn}>
                PN
              </span>
              {product.pn}
            </span>
          )}
          {product.thread && (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]">
              <span className="text-site-primary">M</span>
              {product.thread.replace(/^M/i, "")}
            </span>
          )}
          {product.material && (
            <span
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.material}
            >
              {product.material}
            </span>
          )}
          {product.model && (
            <span
              className="max-w-full truncate rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.model}
            >
              {product.model}
            </span>
          )}
        </div>

        <Link
          href={detailHref}
          className="mb-3 block text-[17px] font-bold leading-snug tracking-tight text-site-ink transition-colors line-clamp-2 hover:text-site-primary-hover focus-visible:text-site-primary-hover"
        >
          {productName}
        </Link>

        <dl className="mb-3 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 text-site-muted">
          <SpecItem icon={Tag} label="Марка" hint={CATALOG_SPEC_HINTS.model} value={product.model} />
          <SpecItem
            icon={Link2}
            label="Соединение"
            hint={CATALOG_SPEC_HINTS.connection}
            value={product.connectionType}
          />
          <SpecItem
            icon={Hand}
            label="Управление"
            hint={CATALOG_SPEC_HINTS.control}
            value={product.controlType}
          />
        </dl>

        <p className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-3 text-xs leading-relaxed text-site-muted">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          {CATALOG_COMMERCIAL_FALLBACK.deliveryHint}
        </p>

        <p className="mb-4 truncate text-sm leading-relaxed text-site-muted">
          {view.shortDescription}
        </p>

        <div className="mb-4 flex items-end justify-between gap-2">
          {product.price && !product.priceByRequest ? (
            <div>
              <p className="text-xs font-medium text-slate-500">
                Цена от
              </p>
              <p className="text-2xl font-extrabold leading-none tracking-tight text-site-cta">
                {formatPrice(product.price)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-slate-500">
                Цена
              </p>
              <p className="text-xl font-extrabold tracking-tight text-site-primary">по запросу</p>
            </div>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700">
            <Zap className="h-3 w-3" aria-hidden />
            КП за 15 мин
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
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
              product_slug: product.slug,
              product_name: productName,
              category: view.categoryLabel,
            }}
            triggerVariant="outline"
            triggerSize="sm"
            triggerClassName="h-10 w-full justify-center rounded-md border-slate-300 bg-white px-2 text-xs font-bold text-site-ink hover:bg-slate-50"
          >
            Узнать цену
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </QuickContactSheet>
          <Button
            size="sm"
            className="h-10 w-full rounded-md border-0 !bg-site-whatsapp px-2 text-xs font-bold !text-white shadow-[0_16px_34px_-24px_rgba(34,197,94,0.9)] hover:!bg-site-whatsapp-hover"
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
              <WhatsappIcon className="mr-1.5 h-3.5 w-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </article>
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
  if (!value || value === "Не указано" || value === "Не указан") return null;

  return (
    <div className="min-w-0 px-2 py-2.5 first:pl-0 last:pr-0">
      <div className="flex min-w-0 items-center gap-1">
        <Icon className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
        <dt className="truncate text-[10px] leading-tight text-slate-500" title={hint}>
          {label}
        </dt>
      </div>
      <dd className="mt-1 truncate text-[13px] font-bold leading-tight text-site-ink">{value}</dd>
    </div>
  );
}
