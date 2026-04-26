"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicCatalogCategory as Category } from "@/lib/public-catalog";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

interface CatalogFiltersProps {
  categories: Category[];
  subcategoryOptions: Array<{ id: string; name: string }>;
  dnOptions: number[];
  pnOptions: number[];
  threadOptions: string[];
  materialOptions: string[];
  connectionTypeOptions: string[];
  controlTypeOptions: string[];
  /** When false, the category tab row is hidden (for locked category pages). Default: true. */
  showCategoryTabs?: boolean;
  /** When false, the subcategory dropdown is hidden (for locked subcategory pages). Default: true. */
  showSubcategoryFilter?: boolean;
  /** When true, shows thread-size selector. Default: false. */
  showThreadFilter?: boolean;
}

export function CatalogFilters({
  categories,
  subcategoryOptions,
  dnOptions,
  pnOptions,
  threadOptions,
  materialOptions,
  connectionTypeOptions,
  controlTypeOptions,
  showCategoryTabs = true,
  showSubcategoryFilter = true,
  showThreadFilter = false,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeDn = searchParams.get("dn") ?? "";
  const activePn = searchParams.get("pn") ?? "";
  const activeThread = searchParams.get("thread") ?? "";
  const activeMaterial = searchParams.get("material") ?? "";
  const activeSubcategory = searchParams.get("subcategory") ?? "";
  const activeConnectionType = searchParams.get("connectionType") ?? "";
  const activeControlType = searchParams.get("controlType") ?? "";
  const activeQ = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(activeQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFilters =
    activeSubcategory ||
    activeDn ||
    activePn ||
    activeThread ||
    activeMaterial ||
    activeConnectionType ||
    activeControlType ||
    activeQ;

  const setParam = useCallback(
    (key: string, value: string) => {
      const pageContext = getPageAnalyticsContext(pathname);
      trackEvent("catalog_filter_change", {
        source: "catalog-filters",
        page: pageContext.page,
        category: pageContext.category,
        filter_key: key,
        filter_value: value || "all",
      });

      const next = new URLSearchParams(searchParams.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (searchInput === activeQ) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const query = searchInput.trim();
      const pageContext = getPageAnalyticsContext(pathname);
      trackEvent("catalog_search", {
        source: "catalog-filters",
        page: pageContext.page,
        category: pageContext.category,
        query,
      });

      const next = new URLSearchParams(searchParams.toString());
      if (query) {
        next.set("q", query);
      } else {
        next.delete("q");
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(activeQ);
  }, [activeQ]);

  const clearAll = useCallback(() => {
    const pageContext = getPageAnalyticsContext(pathname);
    trackEvent("catalog_filter_change", {
      source: "catalog-filters",
      page: pageContext.page,
      category: pageContext.category,
      filter_key: "all",
      filter_value: "reset",
    });

    setSearchInput("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        isPending && "opacity-60 pointer-events-none",
      )}
    >
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск по названию, DN, PN, резьбе, материалу…"
          aria-label="Поиск по каталогу"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:max-w-sm"
        />
      </div>

      {/* Category tabs */}
      {showCategoryTabs && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/catalog"
            onClick={() =>
              trackEvent("catalog_filter_change", {
                source: "catalog-filters",
                page: pathname,
                category: "all",
                filter_key: "category",
                filter_value: "all",
              })
            }
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              pathname === "/catalog"
                ? "bg-blue-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            Все
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog/category/${cat.slug}`}
              onClick={() =>
                trackEvent("catalog_filter_change", {
                  source: "catalog-filters",
                  page: pathname,
                  category: cat.slug,
                  filter_key: "category",
                  filter_value: cat.slug,
                })
              }
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                pathname === `/catalog/category/${cat.slug}`
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Dropdowns row */}
      <div className="flex flex-wrap items-center gap-3">
        {showSubcategoryFilter && (
          <select
            value={activeSubcategory}
            onChange={(e) => setParam("subcategory", e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Тип товара — все</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={activeDn}
          onChange={(e) => setParam("dn", e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">DN — все</option>
          {dnOptions.map((dn) => (
            <option key={dn} value={String(dn)}>
              DN{dn}
            </option>
          ))}
        </select>

        <select
          value={activePn}
          onChange={(e) => setParam("pn", e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">PN — все</option>
          {pnOptions.map((pn) => (
            <option key={pn} value={String(pn)}>
              PN{pn}
            </option>
          ))}
        </select>

        <select
          value={activeMaterial}
          onChange={(e) => setParam("material", e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Материал — все</option>
          {materialOptions.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>

        {showThreadFilter && (
          <select
            value={activeThread}
            onChange={(e) => setParam("thread", e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Резьба — все</option>
            {threadOptions.map((thread) => (
              <option key={thread} value={thread}>
                {thread}
              </option>
            ))}
          </select>
        )}

        <select
          value={activeConnectionType}
          onChange={(e) => setParam("connectionType", e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Тип соединения — все</option>
          {connectionTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={activeControlType}
          onChange={(e) => setParam("controlType", e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Тип управления — все</option>
          {controlTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={14} />
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
