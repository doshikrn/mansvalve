import { notFound } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminNameSlugFields } from "@/components/admin/AdminNameSlugFields";
import { AdminStickyActions } from "@/components/admin/AdminStickyActions";
import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminUnsavedChangesGuard } from "@/components/admin/AdminUnsavedChangesGuard";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getCategoryById, getSubcategoryById } from "@/lib/services/categories";

import { deleteSubcategoryAction, updateSubcategoryAction } from "../../../../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditSubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; subId: string }>;
  searchParams: Promise<{ error?: string; saved?: string; msg?: string; returnTo?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const { id: rawCat, subId: rawSub } = await params;
  const categoryId = Number(rawCat);
  const subId = Number(rawSub);
  if (!Number.isFinite(categoryId) || !Number.isFinite(subId)) notFound();

  const sp = await searchParams;
  const backHref = safeReturnTo(sp.returnTo, `/admin/categories/${categoryId}/edit`);

  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">База данных не настроена.</p>;
  }

  const [parent, sub] = await Promise.all([getCategoryById(categoryId), getSubcategoryById(subId)]);
  if (!parent || !sub || sub.categoryId !== categoryId) notFound();
  const warnings = [
    !sub.name.trim() ? "Название подкатегории пустое." : null,
    !sub.slug.trim()
      ? "Ссылка подраздела пустая: страница в каталоге не откроется."
      : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Категории", href: "/admin/categories" },
          {
            label: parent.name,
            href: `/admin/categories/${categoryId}/edit`,
          },
          { label: sub.name },
        ]}
      />
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{sub.name}</h1>
        <p className="text-sm text-muted-foreground">
          Категория: {parent.name} · ссылка: <code className="text-xs">{sub.slug}</code>
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
          <p className="font-semibold">Проверьте подкатегорию</p>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </AdminInlineNotice>
      ) : null}

      <AdminUnsavedChangesGuard>
        <form
          id="admin-subcategory-form"
          action={updateSubcategoryAction}
          className="space-y-4 rounded-xl border border-border bg-background p-4"
        >
          <input type="hidden" name="id" value={sub.id} />
          <input type="hidden" name="categoryId" value={categoryId} />

          <AdminNameSlugFields
            initialName={sub.name}
            initialSlug={sub.slug}
            nameLabel={
              <>
                Название <AdminStatusBadge tone="manual" />
              </>
            }
            slugLabel={
              <>
                Ссылка подраздела <AdminStatusBadge tone="auto" />
              </>
            }
          />
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Порядок сортировки <AdminStatusBadge tone="manual" /></Label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={sub.sortOrder}
              min={0}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание / SEO-текст</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={sub.description ?? ""}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoMetaDescription">SEO description (meta) <AdminStatusBadge tone="manual" /></Label>
            <Textarea
              id="seoMetaDescription"
              name="seoMetaDescription"
              rows={2}
              defaultValue={sub.seoMetaDescription ?? ""}
              className="text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={sub.isActive}
              className="rounded border-input"
            />
            Активна
          </label>
        </form>

        <AdminStickyActions backHref={backHref} backLabel="Назад">
          <Button type="submit" form="admin-subcategory-form" size="sm">
            Сохранить
          </Button>
        </AdminStickyActions>
      </AdminUnsavedChangesGuard>

      <section className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
        <div>
          <h2 className="text-sm font-semibold text-red-950">Опасная зона</h2>
          <p className="mt-1 text-sm text-red-900">
            Подкатегорию можно удалить только если в ней нет товаров. Старый публичный URL после удаления перестанет открываться.
          </p>
        </div>
        <DestructiveConfirmForm
          action={deleteSubcategoryAction}
          confirmMessage={`Удалить подкатегорию «${sub.name}» окончательно? Это можно сделать только если в ней нет товаров.`}
          title="Удаление подкатегории"
          details={
            <>
              Будет удалена подкатегория <strong>{sub.name}</strong> (`{sub.slug}`) в категории{" "}
              <strong>{parent.name}</strong>. Если к ней привязаны товары, удаление будет заблокировано.
            </>
          }
        >
          <input type="hidden" name="id" value={String(sub.id)} />
          <input type="hidden" name="categoryId" value={String(parent.id)} />
          <input type="hidden" name="returnTo" value={backHref} />
          <Button type="submit" variant="destructive" size="sm">
            Удалить подкатегорию
          </Button>
        </DestructiveConfirmForm>
      </section>
    </div>
  );
}
