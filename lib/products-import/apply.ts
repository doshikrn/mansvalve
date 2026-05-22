import "server-only";

import { revalidatePath } from "next/cache";

import {
  catalogCategoryPath,
  catalogSubcategoryPath,
} from "@/lib/catalog-routes";
import { settleRevalidation } from "@/lib/revalidation";
import {
  createProduct,
  getProductById,
  updateProduct,
  type ProductWritePayload,
} from "@/lib/services/products";
import { getDb } from "@/lib/db/client";
import {
  categories as categoriesTable,
  products as productsTable,
  subcategories as subcategoriesTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import type { ImportRowPayload } from "./preview";

export interface ApplyImportResult {
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ rowNumber: number; message: string }>;
  affectedSlugs: string[];
}

function buildWritePayload(payload: ImportRowPayload): ProductWritePayload {
  return {
    slug: payload.slug,
    name: payload.name,
    publicTitle: payload.publicTitle,
    h1Override: null,
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    dn: payload.dn,
    pn: payload.pn,
    thread: null,
    material: payload.material,
    connectionType: payload.connectionType,
    controlType: payload.controlType,
    model: payload.model,
    price: payload.price,
    priceByRequest: payload.priceByRequest,
    weight: payload.weight,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription,
    detailBlocks: {
      standards: payload.detailBlocks.standards,
      benefits: payload.detailBlocks.benefits,
      applications: payload.detailBlocks.applications,
      qualityDocuments: payload.detailBlocks.qualityDocuments,
      supplyTerms: payload.detailBlocks.supplyTerms,
    },
    isActive: payload.isActive,
    isFeatured: false,
    sortOrder: 0,
    specs: [],
    images: payload.imageMediaId
      ? [{ mediaId: payload.imageMediaId, alt: null, isPrimary: true, sortOrder: 0 }]
      : undefined,
    specificationMediaId: null,
    questionnaireMediaId: null,
    documentationMediaId: null,
  };
}

/**
 * Применяет проверенные payload'ы импорта. Каждая строка — отдельная транзакция
 * (мы переиспользуем `createProduct`/`updateProduct`, которые работают в `db.transaction`),
 * чтобы ошибка одной строки не сваливала весь импорт.
 *
 * При update — НЕ затрагиваем `images`, если в строке не указан файл (передаём `undefined`),
 * чтобы не стирать ранее прикреплённые изображения.
 */
export async function applyProductsImport(
  payloads: ImportRowPayload[],
): Promise<ApplyImportResult> {
  const result: ApplyImportResult = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [],
    affectedSlugs: [],
  };

  for (const payload of payloads) {
    try {
      const write = buildWritePayload(payload);

      if (payload.mode === "update" && payload.productId) {
        // При update — не трогаем images, если не указано (сохраняем существующие).
        if (!payload.imageMediaId) {
          write.images = undefined;
        }
        await updateProduct(payload.productId, write);
        result.updated += 1;
        result.affectedSlugs.push(payload.slug);
      } else {
        const id = await createProduct(write);
        result.created += 1;
        const fresh = await getProductById(id);
        if (fresh) result.affectedSlugs.push(fresh.slug);
      }
    } catch (error) {
      result.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push({ rowNumber: payload.rowNumber, message });
    }
  }

  await revalidateAfterImport(result.affectedSlugs);
  return result;
}

async function revalidateAfterImport(slugs: string[]): Promise<void> {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/catalog", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/products");

  const seenCategories = new Set<string>();
  const seenSubcategories = new Set<string>();

  for (const slug of slugs) {
    revalidatePath(`/catalog/${slug}`);
    revalidatePath(`/tovar/${slug}`);
  }

  // Дополнительно проходим по затронутым товарам, чтобы revalidate'нуть
  // canonical путь и страницы категорий/подкатегорий.
  for (const slug of slugs) {
    try {
      const detail = await getProductBySlugForRevalidate(slug);
      if (!detail) continue;
      if (detail.categorySlug && detail.subcategorySlug) {
        revalidatePath(
          `/catalog/${detail.categorySlug}/${detail.subcategorySlug}/${detail.slug}`,
        );
      }
      if (detail.categorySlug && !seenCategories.has(detail.categorySlug)) {
        seenCategories.add(detail.categorySlug);
        revalidatePath(catalogCategoryPath(detail.categorySlug));
        revalidatePath(`/catalog/category/${detail.categorySlug}`);
      }
      if (
        detail.subcategorySlug &&
        detail.categorySlug &&
        !seenSubcategories.has(detail.subcategorySlug)
      ) {
        seenSubcategories.add(detail.subcategorySlug);
        revalidatePath(
          catalogSubcategoryPath(detail.categorySlug, detail.subcategorySlug),
        );
        revalidatePath(`/catalog/subcategory/${detail.subcategorySlug}`);
      }
    } catch {
      // мягко игнорируем — основной импорт прошёл, ревалидация best-effort
    }
  }

  await settleRevalidation();
}

async function getProductBySlugForRevalidate(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      product: productsTable,
      categorySlug: categoriesTable.slug,
      subcategorySlug: subcategoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(subcategoriesTable, eq(subcategoriesTable.id, productsTable.subcategoryId))
    .where(eq(productsTable.slug, slug))
    .limit(1);
  if (!rows.length) return null;
  return {
    ...rows[0].product,
    categorySlug: rows[0].categorySlug ?? "",
    subcategorySlug: rows[0].subcategorySlug,
  };
}
