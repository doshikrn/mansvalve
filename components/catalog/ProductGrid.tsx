import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";

import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Button } from "@/components/ui/button";
import { buildCompanyWhatsAppUrl } from "@/lib/company";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  total: number;
  query?: string;
  hasActiveFilters?: boolean;
}

const EMPTY_STATE_WA_MESSAGE =
  "Здравствуйте! В каталоге не нашёл нужную позицию — помогите подобрать.";

export function ProductGrid({
  products,
  total,
  query,
  hasActiveFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    const trimmedQuery = query?.trim();
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-site-border bg-site-card px-6 py-16 text-center shadow-sm sm:py-20">
        <PackageSearch
          size={56}
          strokeWidth={1.25}
          className="mb-4 text-slate-300"
          aria-hidden
        />
        <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
          Ничего не найдено
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
          {trimmedQuery
            ? `По запросу «${trimmedQuery}» товары не найдены.`
            : "По выбранным фильтрам товары не найдены."}{" "}
          {hasActiveFilters
            ? "Попробуйте очистить часть фильтров — или мы подберём позицию вручную."
            : "Попробуйте изменить поисковую фразу — или попросите инженера подобрать аналог."}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {hasActiveFilters || trimmedQuery ? (
            <Button asChild size="lg" variant="outline" className="h-11 px-5">
              <Link href="/catalog">Сбросить фильтры</Link>
            </Button>
          ) : null}
          <Button
            asChild
            size="lg"
            className="h-11 border-0 !bg-site-whatsapp px-5 !text-white hover:!bg-site-whatsapp-hover"
          >
            <a
              href={buildCompanyWhatsAppUrl(EMPTY_STATE_WA_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon className="mr-1.5 h-4 w-4" />
              Запросить подбор
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>

        <p className="mt-5 text-xs text-slate-400">
          Закроем под спецификацию: ГОСТ, DIN, ISO. Документы и НДС включены.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-slate-500">
          Найдено <span className="font-semibold text-slate-900 tabular-nums">{total}</span>{" "}
          {pluralize(total)}
        </p>
        <p className="text-xs text-slate-400">
          Все позиции — со спецификациями и документами
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function pluralize(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "позиция";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "позиции";
  }
  return "позиций";
}
