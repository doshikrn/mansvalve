import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listProducts } from "@/lib/services/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    active?: string;
  }>;
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

  const { items, total } = await listProducts({
    search: params.q,
    page,
    pageSize: PAGE_SIZE,
    isActive: activeFilter,
  });

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Товары</h1>
          <p className="text-sm text-muted-foreground">Всего: {total}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/products/new">+ Новый товар</Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-2" role="search">
        <input
          type="text"
          name="q"
          placeholder="Поиск по названию, slug, модели…"
          defaultValue={params.q ?? ""}
          className="h-8 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
        />
        <select
          name="active"
          defaultValue={params.active ?? ""}
          className="h-8 rounded-md border border-border bg-background px-2 text-sm outline-none"
        >
          <option value="">Все</option>
          <option value="true">Только активные</option>
          <option value="false">Только скрытые</option>
        </select>
        <Button type="submit" size="sm" variant="outline">
          Применить
        </Button>
      </form>

      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Товары не найдены.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.name}
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
                      <Button asChild size="xs" variant="outline">
                        <Link href={`/admin/products/${p.id}`}>Открыть</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 ? (
        <Pagination
          basePath="/admin/products"
          page={page}
          lastPage={lastPage}
          query={params}
        />
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
  basePath,
  page,
  lastPage,
  query,
}: {
  basePath: string;
  page: number;
  lastPage: number;
  query: Record<string, string | undefined>;
}) {
  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (query.q) sp.set("q", query.q);
    if (query.active) sp.set("active", query.active);
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

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
