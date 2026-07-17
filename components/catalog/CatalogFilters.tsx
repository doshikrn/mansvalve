"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { FilterSelectMenu } from "@/components/catalog/FilterSelectMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";
import type { CatalogFacetOption } from "@/lib/catalog-query";
import type { PublicCatalogCategory as Category } from "@/lib/public-catalog";
import { cn } from "@/lib/utils";

type CatalogQuickLink = {
  href: string;
  label: string;
  count: number;
  active?: boolean;
};

interface CatalogFiltersProps {
  categories: Category[];
  subcategoryOptions: CatalogFacetOption[];
  dnOptions: CatalogFacetOption[];
  pnOptions: CatalogFacetOption[];
  modelOptions: CatalogFacetOption[];
  threadOptions: CatalogFacetOption[];
  materialOptions: CatalogFacetOption[];
  connectionTypeOptions: CatalogFacetOption[];
  controlTypeOptions: CatalogFacetOption[];
  quickLinks: CatalogQuickLink[];
  total: number;
  currentPage: number;
  totalPages: number;
  showCategoryTabs?: boolean;
  showSubcategoryFilter?: boolean;
  showThreadFilter?: boolean;
  children: ReactNode;
}

const FACET_PREVIEW_COUNT = 6;
const CATEGORY_PREVIEW_COUNT = 7;
const SORT_OPTIONS = [
  { value: "name", label: "По названию" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className="group border-t border-slate-200 py-4 first:border-t-0 first:pt-0"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-site-ink outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-site-primary/30 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
}

function FacetCheckboxGroup({
  name,
  value,
  options,
  onChange,
  valuePrefix,
}: {
  name: string;
  value: string;
  options: CatalogFacetOption[];
  onChange: (value: string) => void;
  valuePrefix?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const mustExpand = selectedIndex >= FACET_PREVIEW_COUNT;
  const visibleOptions = expanded || mustExpand ? options : options.slice(0, FACET_PREVIEW_COUNT);
  const hasMore = options.length > FACET_PREVIEW_COUNT;

  if (options.length === 0 && !value) return null;

  return (
    <div className="space-y-1.5">
      {visibleOptions.map((option) => {
        const checked = option.value === value;
        const disabled = option.disabled && !checked;
        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors",
              checked ? "bg-blue-50 text-site-ink" : "text-slate-700 hover:bg-slate-50",
              disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(checked ? "" : option.value)}
              className="h-5 w-5 shrink-0 rounded border-slate-300 accent-site-primary focus:ring-2 focus:ring-site-primary/25"
            />
            <span className="min-w-0 flex-1 break-words leading-snug">
              {valuePrefix}
              {stripFacetCount(option.label)}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-slate-400">{option.count}</span>
          </label>
        );
      })}
      {hasMore && !mustExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-h-10 items-center gap-2 px-1.5 text-sm font-semibold text-site-primary transition-colors hover:text-site-primary-hover"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
          {expanded ? "Свернуть" : `Показать ещё (${options.length - FACET_PREVIEW_COUNT})`}
        </button>
      ) : null}
    </div>
  );
}

type FilterFormContentProps = {
  categories: Category[];
  subcategoryOptions: CatalogFacetOption[];
  dnOptions: CatalogFacetOption[];
  pnOptions: CatalogFacetOption[];
  modelOptions: CatalogFacetOption[];
  threadOptions: CatalogFacetOption[];
  materialOptions: CatalogFacetOption[];
  connectionTypeOptions: CatalogFacetOption[];
  controlTypeOptions: CatalogFacetOption[];
  showCategoryTabs: boolean;
  showSubcategoryFilter: boolean;
  showThreadFilter: boolean;
  pathname: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  searchFieldId: string;
  categoryQuery: string;
  activeSubcategory: string;
  activeDn: string;
  activePn: string;
  activeModel: string;
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
}: FilterFormContentProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const activeCategoryIndex = categories.findIndex(
    (category) => pathname === `/catalog/${category.slug}`,
  );
  const mustShowAllCategories = activeCategoryIndex >= CATEGORY_PREVIEW_COUNT;
  const visibleCategories =
    showAllCategories || mustShowAllCategories
      ? categories
      : categories.slice(0, CATEGORY_PREVIEW_COUNT);

  return (
    <div>
      <div className="pb-4">
        <label className="mb-2 block text-xs font-bold uppercase text-slate-500" htmlFor={searchFieldId}>
          Поиск
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id={searchFieldId}
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Название, DN, PN, марка"
            autoComplete="off"
            className="h-11 w-full rounded-md border border-site-border bg-white pl-9 pr-3 text-sm text-site-ink shadow-sm outline-none transition focus:border-site-primary focus:ring-2 focus:ring-site-primary/15"
          />
        </div>
      </div>

      {showCategoryTabs ? (
        <FilterSection title="Категория">
          <div className="space-y-1">
            <Link
              href="/catalog"
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold transition-colors",
                pathname === "/catalog" && !categoryQuery
                  ? "bg-blue-50 text-site-primary"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {pathname === "/catalog" && !categoryQuery ? <Check className="h-4 w-4" /> : null}
              </span>
              Все категории
            </Link>
            {visibleCategories.map((category) => {
              const active = pathname === `/catalog/${category.slug}`;
              return (
                <Link
                  key={category.id}
                  href={`/catalog/${category.slug}`}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-blue-50 text-site-primary"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    {active ? <Check className="h-4 w-4" /> : null}
                  </span>
                  <span className="min-w-0 break-words leading-snug">{category.name}</span>
                </Link>
              );
            })}
            {categories.length > CATEGORY_PREVIEW_COUNT && !mustShowAllCategories ? (
              <button
                type="button"
                onClick={() => setShowAllCategories((current) => !current)}
                className="flex min-h-10 items-center gap-2 px-2 text-sm font-semibold text-site-primary"
                aria-expanded={showAllCategories}
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", showAllCategories && "rotate-180")}
                />
                {showAllCategories ? "Свернуть" : `Показать ещё (${categories.length - CATEGORY_PREVIEW_COUNT})`}
              </button>
            ) : null}
          </div>
        </FilterSection>
      ) : null}

      {showSubcategoryFilter ? (
        <FilterSection title="Подкатегория">
          <FacetCheckboxGroup
            name="subcategory"
            value={activeSubcategory}
            options={subcategoryOptions}
            onChange={(value) => setParam("subcategory", value)}
          />
        </FilterSection>
      ) : null}

      <FilterSection title="Марка / модель">
        <FacetCheckboxGroup
          name="model"
          value={activeModel}
          options={modelOptions}
          onChange={(value) => setParam("model", value)}
        />
      </FilterSection>

      <FilterSection title="DN, мм">
        <FacetCheckboxGroup
          name="dn"
          value={activeDn}
          options={dnOptions}
          onChange={(value) => setParam("dn", value)}
        />
      </FilterSection>

      <FilterSection title="PN, номинальное давление">
        <FacetCheckboxGroup
          name="pn"
          value={activePn}
          options={pnOptions}
          onChange={(value) => setParam("pn", value)}
        />
      </FilterSection>

      {materialOptions.length > 0 || activeMaterial ? (
        <FilterSection title="Материал корпуса">
          <FacetCheckboxGroup
            name="material"
            value={activeMaterial}
            options={materialOptions}
            onChange={(value) => setParam("material", value)}
          />
        </FilterSection>
      ) : null}

      {showThreadFilter ? (
        <FilterSection title="Резьба" defaultOpen={false}>
          <FacetCheckboxGroup
            name="thread"
            value={activeThread}
            options={threadOptions}
            onChange={(value) => setParam("thread", value)}
          />
        </FilterSection>
      ) : null}

      {connectionTypeOptions.length > 0 || activeConnectionType ? (
        <FilterSection title="Тип присоединения">
          <FacetCheckboxGroup
            name="connection"
            value={activeConnectionType}
            options={connectionTypeOptions}
            onChange={(value) => setParam("connection", value)}
          />
        </FilterSection>
      ) : null}

      {controlTypeOptions.length > 0 || activeControlType ? (
        <FilterSection title="Тип управления" defaultOpen={false}>
          <FacetCheckboxGroup
            name="controlType"
            value={activeControlType}
            options={controlTypeOptions}
            onChange={(value) => setParam("controlType", value)}
          />
        </FilterSection>
      ) : null}
    </div>
  );
}

type ChipItem = { key: string; label: string; paramKey: string };

function ActiveFilterChips({
  items,
  onRemove,
  onClearAll,
  compact = false,
}: {
  items: ChipItem[];
  onRemove: (paramKey: string) => void;
  onClearAll: () => void;
  compact?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className={cn("space-y-2", !compact && "mb-4")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-slate-500">Активные фильтры</p>
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-9 shrink-0 text-xs font-semibold text-site-primary hover:text-site-primary-hover"
        >
          Сбросить все
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.key}
            className="inline-flex max-w-full items-center rounded-md border border-blue-200 bg-blue-50 pl-2.5 text-xs font-semibold text-site-ink"
          >
            <span className="max-w-56 truncate py-1.5">{item.label}</span>
            <button
              type="button"
              onClick={() => onRemove(item.paramKey)}
              className="ml-1 flex h-9 w-9 items-center justify-center text-slate-500 hover:text-site-ink"
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

function QuickFilterLinks({ links }: { links: CatalogQuickLink[] }) {
  const visibleLinks = links.filter((link) => link.count > 0 || link.active);
  if (visibleLinks.length === 0) return null;
  return (
    <nav className="mb-4 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Быстрый выбор">
      <div className="flex min-w-max gap-2">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition-colors",
              link.active
                ? "border-site-primary bg-site-primary text-white"
                : "border-site-border bg-white text-slate-700 hover:border-site-primary/55 hover:text-site-primary",
            )}
          >
            {link.label}
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] tabular-nums",
                link.active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {link.count}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ResultsToolbar({
  total,
  currentPage,
  totalPages,
  activeSort,
  activeView,
  isPending,
  setParam,
  goToPage,
}: {
  total: number;
  currentPage: number;
  totalPages: number;
  activeSort: string;
  activeView: "grid" | "list";
  isPending: boolean;
  setParam: (key: string, value: string) => void;
  goToPage: (page: number) => void;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-lg border border-site-border bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        isPending && "opacity-65",
      )}
      role="toolbar"
      aria-label="Настройки выдачи каталога"
    >
      <p className="text-sm text-slate-600">
        Найдено <span className="font-bold tabular-nums text-site-ink">{total}</span> {pluralize(total)}
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="w-[min(100%,13rem)] flex-1 sm:w-52 sm:flex-none">
          <FilterSelectMenu
            aria-label="Сортировка товаров"
            value={activeSort}
            onChange={(value) => setParam("sort", value)}
            options={SORT_OPTIONS}
            emptyLabel="По релевантности"
          />
        </div>

        <div className="flex h-10 shrink-0 rounded-md border border-site-border bg-slate-50 p-1" aria-label="Вид товаров">
          <button
            type="button"
            onClick={() => setParam("view", "")}
            className={cn(
              "flex h-8 w-9 items-center justify-center rounded text-slate-500 transition",
              activeView === "grid" && "bg-white text-site-primary shadow-sm",
            )}
            aria-label="Показать плиткой"
            aria-pressed={activeView === "grid"}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setParam("view", "list")}
            className={cn(
              "flex h-8 w-9 items-center justify-center rounded text-slate-500 transition",
              activeView === "list" && "bg-white text-site-primary shadow-sm",
            )}
            aria-label="Показать списком"
            aria-pressed={activeView === "list"}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {totalPages > 1 ? (
          <div className="flex h-10 shrink-0 items-center rounded-md border border-site-border bg-white">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center text-slate-500 disabled:opacity-30"
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-14 border-x border-site-border px-2 text-center text-xs tabular-nums text-slate-600">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center text-slate-500 disabled:opacity-30"
              aria-label="Следующая страница"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildFilterChipItems(
  searchParams: ReturnType<typeof useSearchParams>,
  categories: Category[],
  subcategoryOptions: CatalogFacetOption[],
  showCategoryTabs: boolean,
  showSubcategoryFilter: boolean,
): ChipItem[] {
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const subcategory = searchParams.get("subcategory") ?? "";
  const dn = searchParams.get("dn") ?? "";
  const pn = searchParams.get("pn") ?? "";
  const model = searchParams.get("model") ?? "";
  const material = searchParams.get("material") ?? "";
  const thread = searchParams.get("thread") ?? "";
  const connection = searchParams.get("connection") ?? searchParams.get("connectionType") ?? "";
  const controlType = searchParams.get("controlType") ?? "";
  const items: ChipItem[] = [];

  if (q) items.push({ key: `q-${q}`, paramKey: "q", label: `Поиск: ${q}` });
  if (showCategoryTabs && category) {
    const label = categories.find((item) => item.id === category)?.name ?? category;
    items.push({ key: `category-${category}`, paramKey: "category", label: `Категория: ${label}` });
  }
  if (showSubcategoryFilter && subcategory) {
    const label = subcategoryOptions.find((item) => item.value === subcategory)?.label ?? subcategory;
    items.push({
      key: `subcategory-${subcategory}`,
      paramKey: "subcategory",
      label: `Подкатегория: ${stripFacetCount(label)}`,
    });
  }
  if (dn) items.push({ key: `dn-${dn}`, paramKey: "dn", label: `DN ${dn}` });
  if (pn) items.push({ key: `pn-${pn}`, paramKey: "pn", label: `PN ${pn}` });
  if (model) items.push({ key: `model-${model}`, paramKey: "model", label: `Модель: ${model}` });
  if (material) items.push({ key: `material-${material}`, paramKey: "material", label: material });
  if (thread) items.push({ key: `thread-${thread}`, paramKey: "thread", label: `Резьба: ${thread}` });
  if (connection) {
    items.push({ key: `connection-${connection}`, paramKey: "connection", label: connection });
  }
  if (controlType) {
    items.push({ key: `control-${controlType}`, paramKey: "controlType", label: controlType });
  }
  return items;
}

function FilterPanelCard({
  isPending,
  hasFilters,
  onClear,
  children,
}: {
  isPending: boolean;
  hasFilters: boolean;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg border border-site-border bg-white p-5 shadow-sm [scrollbar-width:thin]",
        isPending && "pointer-events-none opacity-65",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-site-ink">Фильтры</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Подбор по параметрам оборудования</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="min-h-9 shrink-0 text-xs font-semibold text-site-primary disabled:cursor-not-allowed disabled:text-slate-300"
        >
          Сбросить
        </button>
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
  modelOptions,
  threadOptions,
  materialOptions,
  connectionTypeOptions,
  controlTypeOptions,
  quickLinks,
  total,
  currentPage,
  totalPages,
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
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const searchIdSidebar = useId();
  const searchIdSheet = useId();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDn = searchParams.get("dn") ?? "";
  const activePn = searchParams.get("pn") ?? "";
  const activeThread = searchParams.get("thread") ?? "";
  const activeModel = searchParams.get("model") ?? "";
  const activeMaterial = searchParams.get("material") ?? "";
  const activeSubcategory = searchParams.get("subcategory") ?? "";
  const activeConnectionType = searchParams.get("connection") ?? searchParams.get("connectionType") ?? "";
  const activeControlType = searchParams.get("controlType") ?? "";
  const activeQ = searchParams.get("q") ?? "";
  const categoryQuery = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "";
  const activeView = searchParams.get("view") === "list" ? "list" : "grid";

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
      if (value) next.set(key, value);
      else next.delete(key);
      if (key === "connection") next.delete("connectionType");
      if (key !== "view") next.delete("page");
      const query = next.toString();
      startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      const next = new URLSearchParams(searchParams.toString());
      if (page > 1) next.set("page", String(page));
      else next.delete("page");
      const query = next.toString();
      startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
    },
    [currentPage, pathname, router, searchParams, totalPages],
  );

  const removeParam = useCallback(
    (key: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete(key);
      if (key === "connection") next.delete("connectionType");
      next.delete("page");
      const query = next.toString();
      startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  const clearAll = useCallback(() => {
    setSearchInput("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  useEffect(() => {
    if (searchInput === activeQ) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const queryValue = searchInput.trim();
      const pageContext = getPageAnalyticsContext(pathname);
      trackEvent("catalog_search", {
        source: "catalog-filters",
        category: pageContext.category,
        query: queryValue,
      });
      const next = new URLSearchParams(searchParams.toString());
      if (queryValue) next.set("q", queryValue);
      else next.delete("q");
      next.delete("page");
      const query = next.toString();
      startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // URL state is intentionally updated only when the local search field changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(activeQ);
  }, [activeQ]);

  const filterChipItems = buildFilterChipItems(
    searchParams,
    categories,
    subcategoryOptions,
    showCategoryTabs,
    showSubcategoryFilter,
  );
  const hasFilters = filterChipItems.length > 0;

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

  return (
    <div>
      <QuickFilterLinks links={quickLinks} />

      <div className="lg:grid lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="sticky top-24 hidden min-w-0 self-start lg:block" aria-label="Фильтры каталога">
          <FilterPanelCard isPending={isPending} hasFilters={hasFilters} onClear={clearAll}>
            <FilterFormContent {...formProps} searchFieldId={searchIdSidebar} />
          </FilterPanelCard>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-center gap-2 bg-white"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
              {filterChipItems.length > 0 ? (
                <span className="rounded-full bg-site-primary px-2 py-0.5 text-[11px] text-white">
                  {filterChipItems.length}
                </span>
              ) : null}
            </Button>
          </div>

          <ResultsToolbar
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            activeSort={activeSort}
            activeView={activeView}
            isPending={isPending}
            setParam={setParam}
            goToPage={goToPage}
          />

          <ActiveFilterChips items={filterChipItems} onRemove={removeParam} onClearAll={clearAll} />
          <div className={cn(isPending && "opacity-65 transition-opacity")}>{children}</div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          showCloseButton
          className="flex h-full max-h-dvh !w-full max-w-[min(100vw,24rem)] flex-col gap-0 border-slate-200 p-0 sm:max-w-96"
        >
          <SheetHeader className="shrink-0 border-b border-slate-200 px-4 pb-3 pt-3">
            <SheetTitle>Фильтры каталога</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
            <ActiveFilterChips
              items={filterChipItems}
              onRemove={removeParam}
              onClearAll={clearAll}
              compact
            />
            <div className={cn(filterChipItems.length > 0 && "mt-5", isPending && "opacity-65")}>
              <FilterFormContent {...formProps} searchFieldId={searchIdSheet} />
            </div>
          </div>
          <SheetFooter className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-200 bg-white p-4 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={clearAll} disabled={!hasFilters}>
              Сбросить
            </Button>
            <Button type="button" onClick={() => setSheetOpen(false)}>
              Показать {total}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function stripFacetCount(label: string): string {
  return label.replace(/\s+\(\d+\)$/, "").trim();
}

function pluralize(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "позиция";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "позиции";
  return "позиций";
}
