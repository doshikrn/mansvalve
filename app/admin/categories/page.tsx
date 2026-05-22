import Link from "next/link";
import { Suspense } from "react";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { CategoryOrderScrollRestore } from "@/components/admin/CategoryOrderScrollRestore";
import {
  CategoriesOrderTable,
  SubcategoriesOrderTable,
} from "@/components/admin/CatalogTaxonomyOrderTables";
import { Button } from "@/components/ui/button";
import { withReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CategoriesView = "categories" | "subcategories";

const MSG_COPY: Record<string, string> = {
  category_moved: "Порядок категорий обновлён (swap sort_order с соседом).",
  category_sort_saved: "Порядок категории сохранён.",
  subcategory_moved: "Порядок подкатегории внутри категории обновлён.",
  subcategory_sort_saved: "Порядок подкатегории сохранён.",
  category_deleted: "Категория удалена.",
  subcategory_deleted: "Подкатегория удалена.",
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; msg?: string; error?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const params = await searchParams;
  const view: CategoriesView = params.view === "subcategories" ? "subcategories" : "categories";
  const flash = params.msg ? MSG_COPY[params.msg] ?? params.msg : null;
  const error = params.error?.trim() || null;

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
              ? "Порядок влияет на публичный каталог и блок категорий на главной. Меняйте ↑↓ или введите sort_order и нажмите OK — без отдельной страницы."
              : "Порядок подкатегорий задаётся внутри каждой категории: стрелки меняют позицию только среди соседей с тем же родителем."}
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

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {flash ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {flash}
        </div>
      ) : null}

      <Suspense fallback={null}>
        <CategoryOrderScrollRestore />
      </Suspense>

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
        <CategoriesOrderTable categories={categories} listReturnEncoded={encList} listView={view} />
      ) : (
        <SubcategoriesOrderTable categories={categories} listReturnEncoded={encList} listView={view} />
      )}
    </div>
  );
}
