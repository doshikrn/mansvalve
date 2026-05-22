import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { PublicCatalogSourceNotice } from "@/components/admin/PublicCatalogSourceNotice";
import { ProductsImportClient } from "@/components/admin/ProductsImportClient";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { IMPORT_COLUMNS, MAX_IMPORT_ROWS } from "@/lib/products-import/columns";

import { applyProductsImportAction, previewProductsImportAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProductsImportPage() {
  await requireAdmin("/admin/products/import");

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        База данных не настроена. Импорт недоступен.
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Товары", href: "/admin/products" },
          { label: "Импорт из Excel" },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Импорт товаров из Excel</h1>
          <p className="text-sm text-muted-foreground">
            Скачайте шаблон, заполните до {MAX_IMPORT_ROWS} строк и загрузите файл. Перед записью
            появится превью с действиями, slug и SEO.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/admin/products/import/template" download>
              Скачать Excel-шаблон
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/products">К списку товаров</Link>
          </Button>
        </div>
      </div>

      <PublicCatalogSourceNotice />

      <section className="space-y-3 rounded-xl border border-border bg-background p-4 text-sm">
        <h2 className="text-base font-semibold">Что попадает в импорт</h2>
        <ul className="grid gap-1 md:grid-cols-2">
          {IMPORT_COLUMNS.map((column) => (
            <li key={column.key} className="text-muted-foreground">
              <span className="font-medium text-foreground">{column.header}</span>
              {column.required ? <span className="text-destructive"> *</span> : null}
              {" — "}
              {column.description}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Slug формируется автоматически из модели и DN/PN (например, <code>19s38nzh-dn50-pn16</code>).
          SEO title и description берутся из <code>buildPublicProductView()</code> — отдельный SEO
          билдер не дублируем.
        </p>
      </section>

      <ProductsImportClient
        previewAction={previewProductsImportAction}
        applyAction={applyProductsImportAction}
      />
    </div>
  );
}
