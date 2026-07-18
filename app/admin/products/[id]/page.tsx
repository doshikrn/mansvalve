import { notFound } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { PublicCatalogSourceNotice } from "@/components/admin/PublicCatalogSourceNotice";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { formatProductPageTitle } from "@/lib/catalog/product-seo-naming";
import { isDatabaseConfigured } from "@/lib/db/client";
import { productDetailToPublicCatalogProduct } from "@/lib/public-catalog/from-product-detail";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";
import { listRecentMediaAssets } from "@/lib/services/media";
import { getProductById, type ProductDetail } from "@/lib/services/products";

import { deleteProductAction, updateProductAction } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  await requireAdmin(`/admin/products/${id}`);

  const { returnTo: rawReturn } = await searchParams;
  const listHref = safeReturnTo(rawReturn, "/admin/products");

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

  const displayName = formatProductDisplayName(product);
  const publicPreview = buildPublicPreview(product);
  const boundUpdate = updateProductAction.bind(null, id);
  const boundDelete = deleteProductAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Товары", href: listHref },
          { label: displayName },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {displayName}
          </h1>
          <p className="text-xs text-muted-foreground">
            Запись {product.id} · ссылка на сайте:{" "}
            <code className="rounded bg-muted px-1">{product.slug}</code>
          </p>
        </div>
        <DestructiveConfirmForm
          action={boundDelete}
          confirmMessage={`Удалить товар «${displayName}» окончательно? Он исчезнет с сайта и из каталога. Действие нельзя отменить.`}
          className="shrink-0"
          title="Удаление товара"
          details={
            <>
              Будет удалён товар <strong>{displayName}</strong>. Связанные медиа и документы
              останутся в медиатеке, но привязки к товару будут сняты.
              <br />
              Сейчас привязано изображений: {product.images.length}; документов:{" "}
              {Object.values(product.documents).filter(Boolean).length}.
            </>
          }
        >
          <input type="hidden" name="returnTo" value={listHref} />
          <Button type="submit" variant="destructive" size="sm">
            Удалить
          </Button>
        </DestructiveConfirmForm>
      </div>

      <PublicCatalogSourceNotice />
      <ProductForm
        action={boundUpdate}
        listReturnTo={listHref}
        serverUpdatedAt={product.updatedAt}
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
        product={product}
        initialDetailBlocks={product.detailBlocks}
        publicPreview={publicPreview}
        backHref={listHref}
      />
    </div>
  );
}

function buildPublicPreview(product: ProductDetail) {
  const view = buildPublicProductView(productDetailToPublicCatalogProduct(product));
  return {
    generatedDisplayName: view.generatedDisplayName,
    displayName: view.displayName,
    h1: view.h1,
    h1IsManual: view.h1IsManual,
    shortDescription: view.shortDescription,
    seoTitle: view.seoTitle,
    seoTitleFull: formatProductPageTitle(view.seoTitle, {
      preserveInput: view.seoTitleIsManual,
    }),
    seoTitleIsManual: view.seoTitleIsManual,
    seoDescription: view.seoDescription,
    seoDescriptionIsManual: view.seoDescriptionIsManual,
    canonicalPath: view.canonicalPath,
    canonicalUrl: view.canonicalUrl,
    primaryImageUrl: view.primaryImageUrl,
    primaryImageAlt: view.primaryImageAlt,
    imageCount: view.imageCount,
  };
}
