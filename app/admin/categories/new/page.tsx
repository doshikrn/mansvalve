import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminNameSlugFields } from "@/components/admin/AdminNameSlugFields";
import { AdminStickyActions } from "@/components/admin/AdminStickyActions";
import { AdminUnsavedChangesGuard } from "@/components/admin/AdminUnsavedChangesGuard";
import { CategorySeoFields } from "@/components/admin/CategorySeoFields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getNextCategorySortOrder } from "@/lib/services/categories";

import { createCategoryAction } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const sp = await searchParams;
  const listHref = safeReturnTo(sp.returnTo, "/admin/categories");

  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">База данных не настроена.</p>;
  }

  const nextSort = await getNextCategorySortOrder();
  const emptySeo = {
    topSeo: "",
    trustLines: "",
    bottomSeo: "",
    ctaHeading: "",
    ctaDescription: "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Категории", href: listHref },
          { label: "Новая категория" },
        ]}
      />

      {sp.error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sp.error}
        </p>
      ) : null}

      <AdminUnsavedChangesGuard>
        <form
          id="admin-new-category-form"
          action={createCategoryAction}
          className="space-y-4 rounded-xl border border-border bg-background p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminNameSlugFields
              nameLabel="Название"
              slugLabel="Ссылка раздела"
              slugRequired={false}
              slugPlaceholder="Оставьте пустым — сгенерируется из названия"
              nameContainerClassName="space-y-2 sm:col-span-2"
              slugContainerClassName="space-y-2"
            />
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки</Label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={nextSort}
                min={0}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание / вводный текст</Label>
            <Textarea id="description" name="description" rows={4} className="text-sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoMetaDescription">SEO description (meta)</Label>
            <Textarea
              id="seoMetaDescription"
              name="seoMetaDescription"
              rows={3}
              placeholder="Краткое описание для поисковиков; если пусто — соберётся автоматически на публичной странице."
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">URL изображения героя (из медиатеки)</Label>
            <input
              id="heroImageUrl"
              name="heroImageUrl"
              type="url"
              placeholder="https://…"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="rounded border-input" />
            Опубликована (активна)
          </label>

          <CategorySeoFields defaults={emptySeo} />
        </form>

        <AdminStickyActions backHref={listHref} backLabel="К списку">
          <Button type="submit" form="admin-new-category-form" size="sm">
            Создать
          </Button>
        </AdminStickyActions>
      </AdminUnsavedChangesGuard>
    </div>
  );
}
