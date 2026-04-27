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

const PLACEHOLDER_BAR = "Поиск по каталогу";
const PLACEHOLDER_MODAL = "Название, DN, PN, модель…";

export type CatalogSearchPanelVariant = "headerBar" | "modal";

type CatalogSearchPanelProps = {
  /** Main header: wide input, «Найти», always visible. */
  variant: CatalogSearchPanelVariant;
  isOpen: boolean;
  onClose: () => void;
  onSearchSubmit: (q: string) => void;
  /** A11y: avoid duplicate id when two instances are mounted. */
  inputId?: string;
  /** Analytics source suffix for catalog_search. */
  analyticsSource?: "header-bar" | "header-modal";
};

export function CatalogSearchPanel({
  variant,
  isOpen,
  onClose,
  onSearchSubmit,
  inputId: inputIdProp,
  analyticsSource = "header-bar",
}: CatalogSearchPanelProps) {
  const inputId = inputIdProp ?? (variant === "headerBar" ? "header-search-q" : "modal-search-q");
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
    if (variant === "headerBar") {
      setQ("");
      setSuggestions([]);
    } else {
      onClose();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    const pageContext = getPageAnalyticsContext();
    trackEvent("catalog_search", {
      source: analyticsSource,
      category: pageContext.category,
      product_slug: pageContext.product_slug,
      query: q.trim(),
    });
    submitToCatalog(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (variant === "headerBar") {
      setQ("");
      setSuggestions([]);
      inputRef.current?.blur();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const allResultsHref = q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : "/catalog";
  const showHeaderDropdown = q.trim() || loading || fetchError;
  const isBar = variant === "headerBar";
  const inputLabelId = `${inputId}-label`;

  const afterSuggestion = () => {
    if (variant === "headerBar") {
      setQ("");
      setSuggestions([]);
    }
  };

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
        <p className="p-3 text-sm text-slate-500">
          Нет совпадений в первых {SUGGEST_LIMIT} · откройте полный список ниже.
        </p>
      )}
      <ul className="py-0.5">
        {suggestions.map((p) => (
          <li key={p.slug} className="border-b border-slate-50 last:border-0">
            <Link
              href={`/catalog/${p.slug}`}
              onClick={() => {
                if (isBar) {
                  setQ("");
                  setSuggestions([]);
                } else {
                  onClose();
                }
              }}
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
          className={cn("border-t border-slate-100 bg-white p-2", isBar ? "" : "sticky bottom-0")}
        >
          <Link
            href={allResultsHref}
            onClick={() => {
              onClose();
              afterSuggestion();
            }}
            className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
          >
            Показать все результаты
          </Link>
        </div>
      )}
    </>
  );

  if (isBar) {
    return (
      <div className="relative w-full min-w-0 max-w-[560px]" onKeyDown={handleKeyDown}>
        <span className="sr-only" id={inputLabelId}>
          Поиск товаров по каталогу
        </span>
        <form onSubmit={handleFormSubmit} className="w-full min-w-0" role="search">
          <div
            className={cn(
              "flex h-[52px] w-full overflow-hidden rounded-xl border-2 border-slate-400 bg-white shadow-sm",
              "transition-[box-shadow,border-color] focus-within:border-blue-700 focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-900/15",
              "lg:h-14",
            )}
          >
            <label className="relative flex min-w-0 flex-1 items-center pl-10 lg:pl-11">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 lg:left-3.5 lg:h-5 lg:w-5"
                aria-hidden
              />
              <input
                id={inputId}
                ref={inputRef}
                type="search"
                name="q"
                value={q}
                onChange={(e) => onInputChange(e.target.value)}
                className={cn(
                  "h-full w-full min-w-0 border-0 bg-transparent py-0 pr-3 text-[15px] text-slate-900 outline-none",
                  "placeholder:text-slate-400 focus:ring-0 lg:text-base",
                )}
                placeholder={PLACEHOLDER_BAR}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Поиск по каталогу"
                aria-describedby={inputLabelId}
                aria-autocomplete="list"
              />
            </label>
            <button
              type="submit"
              className={cn(
                "w-[112px] shrink-0 bg-slate-950 px-3 text-sm font-semibold text-white transition",
                "hover:bg-slate-900 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/80",
              )}
            >
              Найти
            </button>
          </div>
        </form>
        {showHeaderDropdown && (
          <div
            className="absolute right-0 left-0 z-[100] mt-1.5 max-h-[min(50vh,22rem)] min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-lg border border-slate-200/90 bg-white py-0.5 shadow-xl shadow-slate-300/40 [scrollbar-width:thin]"
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

  const formInner = (
    <form onSubmit={handleFormSubmit} className="w-full min-w-0" role="search">
      <div className="relative">
        <label className="block min-w-0">
          <span className="sr-only" id="modal-form-label">
            Поиск товаров по каталогу
          </span>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            name="q"
            value={q}
            onChange={(e) => onInputChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:bg-white focus:outline-none"
            placeholder={PLACEHOLDER_MODAL}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Поиск по каталогу"
            aria-describedby="modal-form-label"
            aria-autocomplete="list"
          />
        </label>
      </div>
    </form>
  );

  return (
    <div
      className="flex h-[min(100dvh,32rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50"
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
        className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100"
        role="region"
        aria-label="Предпросмотр товаров"
        aria-live="polite"
      >
        {suggestionsList}
      </div>
    </div>
  );
}
