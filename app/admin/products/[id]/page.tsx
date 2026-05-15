import { notFound } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { PublicCatalogSourceNotice } from "@/components/admin/PublicCatalogSourceNotice";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { isDatabaseConfigured } from "@/lib/db/client";
import type { ProductDetailBlocks } from "@/lib/product-detail-blocks";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { getGateValveSeoPageForProduct } from "@/lib/seo-product-pages/gate-valves";
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
  const initialDetailBlocks = getInitialDetailBlocks(product);
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
            id {product.id} · {product.slug}
          </p>
        </div>
        <DestructiveConfirmForm
          action={boundDelete}
          confirmMessage="Удалить этот товар? Действие необратимо."
          className="shrink-0"
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
        initialDetailBlocks={initialDetailBlocks}
        publicPreview={publicPreview}
        backHref={listHref}
      />
    </div>
  );
}

function buildPublicPreview(product: ProductDetail) {
  const view = buildPublicProductView(toPublicCatalogProduct(product));
  return {
    displayName: view.displayName,
    h1: view.h1,
    seoTitle: view.seoTitle,
    seoDescription: view.seoDescription,
    catalogPath: view.catalogPath,
    canonicalPath: view.canonicalPath,
    primaryImageUrl: view.primaryImageUrl,
    primaryImageAlt: view.primaryImageAlt,
    imageCount: view.imageCount,
  };
}

function getInitialDetailBlocks(product: ProductDetail): ProductDetailBlocks | null {
  if (product.detailBlocks) return product.detailBlocks;

  const seoPage = getGateValveSeoPageForProduct(toPublicCatalogProduct(product));
  if (!seoPage) return null;

  return {
    standards: seoPage.standards,
    benefits: seoPage.benefits,
    applications: seoPage.applications,
    qualityDocuments: seoPage.qualityDocuments,
    supplyTerms: seoPage.supplyTerms,
  };
}

function toPublicCatalogProduct(product: ProductDetail): PublicCatalogProduct {
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    category: product.categorySlug,
    subcategory: product.subcategorySlug ?? "",
    subcategoryName: product.subcategoryName ?? "",
    categoryName: product.categoryName,
    dn: product.dn ?? undefined,
    pn: product.pn ?? undefined,
    thread: product.thread ?? undefined,
    material: product.material ?? "",
    connectionType: product.connectionType ?? "",
    controlType: product.controlType ?? "",
    model: product.model ?? "",
    price: product.price == null ? undefined : Number(product.price),
    priceByRequest: product.priceByRequest,
    weight: product.weight == null ? undefined : Number(product.weight),
    specs: Object.fromEntries(product.specs.map((spec) => [spec.key, spec.value])),
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? undefined,
    detailBlocks: product.detailBlocks ?? undefined,
    primaryImageUrl:
      product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
    primaryImageAlt:
      product.images.find((image) => image.isPrimary)?.alt ??
      product.images[0]?.alt ??
      undefined,
    images: product.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? "",
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    })),
    documents: {
      specification: product.documents.specification
        ? {
            url: product.documents.specification.url,
            mimeType: product.documents.specification.mimeType,
            sizeBytes: product.documents.specification.sizeBytes,
            label: product.documents.specification.alt ?? undefined,
          }
        : undefined,
      questionnaire: product.documents.questionnaire
        ? {
            url: product.documents.questionnaire.url,
            mimeType: product.documents.questionnaire.mimeType,
            sizeBytes: product.documents.questionnaire.sizeBytes,
            label: product.documents.questionnaire.alt ?? undefined,
          }
        : undefined,
      documentation: product.documents.documentation
        ? {
            url: product.documents.documentation.url,
            mimeType: product.documents.documentation.mimeType,
            sizeBytes: product.documents.documentation.sizeBytes,
            label: product.documents.documentation.alt ?? undefined,
          }
        : undefined,
    },
  };
}
