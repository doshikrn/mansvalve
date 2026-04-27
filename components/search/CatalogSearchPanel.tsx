"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Loader2, Package, Search, X } from "lucide-react";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { isMediaUrlValid } from "@/lib/media-url";
import type { ProductSearchItemDto } from "@/lib/search/product-search-dto";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";

function formatKzt(n: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n);
}

const SUGGEST_LIMIT = 8;
const DEBOUNCE_MS = 300;

const HEADER_PLACEHOLDER = "Поиск по DN, PN, арматуре";

type CatalogSearchPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "dropdown" | "fullscreen";
  onSearchSubmit: (q: string) => void;
  /** Desktop header: compact input + popout list below. */
  headerEmbed?: boolean;
};

export function CatalogSearchPanel({
  isOpen,
  onClose,
  mode,
  onSearchSubmit,
  headerEmbed = false,
}: CatalogSearchPanelProps) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSearchItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isOpen]);

  const runFetch = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!query.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        const id = ++reqId.current;
        setLoading(true);
        setFetchError(false);
        fetch(
          `/api/search/products?${new URLSearchParams({ q: query, limit: String(SUGGEST_LIMIT) })}`,
        )
          .then((r) => {
            if (!r.ok) throw new Error("search failed");
            return r.json() as Promise<{ products: ProductSearchItemDto[] }>;
          })
          .then((data) => {
            if (id !== reqId.current) return;
            setSuggestions(data.products ?? []);
          })
          .catch(() => {
            if (id !== reqId.current) return;
            setFetchError(true);
            setSuggestions([]);
          })
          .finally(() => {
            if (id === reqId.current) setLoading(false);
          });
      }, DEBOUNCE_MS);
    },
    [],
  );

  const onInputChange = (v: string) => {
    setQ(v);
    if (!v.trim()) {
      setSuggestions([]);
      setLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    setLoading(true);
    runFetch(v);
  };

  const submitToCatalog = (rawQ: string) => {
    const t = rawQ.trim();
    if (!t) return;
    onSearchSubmit(t);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    const pageContext = getPageAnalyticsContext();
    trackEvent("catalog_search", {
      source: "header-search",
      category: pageContext.category,
      product_slug: pageContext.product_slug,
      query: q.trim(),
    });
    submitToCatalog(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  const allResultsHref = q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : "/catalog";
  const showHeaderDropdown = q.trim() || loading || fetchError;

  const suggestionsList = (
    <>
      {fetchError && (
        <p className="p-3 text-sm text-amber-800">Не удалось загрузить подсказки. Попробуйте ещё раз.</p>
      )}
      {loading && !suggestions.length && q.trim() && !fetchError && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Поиск…
        </div>
      )}
      {q.trim() && !loading && !suggestions.length && !fetchError && (
        <p className="p-3 text-sm text-slate-500">Нет совпадений в первых {SUGGEST_LIMIT} · откройте полный список ниже.</p>
      )}
      <ul className="py-0.5">
        {suggestions.map((p) => (
          <li key={p.slug} className="border-b border-slate-50 last:border-0">
            <Link
              href={`/catalog/${p.slug}`}
              onClick={onClose}
              className="flex gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {p.primaryImageUrl && isMediaUrlValid(p.primaryImageUrl) ? (
                  <Image
                    src={p.primaryImageUrl}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized={mediaImageNeedsUnoptimized(p.primaryImageUrl)}
                    className="h-12 w-12 object-contain p-0.5"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center text-slate-400" aria-hidden>
                    <Package className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {p.categoryName}
                  {p.subcategoryName && p.subcategoryName !== p.categoryName ? ` · ${p.subcategoryName}` : ""}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  {p.priceByRequest || p.price == null
                    ? "Цена по запросу"
                    : formatKzt(p.price)}
                </p>
              </div>
              <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      {q.trim() && (
        <div
          className={cn(
            "border-t border-slate-100 bg-white p-2",
            !headerEmbed && "sticky bottom-0",
          )}
        >
          <Link
            href={allResultsHref}
            onClick={onClose}
            className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
          >
            Показать все результаты
          </Link>
        </div>
      )}
    </>
  );

  const formInner = (
    <form onSubmit={handleFormSubmit} className="w-full min-w-0" role="search">
      <div className={cn("relative", headerEmbed && "flex items-center gap-1.5")}>
        {headerEmbed && (
          <span id="catalog-search-title" className="sr-only">
            Поиск по каталогу
          </span>
        )}
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only" id="catalog-search-input-label">
            Поиск товаров по каталогу
          </span>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="catalog-search-input"
            ref={inputRef}
            type="search"
            name="q"
            value={q}
            onChange={(e) => onInputChange(e.target.value)}
            className={cn(
              "w-full border text-sm text-slate-900 outline-none transition",
              headerEmbed
                ? "h-10 rounded-lg border-slate-200/90 bg-white pl-9 pr-2 shadow-sm placeholder:text-slate-400 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                : "h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-9 pr-3 shadow-inner focus:border-blue-500 focus:bg-white",
            )}
            placeholder={headerEmbed ? HEADER_PLACEHOLDER : "Название, DN, PN, модель…"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Поиск по каталогу"
            aria-describedby="catalog-search-input-label"
            aria-autocomplete="list"
          />
        </label>
        {headerEmbed && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );

  if (headerEmbed) {
    return (
      <div className="relative w-full min-w-0 max-w-[min(100vw,300px)]" onKeyDown={handleKeyDown}>
        {formInner}
        {showHeaderDropdown && (
          <div
            className="absolute left-0 right-0 top-full z-[100] mt-1.5 max-h-72 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-lg border border-slate-200/90 bg-white py-0.5 shadow-lg shadow-slate-200/50 [scrollbar-width:thin]"
            role="region"
            aria-label="Предпросмотр товаров"
            aria-live="polite"
          >
            {suggestionsList}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50",
        mode === "dropdown" && "w-[min(100vw-1.5rem,28rem)] sm:w-[28rem]",
        mode === "fullscreen" && "h-[min(100dvh,32rem)] w-full max-w-lg",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-search-title"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <h2 id="catalog-search-title" className="text-sm font-semibold text-slate-900">
          Поиск по каталогу
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3 pb-2">{formInner}</div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto border-t border-slate-100",
          mode === "dropdown" && "max-h-72",
          mode === "fullscreen" && "flex-1",
        )}
        role="region"
        aria-label="Предпросмотр товаров"
        aria-live="polite"
      >
        {suggestionsList}
      </div>
    </div>
  );
}
