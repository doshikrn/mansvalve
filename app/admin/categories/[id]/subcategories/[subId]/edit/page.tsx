import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getCategoryById, getSubcategoryById } from "@/lib/services/categories";

import { updateSubcategoryAction } from "../../../../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditSubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; subId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdmin("/admin/categories");
  const { id: rawCat, subId: rawSub } = await params;
  const categoryId = Number(rawCat);
  const subId = Number(rawSub);
  if (!Number.isFinite(categoryId) || !Number.isFinite(subId)) notFound();

  const sp = await searchParams;

  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">База данных не настроена.</p>;
  }

  const [parent, sub] = await Promise.all([getCategoryById(categoryId), getSubcategoryById(subId)]);
  if (!parent || !sub || sub.categoryId !== categoryId) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{sub.name}</h1>
          <p className="text-sm text-muted-foreground">
            Категория: {parent.name} · slug: <code className="text-xs">{sub.slug}</code>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/categories/${categoryId}/edit`}>← К категории</Link>
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

      <form action={updateSubcategoryAction} className="space-y-4 rounded-xl border border-border bg-background p-4">
        <input type="hidden" name="id" value={sub.id} />
        <input type="hidden" name="categoryId" value={categoryId} />

        <div className="space-y-2">
          <Label htmlFor="name">Название</Label>
          <input
            id="name"
            name="name"
            required
            defaultValue={sub.name}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={sub.slug}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Порядок</Label>
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
          <Label htmlFor="seoMetaDescription">SEO description (meta)</Label>
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
        <Button type="submit" size="sm">
          Сохранить
        </Button>
      </form>
    </div>
  );
}
