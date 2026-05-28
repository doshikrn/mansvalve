import "server-only";

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import type { ProductDetailBlocks } from "@/lib/product-detail-blocks";

import { getDb } from "@/lib/db/client";
import {
  categories as categoriesTable,
  mediaAssets as mediaAssetsTable,
  productImages as productImagesTable,
  productSlugAliases as productSlugAliasesTable,
  productSpecs as productSpecsTable,
  products as productsTable,
  subcategories as subcategoriesTable,
  type NewProduct,
  type Product,
} from "@/lib/db/schema";
import { resolvePublicMediaUrl } from "@/lib/services/media";

type DbClient = ReturnType<typeof getDb>;
type DbTransaction = Parameters<Parameters<DbClient["transaction"]>[0]>[0];
type DbExecutor = DbClient | DbTransaction;

function parseAdminSearchNumber(value: string, aliases: string[]): number | undefined {
  const aliasPattern = aliases.map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = value
    .toLowerCase()
    .match(new RegExp(`(?:^|[^a-zа-я0-9])(?:${aliasPattern})\\s*-?\\s*(\\d{1,4})(?=$|[^a-zа-я0-9])`, "iu"));
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
}

export type AdminProductRow = Product & {
  categorySlug: string;
  subcategorySlug: string | null;
};

/** Admin list row: product + primary gallery thumb + image count (images only). */
export type AdminProductListRow = AdminProductRow & {
  imageCount: number;
  listThumbUrl: string | null;
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

export type ProductDocumentDetail = {
  mediaId: string;
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  alt: string | null;
};

export type ProductDetail = AdminProductRow & {
  specs: { id: number; key: string; value: string; sortOrder: number }[];
  images: ProductImageDetail[];
  documents: {
    specification: ProductDocumentDetail | null;
    questionnaire: ProductDocumentDetail | null;
    documentation: ProductDocumentDetail | null;
  };
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
  items: AdminProductListRow[];
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
    const rawSearch = search.trim();
    const needle = `%${rawSearch}%`;
    const compactNeedle = `%${rawSearch.replace(/[\s-]+/g, "")}%`;
    const dn = parseAdminSearchNumber(rawSearch, ["dn", "du", "dy", "ду"]);
    const pn = parseAdminSearchNumber(rawSearch, ["pn", "ru", "ру"]);
    const searchConditions = [
      ilike(productsTable.name, needle),
      ilike(productsTable.publicTitle, needle),
      ilike(productsTable.h1Override, needle),
      ilike(productsTable.slug, needle),
      ilike(productsTable.model, needle),
      ilike(productsTable.material, needle),
      ilike(productsTable.connectionType, needle),
      ilike(productsTable.controlType, needle),
      ilike(productsTable.categoryName, needle),
      ilike(productsTable.subcategoryName, needle),
      ilike(sql<string>`replace(${productsTable.model}, ' ', '')`, compactNeedle),
      ilike(sql<string>`replace(${productsTable.slug}, '-', '')`, compactNeedle),
    ];
    if (dn != null) searchConditions.push(eq(productsTable.dn, dn));
    if (pn != null) searchConditions.push(eq(productsTable.pn, pn));
    conditions.push(or(...searchConditions)!);
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

  const productIds = items.map((p) => p.id);
  const imageMeta = new Map<number, { imageCount: number; listThumbUrl: string | null }>();

  if (productIds.length > 0) {
    const imgRows = await db
      .select({
        productId: productImagesTable.productId,
        isPrimary: productImagesTable.isPrimary,
        sortOrder: productImagesTable.sortOrder,
        url: mediaAssetsTable.url,
        storageKey: mediaAssetsTable.storageKey,
        driver: mediaAssetsTable.driver,
        mimeType: mediaAssetsTable.mimeType,
      })
      .from(productImagesTable)
      .innerJoin(
        mediaAssetsTable,
        eq(mediaAssetsTable.id, productImagesTable.mediaId),
      )
      .where(inArray(productImagesTable.productId, productIds));

    const byProduct = new Map<number, typeof imgRows>();
    for (const row of imgRows) {
      const list = byProduct.get(row.productId) ?? [];
      list.push(row);
      byProduct.set(row.productId, list);
    }

    for (const pid of productIds) {
      const list = byProduct.get(pid) ?? [];
      const imagesOnly = list.filter((r) => r.mimeType.startsWith("image/"));
      const sorted = [...imagesOnly].sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      });
      const first = sorted[0];
      const listThumbUrl = first
        ? resolvePublicMediaUrl(first.url, first.storageKey, first.driver)
        : null;
      imageMeta.set(pid, { imageCount: imagesOnly.length, listThumbUrl });
    }
  }

  const listItems: AdminProductListRow[] = items.map((p) => {
    const meta = imageMeta.get(p.id) ?? { imageCount: 0, listThumbUrl: null };
    return { ...p, imageCount: meta.imageCount, listThumbUrl: meta.listThumbUrl };
  });

  return {
    items: listItems,
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

  const documentIds = [
    row[0].product.specificationMediaId,
    row[0].product.questionnaireMediaId,
    row[0].product.documentationMediaId,
  ].filter((v): v is string => Boolean(v));

  const docsById = new Map<
    string,
    {
      id: string;
      url: string;
      storageKey: string;
      mimeType: string;
      sizeBytes: number;
      alt: string | null;
      driver: string;
    }
  >();

  if (documentIds.length > 0) {
    const docRows = await db
      .select({
        id: mediaAssetsTable.id,
        url: mediaAssetsTable.url,
        storageKey: mediaAssetsTable.storageKey,
        mimeType: mediaAssetsTable.mimeType,
        sizeBytes: mediaAssetsTable.sizeBytes,
        alt: mediaAssetsTable.alt,
        driver: mediaAssetsTable.driver,
      })
      .from(mediaAssetsTable)
      .where(inArray(mediaAssetsTable.id, documentIds));
    for (const doc of docRows) {
      docsById.set(doc.id, doc);
    }
  }

  const mapDocument = (mediaId: string | null): ProductDocumentDetail | null => {
    if (!mediaId) return null;
    const doc = docsById.get(mediaId);
    if (!doc) return null;
    return {
      mediaId: doc.id,
      url: resolvePublicMediaUrl(doc.url, doc.storageKey, doc.driver),
      storageKey: doc.storageKey,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      alt: doc.alt,
    };
  };

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
    documents: {
      specification: mapDocument(row[0].product.specificationMediaId),
      questionnaire: mapDocument(row[0].product.questionnaireMediaId),
      documentation: mapDocument(row[0].product.documentationMediaId),
    },
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
  db: DbExecutor,
  categoryId: number,
  subcategoryId: number | null | undefined,
): Promise<{ categoryName: string; subcategoryName: string | null }> {
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

  return db.transaction(async (tx) => {
    await validateDocumentMedia(tx, core);
    const names = await resolveDenormalizedNames(
      tx,
      core.categoryId,
      core.subcategoryId,
    );

    if (core.slug) {
      // Reclaim the slug from any prior alias — manual republish wins.
      await tx
        .delete(productSlugAliasesTable)
        .where(eq(productSlugAliasesTable.slug, core.slug));
    }

    const inserted = await tx
      .insert(productsTable)
      .values({ ...core, ...names })
      .returning({ id: productsTable.id });

    const id = inserted[0].id;

    if (specs && specs.length) {
      await tx.insert(productSpecsTable).values(
        specs.map((s, index) => ({
          productId: id,
          key: s.key,
          value: s.value,
          sortOrder: s.sortOrder ?? index,
        })),
      );
    }

    if (images && images.length) {
      await syncProductImages(tx, id, images);
    }

    return id;
  });
}

export async function updateProduct(
  id: number,
  payload: ProductWritePayload,
): Promise<void> {
  const db = getDb();
  const { specs, images, ...core } = payload;

  await db.transaction(async (tx) => {
    await validateDocumentMedia(tx, core);
    const names = await resolveDenormalizedNames(
      tx,
      core.categoryId,
      core.subcategoryId,
    );

    const existing = await tx
      .select({ slug: productsTable.slug })
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);
    const previousSlug = existing[0]?.slug ?? null;

    await tx
      .update(productsTable)
      .set({ ...core, ...names, updatedAt: new Date() })
      .where(eq(productsTable.id, id));

    if (previousSlug && core.slug && previousSlug !== core.slug) {
      // Drop any alias matching the new slug (avoid old aliases shadowing a
      // newly published slug) and persist the previous slug as alias for
      // permanent redirects.
      await tx
        .delete(productSlugAliasesTable)
        .where(eq(productSlugAliasesTable.slug, core.slug));
      try {
        await tx
          .insert(productSlugAliasesTable)
          .values({ productId: id, slug: previousSlug });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("product_slug_aliases_slug_idx")) {
          throw error;
        }
      }
    }

    if (specs) {
      await tx.delete(productSpecsTable).where(eq(productSpecsTable.productId, id));
      if (specs.length) {
        await tx.insert(productSpecsTable).values(
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
      await syncProductImages(tx, id, images);
    }
  });
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.delete(productImagesTable).where(eq(productImagesTable.productId, id));
    await tx.delete(productSpecsTable).where(eq(productSpecsTable.productId, id));
    await tx.delete(productSlugAliasesTable).where(eq(productSlugAliasesTable.productId, id));
    await tx.delete(productsTable).where(eq(productsTable.id, id));
  });
}

/**
 * Returns the product id currently owning the given (potentially historical) slug,
 * resolved via the slug alias table. Used for safe redirects after manual slug edits.
 */
export async function findProductIdBySlugAlias(
  slug: string,
): Promise<number | null> {
  const db = getDb();
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const rows = await db
    .select({ productId: productSlugAliasesTable.productId })
    .from(productSlugAliasesTable)
    .where(eq(productSlugAliasesTable.slug, trimmed))
    .limit(1);
  return rows[0]?.productId ?? null;
}

/** Returns the current canonical slug for a product id, or `null` if not found. */
export async function getProductSlugById(id: number): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ slug: productsTable.slug })
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  return rows[0]?.slug ?? null;
}

/**
 * Patch `detail_blocks` jsonb for a product, merging only the provided keys
 * (other keys are preserved). Used by safe bulk operations to fill missing
 * shared blocks from a series template without touching specs/images.
 *
 * Returns the slug of the affected product (for revalidation) or `null` when
 * the product was not found.
 */
export async function patchProductDetailBlocks(
  productId: number,
  patch: Partial<ProductDetailBlocks>,
): Promise<{ slug: string; categorySlug: string | null; subcategorySlug: string | null } | null> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        slug: productsTable.slug,
        detailBlocks: productsTable.detailBlocks,
        categorySlug: categoriesTable.slug,
        subcategorySlug: subcategoriesTable.slug,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
      .leftJoin(
        subcategoriesTable,
        eq(subcategoriesTable.id, productsTable.subcategoryId),
      )
      .where(eq(productsTable.id, productId))
      .limit(1);
    if (!rows.length) return null;
    const current = rows[0].detailBlocks ?? null;
    const merged: ProductDetailBlocks = {
      standards: patch.standards ?? current?.standards ?? [],
      benefits: patch.benefits ?? current?.benefits ?? [],
      applications: patch.applications ?? current?.applications ?? [],
      qualityDocuments:
        patch.qualityDocuments ?? current?.qualityDocuments ?? [],
      supplyTerms: patch.supplyTerms ?? current?.supplyTerms ?? [],
    };
    await tx
      .update(productsTable)
      .set({ detailBlocks: merged, updatedAt: new Date() })
      .where(eq(productsTable.id, productId));
    return {
      slug: rows[0].slug,
      categorySlug: rows[0].categorySlug,
      subcategorySlug: rows[0].subcategorySlug,
    };
  });
}

export async function listProductSlugAliases(
  productId: number,
): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ slug: productSlugAliasesTable.slug })
    .from(productSlugAliasesTable)
    .where(eq(productSlugAliasesTable.productId, productId))
    .orderBy(desc(productSlugAliasesTable.createdAt));
  return rows.map((r) => r.slug);
}

export async function countProducts(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productsTable);
  return rows[0]?.value ?? 0;
}

async function syncProductImages(
  db: DbExecutor,
  productId: number,
  images: ProductImageWritePayload[],
): Promise<void> {
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

async function validateDocumentMedia(
  db: DbExecutor,
  core: Omit<
    ProductWritePayload,
    "specs" | "images"
  >,
): Promise<void> {
  const docIds = [
    core.specificationMediaId,
    core.questionnaireMediaId,
    core.documentationMediaId,
  ].filter((v): v is string => Boolean(v));

  if (!docIds.length) return;

  const rows = await db
    .select({
      id: mediaAssetsTable.id,
      mimeType: mediaAssetsTable.mimeType,
    })
    .from(mediaAssetsTable)
    .where(inArray(mediaAssetsTable.id, docIds));
  if (rows.length !== docIds.length) {
    throw new Error("Some selected documents do not exist anymore.");
  }

  const allowedDocumentMime = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);
  for (const row of rows) {
    if (!allowedDocumentMime.has(row.mimeType)) {
      throw new Error("Invalid document format for product document fields.");
    }
  }
}
