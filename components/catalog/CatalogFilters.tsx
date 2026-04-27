"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  useId,
  type ReactNode,
} from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicCatalogCategory as Category } from "@/lib/public-catalog";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface CatalogFiltersProps {
  categories: Category[];
  subcategoryOptions: Array<{ id: string; name: string }>;
  dnOptions: number[];
  pnOptions: number[];
  threadOptions: string[];
  materialOptions: string[];
  connectionTypeOptions: string[];
  controlTypeOptions: string[];
  showCategoryTabs?: boolean;
  showSubcategoryFilter?: boolean;
  showThreadFilter?: boolean;
  children: ReactNode;
}

const selectClassName =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

function FilterSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

type FilterFormContentProps = {
  categories: Category[];
  subcategoryOptions: Array<{ id: string; name: string }>;
  dnOptions: number[];
  pnOptions: number[];
  threadOptions: string[];
  materialOptions: string[];
  connectionTypeOptions: string[];
  controlTypeOptions: string[];
  showCategoryTabs: boolean;
  showSubcategoryFilter: boolean;
  showThreadFilter: boolean;
  pathname: string;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  searchFieldId: string;
  // URL-driven values
  activeSubcategory: string;
  /** `?category=` on /catalog, if any */
  categoryQuery: string;
  activeDn: string;
  activePn: string;
  activeThread: string;
  activeMaterial: string;
  activeConnectionType: string;
  activeControlType: string;
  setParam: (key: string, value: string) => void;
};

function FilterFormContent({
  categories,
  subcategoryOptions,
  dnOptions,
  pnOptions,
  threadOptions,
  materialOptions,
  connectionTypeOptions,
  controlTypeOptions,
  showCategoryTabs,
  showSubcategoryFilter,
  showThreadFilter,
  pathname,
  searchInput,
  onSearchInputChange,
  searchFieldId,
  setParam,
  categoryQuery,
  activeSubcategory,
  activeDn,
  activePn,
  activeThread,
  activeMaterial,
  activeConnectionType,
  activeControlType,
}: FilterFormContentProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <label
          className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500"
          htmlFor={searchFieldId}
        >
          Поиск
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id={searchFieldId}
            type="search"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Название, DN, резьба…"
            autoComplete="off"
            className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            aria-label="Поиск по каталогу"
          />
        </div>
      </div>

      {showCategoryTabs && (
        <FilterSection title="Категория">
          <div className="flex max-h-44 flex-col gap-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
            <Link
              href="/catalog"
              onClick={() =>
                trackEvent("catalog_filter_change", {
                  source: "catalog-filters",
                  category: "all",
                  filter_key: "category",
                  filter_value: "all",
                })
              }
              className={cn(
                "rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                pathname === "/catalog" && !categoryQuery
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100",
              )}
            >
              Все категории
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/category/${cat.slug}`}
                onClick={() =>
                  trackEvent("catalog_filter_change", {
                    source: "catalog-filters",
                    category: cat.slug,
                    filter_key: "category",
                    filter_value: cat.slug,
                  })
                }
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  pathname === `/catalog/category/${cat.slug}`
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </FilterSection>
      )}

      {showSubcategoryFilter && (
        <FilterSection title="Тип товара">
          <select
            value={activeSubcategory}
            onChange={(e) => setParam("subcategory", e.target.value)}
            className={selectClassName}
            aria-label="Тип товара"
          >
            <option value="">Все</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FilterSection title="DN" className="min-w-0">
          <select
            value={activeDn}
            onChange={(e) => setParam("dn", e.target.value)}
            className={selectClassName}
            aria-label="DN"
          >
            <option value="">Все</option>
            {dnOptions.map((dn) => (
              <option key={dn} value={String(dn)}>
                DN{dn}
              </option>
            ))}
          </select>
        </FilterSection>
        <FilterSection title="PN" className="min-w-0">
          <select
            value={activePn}
            onChange={(e) => setParam("pn", e.target.value)}
            className={selectClassName}
            aria-label="PN"
          >
            <option value="">Все</option>
            {pnOptions.map((pn) => (
              <option key={pn} value={String(pn)}>
                PN{pn}
              </option>
            ))}
          </select>
        </FilterSection>
      </div>

      <FilterSection title="Материал">
        <select
          value={activeMaterial}
          onChange={(e) => setParam("material", e.target.value)}
          className={selectClassName}
          aria-label="Материал"
        >
          <option value="">Все</option>
          {materialOptions.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>
      </FilterSection>

      {showThreadFilter && (
        <FilterSection title="Резьба">
          <select
            value={activeThread}
            onChange={(e) => setParam("thread", e.target.value)}
            className={selectClassName}
            aria-label="Резьба"
          >
            <option value="">Все</option>
            {threadOptions.map((thread) => (
              <option key={thread} value={thread}>
                {thread}
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      <FilterSection title="Тип соединения">
        <select
          value={activeConnectionType}
          onChange={(e) => setParam("connectionType", e.target.value)}
          className={selectClassName}
          aria-label="Тип соединения"
        >
          <option value="">Все</option>
          {connectionTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Тип управления">
        <select
          value={activeControlType}
          onChange={(e) => setParam("controlType", e.target.value)}
          className={selectClassName}
          aria-label="Тип управления"
        >
          <option value="">Все</option>
          {controlTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FilterSection>
    </div>
  );
}

type ChipItem = { key: string; label: string; paramKey: string };

function ActiveFilterChips({
  items,
  onRemove,
}: {
  items: ChipItem[];
  onRemove: (paramKey: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white py-0.5 pl-2.5 pr-0.5 text-xs text-slate-800 shadow-sm"
        >
          <span className="min-w-0 truncate">{item.label}</span>
          <button
            type="button"
            onClick={() => onRemove(item.paramKey)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Сбросить: ${item.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

function buildFilterChipItems(
  searchParams: ReturnType<typeof useSearchParams>,
  categories: Category[],
  subcategoryOptions: Array<{ id: string; name: string }>,
  showCategoryTabs: boolean,
  showSubcategoryFilter: boolean,
): ChipItem[] {
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const sub = searchParams.get("subcategory") ?? "";
  const dn = searchParams.get("dn") ?? "";
  const pn = searchParams.get("pn") ?? "";
  const material = searchParams.get("material") ?? "";
  const thread = searchParams.get("thread") ?? "";
  const connectionType = searchParams.get("connectionType") ?? "";
  const controlType = searchParams.get("controlType") ?? "";

  const out: ChipItem[] = [];
  if (q) {
    out.push({
      key: `q-${q}`,
      paramKey: "q",
      label: `Поиск: ${q.length > 32 ? `${q.slice(0, 32)}…` : q}`,
    });
  }
  if (showCategoryTabs && category) {
    const name = categories.find((c) => c.id === category)?.name ?? category;
    out.push({ key: `cat-${category}`, paramKey: "category", label: `Категория: ${name}` });
  }
  if (showSubcategoryFilter && sub) {
    const name = subcategoryOptions.find((s) => s.id === sub)?.name ?? sub;
    out.push({ key: `sub-${sub}`, paramKey: "subcategory", label: `Тип: ${name}` });
  }
  if (dn) out.push({ key: `dn-${dn}`, paramKey: "dn", label: `DN${dn}` });
  if (pn) out.push({ key: `pn-${pn}`, paramKey: "pn", label: `PN${pn}` });
  if (material) {
    out.push({ key: `m-${material}`, paramKey: "material", label: `Материал: ${material}` });
  }
  if (thread) out.push({ key: `t-${thread}`, paramKey: "thread", label: `Резьба: ${thread}` });
  if (connectionType) {
    out.push({
      key: `ct-${connectionType}`,
      paramKey: "connectionType",
      label: `Соединение: ${connectionType}`,
    });
  }
  if (controlType) {
    out.push({
      key: `ctl-${controlType}`,
      paramKey: "controlType",
      label: `Управление: ${controlType}`,
    });
  }
  return out;
}

function FilterPanelCard({
  hasFilters,
  isPending,
  onClear,
  children,
  headerId,
}: {
  hasFilters: boolean;
  isPending: boolean;
  onClear: () => void;
  children: ReactNode;
  headerId: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id={headerId} className="text-sm font-semibold text-slate-900">
          Фильтры
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-blue-600 transition hover:text-blue-800"
          >
            Сбросить
          </button>
        )}
      </div>
      {children}
    </div>
  );
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
  children,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchIdSidebar = useId();
  const searchIdSheet = useId();

  const activeDn = searchParams.get("dn") ?? "";
  const activePn = searchParams.get("pn") ?? "";
  const activeThread = searchParams.get("thread") ?? "";
  const activeMaterial = searchParams.get("material") ?? "";
  const activeSubcategory = searchParams.get("subcategory") ?? "";
  const activeConnectionType = searchParams.get("connectionType") ?? "";
  const activeControlType = searchParams.get("controlType") ?? "";
  const activeQ = searchParams.get("q") ?? "";
  const categoryQuery = searchParams.get("category") ?? "";

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFilters = Boolean(
    activeSubcategory ||
      activeDn ||
      activePn ||
      activeThread ||
      activeMaterial ||
      activeConnectionType ||
      activeControlType ||
      activeQ ||
      categoryQuery,
  );

  const filterChipItems = buildFilterChipItems(
    searchParams,
    categories,
    subcategoryOptions,
    showCategoryTabs,
    showSubcategoryFilter,
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const pageContext = getPageAnalyticsContext(pathname);
      trackEvent("catalog_filter_change", {
        source: "catalog-filters",
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

  const removeParam = useCallback(
    (key: string) => {
      const pageContext = getPageAnalyticsContext(pathname);
      trackEvent("catalog_filter_change", {
        source: "catalog-filters",
        category: pageContext.category,
        filter_key: key,
        filter_value: "remove",
      });
      const next = new URLSearchParams(searchParams.toString());
      next.delete(key);
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
      category: pageContext.category,
      filter_key: "all",
      filter_value: "reset",
    });

    setSearchInput("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const formProps: Omit<FilterFormContentProps, "searchFieldId"> = {
    categories,
    subcategoryOptions,
    dnOptions,
    pnOptions,
    threadOptions,
    materialOptions,
    connectionTypeOptions,
    controlTypeOptions,
    showCategoryTabs,
    showSubcategoryFilter,
    showThreadFilter,
    pathname,
    searchInput,
    onSearchInputChange: setSearchInput,
    categoryQuery,
    activeSubcategory,
    activeDn,
    activePn,
    activeThread,
    activeMaterial,
    activeConnectionType,
    activeControlType,
    setParam,
  };

  const activeCount = filterChipItems.length;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
      <aside
        className="hidden w-full min-w-0 self-start lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:pb-2"
        aria-label="Фильтры каталога"
      >
        <FilterPanelCard
          hasFilters={hasFilters}
          isPending={isPending}
          onClear={clearAll}
          headerId="catalog-filters-title"
        >
          <div aria-labelledby="catalog-filters-title">
            <FilterFormContent {...formProps} searchFieldId={searchIdSidebar} />
          </div>
        </FilterPanelCard>
      </aside>

      <div className="min-w-0">
        <div className="mb-4 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
            {activeCount > 0 && (
              <span className="ml-0.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-[0.65rem] text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        <ActiveFilterChips
          items={filterChipItems}
          onRemove={(key) => {
            if (key === "q") {
              setSearchInput("");
            }
            removeParam(key);
          }}
        />

        {children}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          showCloseButton
          className="flex h-full max-h-dvh !w-full max-w-[min(100vw,22rem)] flex-col gap-0 border-slate-200 p-0 sm:max-w-[22rem]"
        >
          <SheetHeader className="border-b border-slate-100 px-4 pb-3 pt-2">
            <SheetTitle>Фильтры</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
            <div className={cn(isPending && "pointer-events-none opacity-60")}>
              <FilterFormContent {...formProps} searchFieldId={searchIdSheet} />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 sm:flex-col">
            {hasFilters && (
              <Button type="button" variant="secondary" className="w-full" onClick={clearAll}>
                Сбросить фильтры
              </Button>
            )}
            <Button type="button" className="w-full" onClick={() => setSheetOpen(false)}>
              Готово
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}