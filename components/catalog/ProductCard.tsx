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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_52px_-42px_rgba(15,23,42,0.8)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_28px_70px_-46px_rgba(15,23,42,0.9)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100">
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
          className="rounded-xl border border-slate-100 bg-[#F7F9FC]"
          safeAreaClassName="p-6 md:p-8 lg:p-9"
        >
          <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/95 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" aria-hidden />
            {CATALOG_COMMERCIAL_FALLBACK.availabilityLabel}
          </span>
          <span className="absolute right-3 top-3 max-w-[42%] truncate rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            {view.categoryLabel}
          </span>
        </ProductImageFrame>
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {product.dn != null && (
            <span
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-site-primary shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
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
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-site-primary shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.pn}
            >
              <span className="text-site-primary" aria-label={CATALOG_SPEC_HINTS.pn}>
                PN
              </span>
              {product.pn}
            </span>
          )}
          {product.thread && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]">
              <span className="text-site-primary">M</span>
              {product.thread.replace(/^M/i, "")}
            </span>
          )}
          {product.material && (
            <span
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.material}
            >
              {product.material}
            </span>
          )}
          {product.model && (
            <span
              className="max-w-full truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.8)]"
              title={CATALOG_SPEC_HINTS.model}
            >
              {product.model}
            </span>
          )}
        </div>

        <Link
          href={detailHref}
          className="mb-3 block text-xl font-bold leading-tight tracking-tight text-site-ink transition-colors line-clamp-3 hover:text-site-primary-hover focus-visible:text-site-primary-hover lg:text-[22px]"
        >
          {productName}
        </Link>

        <dl className="mb-3 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 text-sm text-site-muted md:grid-cols-3 md:divide-x md:divide-y-0">
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

        <p className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-3 text-sm text-site-muted">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          {CATALOG_COMMERCIAL_FALLBACK.deliveryHint}
        </p>

        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-site-muted">
          {view.shortDescription}
        </p>

        <div className="mb-4 flex items-end justify-between gap-3">
          {product.price && !product.priceByRequest ? (
            <div>
              <p className="text-sm font-medium text-slate-500">
                Цена от
              </p>
              <p className="text-3xl font-extrabold leading-none tracking-tight text-site-cta">
                {formatPrice(product.price)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-500">
                Цена
              </p>
              <p className="text-2xl font-extrabold tracking-tight text-site-primary">по запросу</p>
            </div>
          )}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
            <Zap className="h-3.5 w-3.5" aria-hidden />
            КП за 15 мин
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
            triggerClassName="h-11 w-full justify-center rounded-lg border-slate-300 bg-white text-sm font-bold text-site-ink hover:bg-slate-50"
          >
            Узнать цену
            <ArrowRight className="ml-2 h-4 w-4" />
          </QuickContactSheet>
          <Button
            size="sm"
            className="h-11 w-full rounded-lg border-0 !bg-site-whatsapp text-sm font-bold !text-white shadow-[0_16px_34px_-24px_rgba(34,197,94,0.9)] hover:!bg-site-whatsapp-hover"
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
              <WhatsappIcon className="mr-2 h-4 w-4" />
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
    <div className="flex min-w-0 gap-2 py-3 md:px-3 first:md:pl-0 last:md:pr-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500" title={hint}>
          {label}
        </dt>
        <dd className="truncate font-bold text-site-ink">{value}</dd>
      </div>
    </div>
  );
}
