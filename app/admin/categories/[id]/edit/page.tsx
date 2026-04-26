import Link from "next/link";
import { notFound } from "next/navigation";

import { CategorySeoFields } from "@/components/admin/CategorySeoFields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { categorySeoToFormDefaults, getCategoryWithSubcategoriesById } from "@/lib/services/categories";

import { updateCategoryAction } from "../../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const sp = await searchParams;

  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">База данных не настроена.</p>;
  }

  const category = await getCategoryWithSubcategoriesById(id);
  if (!category) notFound();

  const seoDefaults = categorySeoToFormDefaults(category.seoContent);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Категория: {category.name}</h1>
          <p className="text-sm text-muted-foreground">
            id={category.id} · slug публичного URL: <code className="text-xs">{category.slug}</code>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/categories">← К списку</Link>
        </Button>
      </div>

      {sp.error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sp.error}
        </p>
      ) : null}
      {sp.saved === "1" ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Сохранено.
        </p>
      ) : null}

      <form action={updateCategoryAction} className="space-y-4 rounded-xl border border-border bg-background p-4">
        <input type="hidden" name="id" value={category.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Название</Label>
            <input
              id="name"
              name="name"
              required
              defaultValue={category.name}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <input
              id="slug"
              name="slug"
              defaultValue={category.slug}
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Порядок</Label>
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
          <Label htmlFor="seoMetaDescription">SEO description (meta)</Label>
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

        <Button type="submit" size="sm">
          Сохранить категорию
        </Button>
      </form>

      <section className="space-y-3 rounded-xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Подкатегории
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/categories/${id}/subcategories/new`}>+ Подкатегория</Link>
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
                  <Link href={`/admin/categories/${id}/subcategories/${s.id}/edit`}>Изменить</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
