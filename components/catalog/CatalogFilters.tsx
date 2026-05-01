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
import { Check, ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicCatalogCategory as Category } from "@/lib/public-catalog";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { FilterSelectMenu } from "@/components/catalog/FilterSelectMenu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

type SelectOption = { value: string; label: string };

interface CatalogFiltersProps {
  categories: Category[];
  subcategoryOptions: Array<{ id: string; name: string }>;
  dnOptions: number[];
  pnOptions: number[];
  modelOptions: SelectOption[];
  threadOptions: string[];
  materialOptions: SelectOption[];
  connectionTypeOptions: SelectOption[];
  controlTypeOptions: SelectOption[];
  showCategoryTabs?: boolean;
  showSubcategoryFilter?: boolean;
  showThreadFilter?: boolean;
  children: ReactNode;
}

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
    <div
      className={cn(
        "space-y-2.5 border-t border-slate-100/90 pt-4 first:mt-0 first:space-y-2 first:border-0 first:pt-0",
        className,
      )}
    >
      <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
  modelOptions: SelectOption[];
  threadOptions: string[];
  materialOptions: SelectOption[];
  connectionTypeOptions: SelectOption[];
  controlTypeOptions: SelectOption[];
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
  activeModel: string;
  activeThread: string;
  activeMaterial: string;
  activeConnectionType: string;
  activeControlType: string;
  setParam: (key: string, value: string) => void;
};

/** "Все" + N first links; if more items exist, show a toggle. */
const CATEGORY_LIST_PREVIEW = 6;
const SUBCATEGORY_LIST_PREVIEW = 6;

function FilterFormContent({
  categories,
  subcategoryOptions,
  dnOptions,
  pnOptions,
  modelOptions,
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
  activeModel,
  activeThread,
  activeMaterial,
  activeConnectionType,
  activeControlType,
}: FilterFormContentProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const categoryListOverflows = categories.length > CATEGORY_LIST_PREVIEW;
  const subListOverflows = subcategoryOptions.length > SUBCATEGORY_LIST_PREVIEW;
  const activeCategoryIndex = categories.findIndex(
    (c) => pathname === `/catalog/category/${c.slug}`,
  );
  const activeSubIndex = subcategoryOptions.findIndex(
    (s) => s.id === activeSubcategory,
  );
  /** If current selection is outside the short list, we must show the full list (no setState in effects). */
  const mustShowAllCategories =
    categoryListOverflows && activeCategoryIndex >= CATEGORY_LIST_PREVIEW;
  const mustShowAllSubcategories =
    subListOverflows && activeSubIndex >= SUBCATEGORY_LIST_PREVIEW;

  const useFullCategoryList =
    !categoryListOverflows ||
    showAllCategories ||
    mustShowAllCategories;
  const useFullSubcategoryList =
    !subListOverflows || showAllSubcategories || mustShowAllSubcategories;

  const categorySlice = useFullCategoryList
    ? categories
    : categories.slice(0, CATEGORY_LIST_PREVIEW);
  const subSlice = useFullSubcategoryList
    ? subcategoryOptions
    : subcategoryOptions.slice(0, SUBCATEGORY_LIST_PREVIEW);

  return (
    <div className="flex flex-col gap-0">
      <div className="space-y-2.5">
        <label
          className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500"
          htmlFor={searchFieldId}
        >
          Поиск
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id={searchFieldId}
            type="search"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Название, DN, PN, марка"
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-site-border bg-site-card pl-9 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-site-primary focus:ring-2 focus:ring-site-primary/15 focus:outline-none"
            aria-label="Поиск по каталогу"
          />
        </div>
      </div>

      {showCategoryTabs && (
        <FilterSection title="Категория">
          <div className="space-y-1 pr-0.5">
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
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-all",
                pathname === "/catalog" && !categoryQuery
                  ? "bg-site-primary text-white shadow-sm"
                  : "text-slate-700 hover:bg-site-bg",
              )}
            >
              {pathname === "/catalog" && !categoryQuery ? (
                <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              ) : (
                <span className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 leading-snug">Все категории</span>
            </Link>
            {categorySlice.map((cat) => {
              const active = pathname === `/catalog/category/${cat.slug}`;
              return (
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
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-all",
                    active
                      ? "bg-site-primary text-white shadow-sm"
                      : "text-slate-700 hover:bg-site-bg",
                  )}
                >
                  {active ? (
                    <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 leading-snug">{cat.name}</span>
                </Link>
              );
            })}
            {categoryListOverflows && !mustShowAllCategories && (
              <button
                type="button"
                onClick={() => setShowAllCategories((v) => !v)}
                className="mt-0.5 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-site-primary transition hover:bg-site-bg hover:text-site-primary-hover"
                aria-expanded={showAllCategories}
              >
                {showAllCategories ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Свернуть
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Показать ещё ({categories.length - CATEGORY_LIST_PREVIEW})
                  </>
                )}
              </button>
            )}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Марка / модель">
        <FilterSelectMenu
          aria-label="Марка или модель"
          value={activeModel}
          onChange={(v) => setParam("model", v)}
          options={modelOptions}
        />
      </FilterSection>

      {showSubcategoryFilter && (
        <FilterSection title="Подкатегория">
          <div className="space-y-1 rounded-lg border border-site-border bg-site-bg p-1.5">
            <button
              type="button"
              onClick={() => setParam("subcategory", "")}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition",
                !activeSubcategory
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-white/70",
              )}
            >
              {!activeSubcategory ? (
                <Check className="h-4 w-4 shrink-0 text-site-primary" strokeWidth={2.5} aria-hidden />
              ) : (
                <span className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1">Все</span>
            </button>
            {subSlice.map((sub) => {
              const on = activeSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setParam("subcategory", sub.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition",
                    on
                      ? "bg-white font-medium text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/70",
                  )}
                >
                  {on ? (
                    <Check className="h-4 w-4 shrink-0 text-site-primary" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 break-words leading-snug">{sub.name}</span>
                </button>
              );
            })}
            {subListOverflows && !mustShowAllSubcategories && (
              <button
                type="button"
                onClick={() => setShowAllSubcategories((v) => !v)}
                className="mt-0.5 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium text-site-primary transition hover:bg-site-card hover:text-site-primary-hover"
                aria-expanded={showAllSubcategories}
              >
                {showAllSubcategories ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Свернуть
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Показать ещё ({subcategoryOptions.length - SUBCATEGORY_LIST_PREVIEW})
                  </>
                )}
              </button>
            )}
          </div>
        </FilterSection>
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100/90 pt-4 max-[400px]:grid-cols-1">
        <FilterSection title="DN" className="!border-0 !pt-0">
          <FilterSelectMenu
            aria-label="Номинальный диаметр (DN)"
            value={activeDn}
            onChange={(v) => setParam("dn", v)}
            options={dnOptions.map((dn) => ({ value: String(dn), label: `DN${dn}` }))}
            emptyLabel="Все"
          />
        </FilterSection>
        <FilterSection title="PN" className="!border-0 !pt-0">
          <FilterSelectMenu
            aria-label="Номинальное давление (PN)"
            value={activePn}
            onChange={(v) => setParam("pn", v)}
            options={pnOptions.map((pn) => ({ value: String(pn), label: `PN${pn}` }))}
            emptyLabel="Все"
          />
        </FilterSection>
      </div>

      <FilterSection title="Материал">
        <FilterSelectMenu
          aria-label="Материал"
          value={activeMaterial}
          onChange={(v) => setParam("material", v)}
          options={materialOptions}
        />
      </FilterSection>

      {showThreadFilter && (
        <FilterSection title="Резьба">
          <FilterSelectMenu
            aria-label="Резьба"
            value={activeThread}
            onChange={(v) => setParam("thread", v)}
            options={threadOptions.map((t) => ({ value: t, label: t }))}
          />
        </FilterSection>
      )}

      <FilterSection title="Тип соединения">
        <FilterSelectMenu
          aria-label="Тип соединения"
          value={activeConnectionType}
          onChange={(v) => setParam("connectionType", v)}
          options={connectionTypeOptions}
        />
      </FilterSection>

      <FilterSection title="Тип управления">
        <FilterSelectMenu
          aria-label="Тип управления"
          value={activeControlType}
          onChange={(v) => setParam("controlType", v)}
          options={controlTypeOptions}
        />
      </FilterSection>
    </div>
  );
}

type ChipItem = { key: string; label: string; paramKey: string };

function ActiveFilterChips({
  items,
  onRemove,
  onClearAll,
}: {
  items: ChipItem[];
  onRemove: (paramKey: string) => void;
  onClearAll: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-slate-500">Активные фильтры</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 w-fit shrink-0 px-2 text-xs text-slate-600 hover:text-slate-900"
        >
          Сбросить все
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => (
          <span
            key={item.key}
            className="inline-flex max-w-full items-center gap-0.5 rounded-lg border border-slate-200/80 bg-white py-0.5 pl-2.5 pr-0.5 text-xs text-slate-800 shadow-sm"
          >
            <span className="min-w-0 truncate font-medium">{item.label}</span>
            <button
              type="button"
              onClick={() => onRemove(item.paramKey)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={`Сбросить: ${item.label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
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
  const model = searchParams.get("model") ?? "";
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
    out.push({ key: `sub-${sub}`, paramKey: "subcategory", label: `Подкатегория: ${name}` });
  }
  if (dn) out.push({ key: `dn-${dn}`, paramKey: "dn", label: `DN${dn}` });
  if (pn) out.push({ key: `pn-${pn}`, paramKey: "pn", label: `PN${pn}` });
  if (model) out.push({ key: `model-${model}`, paramKey: "model", label: `Марка: ${model}` });
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
  isPending,
  children,
  headerId,
}: {
  isPending: boolean;
  children: ReactNode;
  headerId: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-site-border bg-site-card p-5 shadow-md shadow-slate-900/5",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <h2
        id={headerId}
        className="mb-1 text-sm font-semibold tracking-tight text-slate-900"
      >
        Подбор по параметрам
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">Уточните критерии, результат обновляется в списке ниже</p>
      {children}
    </div>
  );
}

export function CatalogFilters({
  categories,
  subcategoryOptions,
  dnOptions,
  pnOptions,
  modelOptions,
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
  const activeModel = searchParams.get("model") ?? "";
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
      activeModel ||
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
    modelOptions,
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
    activeModel,
    activeThread,
    activeMaterial,
    activeConnectionType,
    activeControlType,
    setParam,
  };

  const activeCount = filterChipItems.length;

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
      <aside className="hidden w-full min-w-0 self-start lg:block" aria-label="Фильтры каталога">
        <FilterPanelCard
          isPending={isPending}
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
              <span className="ml-0.5 rounded-full bg-site-primary px-1.5 py-0.5 text-[0.65rem] text-white">
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
          onClearAll={clearAll}
        />

        {children}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          showCloseButton
          className="flex h-full max-h-dvh !w-full max-w-[min(100vw,22rem)] flex-col gap-0 border-slate-200 p-0 sm:max-w-[22rem] sm:max-h-dvh"
        >
          <SheetHeader className="shrink-0 border-b border-slate-100 px-4 pb-3 pt-2">
            <SheetTitle>Подбор по параметрам</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 min-w-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain px-4 py-4 [scrollbar-width:thin]">
            <div className={cn(isPending && "pointer-events-none opacity-60")}>
              <FilterFormContent {...formProps} searchFieldId={searchIdSheet} />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 sm:flex-col">
            {hasFilters && (
              <Button type="button" variant="secondary" className="w-full" onClick={clearAll}>
                Сбросить все
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
