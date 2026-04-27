import "server-only";

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  categories as categoriesTable,
  mediaAssets as mediaAssetsTable,
  productImages as productImagesTable,
  productSpecs as productSpecsTable,
  products as productsTable,
  subcategories as subcategoriesTable,
  type NewProduct,
  type Product,
} from "@/lib/db/schema";
import { resolvePublicMediaUrl } from "@/lib/services/media";

export type AdminProductRow = Product & {
  categorySlug: string;
  subcategorySlug: string | null;
};

export type ProductImageDetail = {
  id: number;
  mediaId: string;
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductDetail = AdminProductRow & {
  specs: { id: number; key: string; value: string; sortOrder: number }[];
  images: ProductImageDetail[];
};

export type ProductListOptions = {
  search?: string;
  categoryId?: number;
  subcategoryId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: "updatedAt" | "createdAt" | "name" | "sortOrder";
  orderDir?: "asc" | "desc";
};

export type ProductListResult = {
  items: AdminProductRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listProducts(
  options: ProductListOptions = {},
): Promise<ProductListResult> {
  const {
    search,
    categoryId,
    subcategoryId,
    isActive,
    page = 1,
    pageSize = 25,
    orderBy = "updatedAt",
    orderDir = "desc",
  } = options;

  const db = getDb();

  const conditions = [];
  if (typeof isActive === "boolean") {
    conditions.push(eq(productsTable.isActive, isActive));
  }
  if (categoryId) {
    conditions.push(eq(productsTable.categoryId, categoryId));
  }
  if (subcategoryId) {
    conditions.push(eq(productsTable.subcategoryId, subcategoryId));
  }
  if (search && search.trim()) {
    const needle = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(productsTable.name, needle),
        ilike(productsTable.slug, needle),
        ilike(productsTable.model, needle),
        ilike(productsTable.material, needle),
      )!,
    );
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const orderColumn =
    orderBy === "name"
      ? productsTable.name
      : orderBy === "createdAt"
        ? productsTable.createdAt
        : orderBy === "sortOrder"
          ? productsTable.sortOrder
          : productsTable.updatedAt;

  const offset = (Math.max(1, page) - 1) * pageSize;

  const rowsQuery = db
    .select({
      product: productsTable,
      categorySlug: categoriesTable.slug,
      subcategorySlug: subcategoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(
      subcategoriesTable,
      eq(subcategoriesTable.id, productsTable.subcategoryId),
    )
    .limit(pageSize)
    .offset(offset)
    .orderBy(orderDir === "asc" ? asc(orderColumn) : desc(orderColumn));

  const rows = whereClause
    ? await rowsQuery.where(whereClause)
    : await rowsQuery;

  const countRow = whereClause
    ? await db
        .select({ value: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(whereClause)
    : await db
        .select({ value: sql<number>`count(*)::int` })
        .from(productsTable);

  const items: AdminProductRow[] = rows.map((row) => ({
    ...row.product,
    categorySlug: row.categorySlug ?? "",
    subcategorySlug: row.subcategorySlug,
  }));

  return {
    items,
    total: countRow[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function getProductById(id: number): Promise<ProductDetail | null> {
  const db = getDb();

  const row = await db
    .select({
      product: productsTable,
      categorySlug: categoriesTable.slug,
      subcategorySlug: subcategoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(
      subcategoriesTable,
      eq(subcategoriesTable.id, productsTable.subcategoryId),
    )
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!row.length) return null;

  const [specs, images] = await Promise.all([
    db
      .select()
      .from(productSpecsTable)
      .where(eq(productSpecsTable.productId, id))
      .orderBy(asc(productSpecsTable.sortOrder), asc(productSpecsTable.id)),
    db
      .select({
        id: productImagesTable.id,
        mediaId: productImagesTable.mediaId,
        alt: productImagesTable.alt,
        isPrimary: productImagesTable.isPrimary,
        sortOrder: productImagesTable.sortOrder,
        url: mediaAssetsTable.url,
        storageKey: mediaAssetsTable.storageKey,
        mimeType: mediaAssetsTable.mimeType,
        sizeBytes: mediaAssetsTable.sizeBytes,
        width: mediaAssetsTable.width,
        height: mediaAssetsTable.height,
        driver: mediaAssetsTable.driver,
      })
      .from(productImagesTable)
      .innerJoin(
        mediaAssetsTable,
        eq(mediaAssetsTable.id, productImagesTable.mediaId),
      )
      .where(eq(productImagesTable.productId, id))
      .orderBy(
        asc(productImagesTable.sortOrder),
        desc(productImagesTable.isPrimary),
        asc(productImagesTable.id),
      ),
  ]);

  return {
    ...row[0].product,
    categorySlug: row[0].categorySlug ?? "",
    subcategorySlug: row[0].subcategorySlug,
    specs: specs.map((s) => ({
      id: s.id,
      key: s.key,
      value: s.value,
      sortOrder: s.sortOrder,
    })),
    images: images.map((img) => ({
      id: img.id,
      mediaId: img.mediaId,
      url: resolvePublicMediaUrl(img.url, img.storageKey, img.driver),
      storageKey: img.storageKey,
      mimeType: img.mimeType,
      sizeBytes: img.sizeBytes,
      width: img.width,
      height: img.height,
      alt: img.alt,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
  };
}

export type ProductWritePayload = Omit<
  NewProduct,
  "id" | "createdAt" | "updatedAt" | "categoryName" | "subcategoryName"
> & {
  specs?: { key: string; value: string; sortOrder?: number }[];
  images?: ProductImageWritePayload[];
};

export type ProductImageWritePayload = {
  mediaId: string;
  alt?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
};

async function resolveDenormalizedNames(
  categoryId: number,
  subcategoryId: number | null | undefined,
): Promise<{ categoryName: string; subcategoryName: string | null }> {
  const db = getDb();

  const categoryRow = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);

  if (!categoryRow.length) {
    throw new Error(`Category ${categoryId} not found.`);
  }

  let subcategoryName: string | null = null;
  if (subcategoryId) {
    const subRow = await db
      .select({ name: subcategoriesTable.name })
      .from(subcategoriesTable)
      .where(eq(subcategoriesTable.id, subcategoryId))
      .limit(1);
    subcategoryName = subRow[0]?.name ?? null;
  }

  return { categoryName: categoryRow[0].name, subcategoryName };
}

export async function createProduct(
  payload: ProductWritePayload,
): Promise<number> {
  const db = getDb();
  const { specs, images, ...core } = payload;
  const names = await resolveDenormalizedNames(core.categoryId, core.subcategoryId);

  const inserted = await db
    .insert(productsTable)
    .values({ ...core, ...names })
    .returning({ id: productsTable.id });

  const id = inserted[0].id;

  if (specs && specs.length) {
    await db.insert(productSpecsTable).values(
      specs.map((s, index) => ({
        productId: id,
        key: s.key,
        value: s.value,
        sortOrder: s.sortOrder ?? index,
      })),
    );
  }

  if (images && images.length) {
    await syncProductImages(id, images);
  }

  return id;
}

export async function updateProduct(
  id: number,
  payload: ProductWritePayload,
): Promise<void> {
  const db = getDb();
  const { specs, images, ...core } = payload;
  const names = await resolveDenormalizedNames(core.categoryId, core.subcategoryId);

  await db
    .update(productsTable)
    .set({ ...core, ...names, updatedAt: new Date() })
    .where(eq(productsTable.id, id));

  if (specs) {
    await db.delete(productSpecsTable).where(eq(productSpecsTable.productId, id));
    if (specs.length) {
      await db.insert(productSpecsTable).values(
        specs.map((s, index) => ({
          productId: id,
          key: s.key,
          value: s.value,
          sortOrder: s.sortOrder ?? index,
        })),
      );
    }
  }

  if (images) {
    await syncProductImages(id, images);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDb();
  await db.delete(productsTable).where(eq(productsTable.id, id));
}

export async function countProducts(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productsTable);
  return rows[0]?.value ?? 0;
}

async function syncProductImages(
  productId: number,
  images: ProductImageWritePayload[],
): Promise<void> {
  const db = getDb();
  const normalized = normalizeImages(images);

  await db
    .delete(productImagesTable)
    .where(eq(productImagesTable.productId, productId));

  if (!normalized.length) return;

  const mediaRows = await db
    .select({ id: mediaAssetsTable.id })
    .from(mediaAssetsTable)
    .where(
      inArray(
        mediaAssetsTable.id,
        normalized.map((img) => img.mediaId),
      ),
    );
  const validIds = new Set(mediaRows.map((r) => r.id));
  if (validIds.size !== normalized.length) {
    throw new Error("Some selected images do not exist anymore.");
  }

  await db.insert(productImagesTable).values(
    normalized.map((img, index) => ({
      productId,
      mediaId: img.mediaId,
      alt: img.alt || null,
      isPrimary: img.isPrimary ?? index === 0,
      sortOrder: img.sortOrder ?? index,
    })),
  );
}

function normalizeImages(
  images: ProductImageWritePayload[],
): ProductImageWritePayload[] {
  const unique = new Map<string, ProductImageWritePayload>();

  for (const image of images) {
    if (!image.mediaId) continue;
    if (unique.has(image.mediaId)) continue;
    unique.set(image.mediaId, {
      mediaId: image.mediaId,
      alt: image.alt?.trim().slice(0, 300) ?? null,
      isPrimary: Boolean(image.isPrimary),
      sortOrder: image.sortOrder ?? 0,
    });
  }

  const ordered = Array.from(unique.values()).sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  if (!ordered.length) return ordered;

  const primaryIndex = ordered.findIndex((x) => x.isPrimary);
  const resolvedPrimary = primaryIndex >= 0 ? primaryIndex : 0;

  return ordered.map((image, index) => ({
    ...image,
    sortOrder: index,
    isPrimary: index === resolvedPrimary,
  }));
}
