import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { withReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CategoriesView = "categories" | "subcategories";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const params = await searchParams;
  const view: CategoriesView = params.view === "subcategories" ? "subcategories" : "categories";

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const categories = await listCategoriesWithSubcategories();

  const listReturn = `/admin/categories?view=${view}`;
  const encList = encodeURIComponent(listReturn);

  return (
    <div className="space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Категории" },
        ]}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">
            {view === "categories" ? "Категории" : "Подкатегории"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {view === "categories"
              ? "Редактирование главных разделов каталога: SEO, порядок, slug и статус."
              : "Редактирование подкатегорий внутри главных разделов каталога."}
          </p>
        </header>
        {view === "categories" ? (
          <Button asChild size="sm">
            <Link href={withReturnTo("/admin/categories/new", listReturn)}>
              + Новая категория
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
        <Link
          href="/admin/categories?view=categories"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            view === "categories" ? "bg-blue-50 text-[#1D4ED8]" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Категории
        </Link>
        <Link
          href="/admin/categories?view=subcategories"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            view === "subcategories" ? "bg-blue-50 text-[#1D4ED8]" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Подкатегории
        </Link>
      </div>

      {view === "categories" ? (
        <CategoriesTable categories={categories} listReturnEncoded={encList} />
      ) : (
        <SubcategoriesTable categories={categories} listReturnEncoded={encList} />
      )}
    </div>
  );
}

function CategoriesTable({
  categories,
  listReturnEncoded,
}: {
  categories: Awaited<ReturnType<typeof listCategoriesWithSubcategories>>;
  listReturnEncoded: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2">Порядок</th>
              <th className="px-4 py-2">Категория</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Статус</th>
              <th className="px-4 py-2 font-medium">Подкатегории</th>
              <th className="px-4 py-2 w-24" />
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Категории не найдены. Запустите <code>npm run db:import-catalog</code>.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
                >
                  <td className="px-4 py-2 tabular-nums text-muted-foreground">{c.sortOrder}</td>
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-2">
                    {c.isActive ? (
                      <Badge variant="secondary">активна</Badge>
                    ) : (
                      <Badge variant="outline">скрыта</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {c.subcategories.length
                      ? `${c.subcategories.length}: ${c.subcategories.map((s) => s.name).join(", ")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/categories/${c.id}/edit?returnTo=${listReturnEncoded}`}>
                        Изменить
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
}

function SubcategoriesTable({
  categories,
  listReturnEncoded,
}: {
  categories: Awaited<ReturnType<typeof listCategoriesWithSubcategories>>;
  listReturnEncoded: string;
}) {
  const subcategoryCount = categories.reduce((count, category) => count + category.subcategories.length, 0);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2">Порядок</th>
            <th className="px-4 py-2">Подкатегория</th>
            <th className="px-4 py-2">Категория</th>
            <th className="px-4 py-2">Slug</th>
            <th className="px-4 py-2">Статус</th>
            <th className="w-48 px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {subcategoryCount === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Подкатегории не найдены.
              </td>
            </tr>
          ) : (
            categories.flatMap((category) =>
              category.subcategories.map((subcategory) => (
                <tr
                  key={subcategory.id}
                  className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
                >
                  <td className="px-4 py-2 tabular-nums text-muted-foreground">{subcategory.sortOrder}</td>
                  <td className="px-4 py-2 font-medium">{subcategory.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{category.name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{subcategory.slug}</td>
                  <td className="px-4 py-2">
                    {subcategory.isActive ? (
                      <Badge variant="secondary">активна</Badge>
                    ) : (
                      <Badge variant="outline">скрыта</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/categories/${category.id}/subcategories/${subcategory.id}/edit?returnTo=${listReturnEncoded}`}
                        >
                          Изменить
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )),
            )
          )}
        </tbody>
      </table>
      <div className="border-t border-[#E2E8F0] px-4 py-3 text-xs text-slate-500">
        Новая подкатегория создаётся внутри нужной категории: откройте категорию и нажмите «Добавить подкатегорию».
      </div>
    </div>
  );
}
