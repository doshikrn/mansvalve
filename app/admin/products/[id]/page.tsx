import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";
import { listRecentMediaAssets } from "@/lib/services/media";
import { getProductById } from "@/lib/services/products";

import { deleteProductAction, updateProductAction } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  await requireAdmin(`/admin/products/${id}`);

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const [product, categories, mediaAssets] = await Promise.all([
    getProductById(id),
    listCategoriesWithSubcategories(),
    listRecentMediaAssets(80),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProductAction.bind(null, id);
  const boundDelete = deleteProductAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="text-xs text-muted-foreground">id {product.id} · {product.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">← К списку</Link>
          </Button>
          <form action={boundDelete}>
            <Button type="submit" variant="destructive" size="sm">
              Удалить
            </Button>
          </form>
        </div>
      </div>

      <ProductForm
        action={boundUpdate}
        categories={categories}
        mediaLibrary={mediaAssets.map((asset) => ({
          id: asset.id,
          url: asset.url,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          width: asset.width,
          height: asset.height,
          alt: asset.alt,
          driver: asset.driver,
          createdAt:
            asset.createdAt instanceof Date
              ? asset.createdAt.toISOString()
              : String(asset.createdAt),
          usedInProducts: asset.usedInProducts,
        }))}
        product={product}
      />
    </div>
  );
}
