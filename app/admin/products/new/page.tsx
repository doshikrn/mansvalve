import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { PublicCatalogSourceNotice } from "@/components/admin/PublicCatalogSourceNotice";
import { ProductForm } from "@/components/admin/ProductForm";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";
import { listRecentMediaAssets } from "@/lib/services/media";

import { createProductAction } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  await requireAdmin("/admin/products/new");

  const { returnTo: rawReturn } = await searchParams;
  const listHref = safeReturnTo(rawReturn, "/admin/products");
  const listReturnTo = safeReturnTo(rawReturn, "") || null;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена. Запустите миграции.
      </p>
    );
  }

  const [categories, mediaAssets] = await Promise.all([
    listCategoriesWithSubcategories(),
    listRecentMediaAssets(80),
  ]);

  if (!categories.length) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p>
          Перед созданием товара нужно импортировать каталог:
          <br />
          <code>npm run db:import-catalog</code>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Товары", href: listHref },
          { label: "Новый товар" },
        ]}
      />
      <h1 className="text-xl font-semibold tracking-tight">Новый товар</h1>
      <PublicCatalogSourceNotice />
      <ProductForm
        action={createProductAction}
        categories={categories}
        mediaLibrary={mediaAssets.map((asset) => ({
          id: asset.id,
          url: asset.url,
          storageKey: asset.storageKey,
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
        documentLibrary={mediaAssets
          .filter((asset) => !asset.mimeType.startsWith("image/"))
          .map((asset) => ({
            id: asset.id,
            url: asset.url,
            storageKey: asset.storageKey,
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
        backHref={listHref}
        listReturnTo={listReturnTo}
      />
    </div>
  );
}
