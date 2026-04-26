import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  getCategoryById,
  getNextSubcategorySortOrder,
} from "@/lib/services/categories";

import { createSubcategoryAction } from "../../../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewSubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const { id: raw } = await params;
  const categoryId = Number(raw);
  if (!Number.isFinite(categoryId) || categoryId <= 0) notFound();
  const { error } = await searchParams;

  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">База данных не настроена.</p>;
  }

  const parent = await getCategoryById(categoryId);
  if (!parent) notFound();

  const nextSort = await getNextSubcategorySortOrder(categoryId);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Новая подкатегория</h1>
          <p className="text-sm text-muted-foreground">Категория: {parent.name}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/categories/${categoryId}/edit`}>← Назад</Link>
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form
        action={createSubcategoryAction}
        className="space-y-4 rounded-xl border border-border bg-background p-4"
      >
        <input type="hidden" name="categoryId" value={categoryId} />
        <div className="space-y-2">
          <Label htmlFor="name">Название</Label>
          <input
            id="name"
            name="name"
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <input
            id="slug"
            name="slug"
            placeholder="Пусто — из названия"
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Порядок</Label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={nextSort}
            min={0}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Описание / SEO-текст</Label>
          <Textarea id="description" name="description" rows={5} className="text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoMetaDescription">SEO description (meta)</Label>
          <Textarea id="seoMetaDescription" name="seoMetaDescription" rows={2} className="text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked className="rounded border-input" />
          Активна
        </label>
        <Button type="submit" size="sm">
          Создать
        </Button>
      </form>
    </div>
  );
}
