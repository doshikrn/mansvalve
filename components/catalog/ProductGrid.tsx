import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";

import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Button } from "@/components/ui/button";
import { buildCompanyWhatsAppUrl } from "@/lib/company";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";
import { cn } from "@/lib/utils";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  total: number;
  query?: string;
  hasActiveFilters?: boolean;
  view?: "grid" | "list";
  resetHref?: string;
}

const EMPTY_STATE_WA_MESSAGE =
  "Здравствуйте! В каталоге не нашёл нужную позицию. Помогите подобрать арматуру по параметрам.";

export function ProductGrid({
  products,
  query,
  hasActiveFilters,
  view = "grid",
  resetHref = "/catalog",
}: ProductGridProps) {
  if (products.length === 0) {
    const trimmedQuery = query?.trim();
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-lg border border-dashed border-site-border bg-white px-6 py-14 text-center shadow-sm">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <PackageSearch className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </span>
        <h3 className="text-xl font-bold text-site-ink">Товары не найдены</h3>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-site-muted sm:text-base">
          {trimmedQuery
            ? `По запросу «${trimmedQuery}» нет подходящих позиций.`
            : "По выбранным параметрам нет подходящих позиций."}{" "}
          Сбросьте часть фильтров или отправьте параметры менеджеру для ручного подбора.
        </p>

        <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
          {hasActiveFilters || trimmedQuery ? (
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href={resetHref}>Сбросить фильтры</Link>
            </Button>
          ) : null}
          <Button
            asChild
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
      </div>
    );
  }

  return (
    <div
      className={cn(
        view === "list"
          ? "grid grid-cols-1 gap-4"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout={view} />
      ))}
    </div>
  );
}
