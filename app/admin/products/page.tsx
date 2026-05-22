import Link from "next/link";
import { Suspense } from "react";
import { ImageIcon } from "lucide-react";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { ProductsListSearchInput } from "@/components/admin/ProductsListSearchInput";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { PublicCatalogSourceNotice } from "@/components/admin/PublicCatalogSourceNotice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { withReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { isDatabaseConfigured } from "@/lib/db/client";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";
import { listProducts, type ProductListOptions } from "@/lib/services/products";

import { deleteProductAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type ListParams = {
  q?: string;
  page?: string;
  active?: string;
  categoryId?: string;
  subcategoryId?: string;
  order?: string;
  dir?: string;
  msg?: string;
  error?: string;
};

type ListQueryInput = {
  q?: string;
  active?: string;
  categoryId?: string;
  subcategoryId?: string;
  order?: string;
  dir?: string;
  page?: number;
};

function parseOrder(
  order?: string,
  dir?: string,
): Pick<ProductListOptions, "orderBy" | "orderDir"> {
  const orderBy: NonNullable<ProductListOptions["orderBy"]> =
    order === "name" || order === "createdAt" || order === "sortOrder"
      ? order
      : "updatedAt";
  const orderDir: NonNullable<ProductListOptions["orderDir"]> =
    dir === "asc" ? "asc" : "desc";
  return { orderBy, orderDir };
}

function buildProductsListQuery(
  p: ListQueryInput,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  if (p.q?.trim()) out.q = p.q.trim();
  if (p.active === "true" || p.active === "false") out.active = p.active;
  if (p.categoryId?.trim()) out.categoryId = p.categoryId.trim();
  if (p.subcategoryId?.trim()) out.subcategoryId = p.subcategoryId.trim();
  if (p.order && p.order !== "updatedAt") out.order = p.order;
  if (p.dir === "asc") out.dir = p.dir;
  if (p.page && p.page > 1) out.page = String(p.page);
  return out;
}

function productsListHref(query: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v != null && v !== "") sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  await requireAdmin("/admin/products");
  const params = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <EmptyState message="База данных не настроена. Задайте DATABASE_URL и примените миграции." />
    );
  }

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const activeFilter =
    params.active === "true"
      ? true
      : params.active === "false"
        ? false
        : undefined;

  const rawCat = params.categoryId ? Number(params.categoryId) : NaN;
  const rawSub = params.subcategoryId ? Number(params.subcategoryId) : NaN;
  const categoryId =
    Number.isInteger(rawCat) && rawCat > 0 ? rawCat : undefined;
  const subcategoryId =
    Number.isInteger(rawSub) && rawSub > 0 ? rawSub : undefined;

  const { orderBy, orderDir } = parseOrder(params.order, params.dir);

  const [categories, { items, total }] = await Promise.all([
    listCategoriesWithSubcategories(),
    listProducts({
      search: params.q,
      page,
      pageSize: PAGE_SIZE,
      isActive: activeFilter,
      categoryId,
      subcategoryId,
      orderBy,
      orderDir,
    }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const listQuery = buildProductsListQuery({
    q: params.q,
    active: params.active,
    categoryId: params.categoryId,
    subcategoryId: params.subcategoryId,
    order: params.order,
    dir: params.dir,
    page: page > 1 ? page : undefined,
  });
  const listSelfHref = productsListHref(listQuery);
  const encodedReturnTo = encodeURIComponent(listSelfHref);

  const hasFilters = Boolean(
    params.q?.trim() ||
      activeFilter !== undefined ||
      categoryId ||
      subcategoryId ||
      (params.order && params.order !== "updatedAt") ||
      params.dir === "asc",
  );

  const subcategoryOptions = categories.flatMap((c) =>
    c.subcategories.map((s) => ({
      id: s.id,
      label: `${c.name} — ${s.name}`,
      categoryId: c.id,
    })),
  );

  return (
    <div className="space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Товары" },
        ]}
      />
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Товары</h1>
          <p className="text-sm text-muted-foreground">Всего: {total}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/products/series">Серии и шаблоны</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="/admin/products/import/template" download>
              Скачать шаблон
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/products/import">Импорт из Excel</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={withReturnTo("/admin/products/new", listSelfHref)}>
              + Новый товар
            </Link>
          </Button>
        </div>
      </div>

      <PublicCatalogSourceNotice />

      <p className="text-xs text-muted-foreground">
        Фильтры и поиск хранятся в адресной строке: можно вернуться назад в браузере, обновить
        страницу или отправить ссылку коллеге.
      </p>

      {params.error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          role="alert"
        >
          {params.error}
        </div>
      ) : null}
      {params.msg ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {params.msg}
        </div>
      ) : null}

      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:flex-wrap sm:items-end"
        method="get"
        role="search"
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="flex min-w-[180px] flex-col gap-1 text-xs font-medium text-muted-foreground lg:col-span-2">
            Поиск
            <Suspense
              fallback={
                <input
                  type="search"
                  name="q"
                  placeholder="Название, ссылка, модель…"
                  defaultValue={params.q ?? ""}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
                />
              }
            >
              <ProductsListSearchInput
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Название, ссылка, модель…"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
              />
            </Suspense>
          </label>
          <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            Категория
            <select
              name="categoryId"
              defaultValue={categoryId ? String(categoryId) : ""}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none"
            >
              <option value="">Все</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[200px] flex-col gap-1 text-xs font-medium text-muted-foreground lg:col-span-2">
            Подкатегория
            <select
              name="subcategoryId"
              defaultValue={subcategoryId ? String(subcategoryId) : ""}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none"
            >
              <option value="">Все</option>
              {subcategoryOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[120px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            Статус
            <select
              name="active"
              defaultValue={params.active ?? ""}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none"
            >
              <option value="">Все</option>
              <option value="true">Только активные</option>
              <option value="false">Только скрытые</option>
            </select>
          </label>
          <label className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            Сортировка
            <select
              name="order"
              defaultValue={orderBy}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none"
            >
              <option value="updatedAt">По обновлению</option>
              <option value="createdAt">По созданию</option>
              <option value="name">По названию</option>
              <option value="sortOrder">По порядку</option>
            </select>
          </label>
          <label className="flex min-w-[120px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            Направление
            <select
              name="dir"
              defaultValue={orderDir}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none"
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Button type="submit" size="sm" variant="outline">
            Применить
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/products">Сбросить</Link>
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="w-14 px-2 py-2 font-medium">№</th>
                <th className="w-16 px-2 py-2 font-medium">Фото</th>
                <th className="px-4 py-2 font-medium">Название</th>
                <th className="px-4 py-2 font-medium">Категория</th>
                <th className="px-4 py-2 font-medium">DN/PN</th>
                <th className="px-4 py-2 font-medium">Цена</th>
                <th className="px-4 py-2 font-medium">Статус</th>
                <th className="px-4 py-2 font-medium">Обновлён</th>
                <th className="px-4 py-2 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {hasFilters ? (
                      <span>
                        Ничего не найдено по текущим фильтрам. Попробуйте изменить
                        поиск или{" "}
                        <Link href="/admin/products" className="text-primary underline">
                          сбросить фильтры
                        </Link>
                        .
                      </span>
                    ) : (
                      "Товаров пока нет."
                    )}
                  </td>
                </tr>
              ) : (
                items.map((p, idx) => {
                  const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                  const displayName = formatProductDisplayName(p);
                  const photoTitle =
                    p.imageCount === 0
                      ? "Нет фото в карточке"
                      : `Фото в карточке: ${p.imageCount}. Превью — главное по галерее (флажок «основное» и порядок).`;
                  return (
                  <tr
                    key={p.id}
                    className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
                  >
                    <td className="px-2 py-2 align-top tabular-nums">
                      <span className="text-sm font-semibold text-slate-800">{rowNum}</span>
                      <div className="text-[10px] leading-tight text-muted-foreground">id {p.id}</div>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div
                        className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E2E8F0] bg-slate-50"
                        title={photoTitle}
                      >
                        {p.listThumbUrl ? (
                          <ProductImageFrame
                            src={p.listThumbUrl}
                            alt={displayName}
                            sizes="44px"
                            className="h-full w-full rounded-none"
                            safeAreaClassName="p-1"
                            unoptimized={mediaImageNeedsUnoptimized(p.listThumbUrl)}
                          />
                        ) : (
                          <ImageIcon className="size-5 text-slate-300" aria-hidden />
                        )}
                      </div>
                      {p.imageCount > 1 ? (
                        <div className="mt-0.5 text-center text-[10px] font-medium tabular-nums text-muted-foreground">
                          ×{p.imageCount}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/products/${p.id}?returnTo=${encodedReturnTo}`}
                        className="font-medium hover:underline"
                      >
                        {displayName}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {p.slug}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {p.categoryName}
                      {p.subcategoryName ? ` · ${p.subcategoryName}` : ""}
                    </td>
                    <td className="px-4 py-2 text-xs tabular-nums">
                      {p.dn ?? "—"} / {p.pn ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {p.priceByRequest || p.price == null
                        ? "По запросу"
                        : `${Number(p.price).toLocaleString("ru-RU")} ₸`}
                    </td>
                    <td className="px-4 py-2">
                      {p.isActive ? (
                        <Badge variant="secondary">активен</Badge>
                      ) : (
                        <Badge variant="outline">скрыт</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {p.updatedAt instanceof Date
                        ? p.updatedAt.toLocaleDateString("ru-RU")
                        : String(p.updatedAt)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="xs" variant="outline">
                          <Link
                            href={`/admin/products/${p.id}?returnTo=${encodedReturnTo}`}
                          >
                            Открыть
                          </Link>
                        </Button>
                        <DestructiveConfirmForm
                          action={deleteProductAction.bind(null, p.id)}
                          confirmMessage="Удалить товар окончательно? Товар исчезнет с сайта, из поиска, sitemap и витрины. Действие нельзя отменить."
                        >
                          <input type="hidden" name="returnTo" value={listSelfHref} />
                          <Button type="submit" size="xs" variant="destructive">
                            Удалить
                          </Button>
                        </DestructiveConfirmForm>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 ? (
        <Pagination page={page} lastPage={lastPage} query={listQuery} />
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function Pagination({
  page,
  lastPage,
  query,
}: {
  page: number;
  lastPage: number;
  query: Record<string, string | undefined>;
}) {
  const buildHref = (p: number) =>
    productsListHref({
      ...query,
      page: p > 1 ? String(p) : undefined,
    });

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground">
        Страница {page} из {lastPage}
      </div>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild size="sm" variant="outline">
            <Link href={buildHref(page - 1)}>← Назад</Link>
          </Button>
        ) : null}
        {page < lastPage ? (
          <Button asChild size="sm" variant="outline">
            <Link href={buildHref(page + 1)}>Вперёд →</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
