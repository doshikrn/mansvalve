import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categories");

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const categories = await listCategoriesWithSubcategories();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Категории</h1>
          <p className="text-sm text-muted-foreground">
            Редактирование SEO, порядка и подкатегорий. Публичный каталог подхватывает
            данные из БД при включённом режиме; статический fallback сохраняется.
          </p>
        </header>
        <Button asChild size="sm">
          <Link href="/admin/categories/new">+ Новая категория</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Порядок</th>
              <th className="px-4 py-2 font-medium">Категория</th>
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
                <tr key={c.id} className="border-b border-border last:border-0">
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
                      <Link href={`/admin/categories/${c.id}/edit`}>Изменить</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
