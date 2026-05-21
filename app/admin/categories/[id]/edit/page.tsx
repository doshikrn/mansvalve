import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminStickyActions } from "@/components/admin/AdminStickyActions";
import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminUnsavedChangesGuard } from "@/components/admin/AdminUnsavedChangesGuard";
import { CategorySeoFields } from "@/components/admin/CategorySeoFields";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { categorySeoToFormDefaults, getCategoryWithSubcategoriesById } from "@/lib/services/categories";

import { deleteCategoryAction, updateCategoryAction } from "../../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; msg?: string; returnTo?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const sp = await searchParams;
  const listHref = safeReturnTo(sp.returnTo, "/admin/categories");
  const editBase = `/admin/categories/${id}/edit`;
  const editSelfHref = sp.returnTo
    ? `${editBase}?returnTo=${encodeURIComponent(sp.returnTo)}`
    : editBase;

  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">База данных не настроена.</p>;
  }

  const category = await getCategoryWithSubcategoriesById(id);
  if (!category) notFound();

  const seoDefaults = categorySeoToFormDefaults(category.seoContent);
  const warnings = [
    !category.name.trim() ? "Название категории пустое." : null,
    !category.slug.trim() ? "Slug пустой: публичная страница категории не откроется." : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Категории", href: listHref },
          { label: category.name },
        ]}
      />
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Категория: {category.name}</h1>
        <p className="text-sm text-muted-foreground">
          id={category.id} · slug публичного URL: <code className="text-xs">{category.slug}</code>
        </p>
      </div>

      {sp.error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sp.error}
        </p>
      ) : null}
      {sp.saved === "1" ? (
        <AdminInlineNotice tone="manual">
          Изменения сохранены. Публичный сайт может обновиться в течение нескольких минут.
        </AdminInlineNotice>
      ) : null}
      {sp.msg ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {sp.msg}
        </p>
      ) : null}
      {warnings.length ? (
        <AdminInlineNotice tone="auto">
          <p className="font-semibold">Проверьте категорию</p>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </AdminInlineNotice>
      ) : null}

      <AdminUnsavedChangesGuard>
        <form
          id="admin-category-form"
          action={updateCategoryAction}
          className="space-y-4 rounded-xl border border-border bg-background p-4"
        >
          <input type="hidden" name="id" value={category.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Название <AdminStatusBadge tone="manual" /></Label>
              <input
                id="name"
                name="name"
                required
                defaultValue={category.name}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug <AdminStatusBadge tone="manual" /></Label>
              <input
                id="slug"
                name="slug"
                defaultValue={category.slug}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки <AdminStatusBadge tone="manual" /></Label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={category.sortOrder}
                min={0}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание / вводный текст</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={category.description ?? ""}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoMetaDescription">SEO description (meta) <AdminStatusBadge tone="manual" /></Label>
            <Textarea
              id="seoMetaDescription"
              name="seoMetaDescription"
              rows={3}
              defaultValue={category.seoMetaDescription ?? ""}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">URL изображения героя</Label>
            <input
              id="heroImageUrl"
              name="heroImageUrl"
              type="url"
              defaultValue={category.heroImageUrl ?? ""}
              placeholder="https://…"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.isActive}
              className="rounded border-input"
            />
            Опубликована (активна)
          </label>

          <CategorySeoFields defaults={seoDefaults} />
        </form>

        <AdminStickyActions backHref={listHref} backLabel="К списку категорий">
          <Button type="submit" form="admin-category-form" size="sm">
            Сохранить категорию
          </Button>
        </AdminStickyActions>
      </AdminUnsavedChangesGuard>

      <section className="space-y-3 rounded-xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Подкатегории
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link
              href={`/admin/categories/${id}/subcategories/new?returnTo=${encodeURIComponent(editSelfHref)}`}
            >
              + Подкатегория
            </Link>
          </Button>
        </div>
        {category.subcategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет подкатегорий.</p>
        ) : (
          <ul className="divide-y divide-border">
            {category.subcategories.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <span className="font-medium">{s.name}</span>{" "}
                  <span className="text-xs text-muted-foreground font-mono">{s.slug}</span>
                  {s.isActive ? null : (
                    <Badge variant="outline" className="ml-2">
                      скрыта
                    </Badge>
                  )}
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href={`/admin/categories/${id}/subcategories/${s.id}/edit?returnTo=${encodeURIComponent(editSelfHref)}`}
                  >
                    Изменить
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
        <div>
          <h2 className="text-sm font-semibold text-red-950">Опасная зона</h2>
          <p className="mt-1 text-sm text-red-900">
            Категорию можно удалить только если в ней нет товаров и подкатегорий.
            Slug и старый публичный URL после удаления перестанут открываться.
          </p>
        </div>
        <DestructiveConfirmForm
          action={deleteCategoryAction}
          confirmMessage={`Удалить категорию «${category.name}» окончательно? Это можно сделать только если в ней нет товаров и подкатегорий.`}
          title="Удаление категории"
          details={
            <>
              Будет удалена категория <strong>{category.name}</strong> (`{category.slug}`).
              Удаление заблокируется, если внутри есть товары или подкатегории.
              Сейчас подкатегорий: {category.subcategories.length}.
            </>
          }
        >
          <input type="hidden" name="id" value={String(category.id)} />
          <input type="hidden" name="returnTo" value={listHref} />
          <Button type="submit" variant="destructive" size="sm">
            Удалить категорию
          </Button>
        </DestructiveConfirmForm>
      </section>
    </div>
  );
}
