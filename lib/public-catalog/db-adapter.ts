import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db/drizzle-core";
import {
  categories as categoriesTable,
  mediaAssets as mediaAssetsTable,
  productImages as productImagesTable,
  productSpecs as productSpecsTable,
  products as productsTable,
  subcategories as subcategoriesTable,
} from "@/lib/db/schema";
import { resolvePublicMediaUrl } from "@/lib/services/media";
import { getOrderedCatalogCategories } from "@/lib/catalog-seo";

import type {
  PublicCatalogAdapter,
  PublicCatalogCategory,
  PublicCatalogProductDocument,
  PublicCatalogProduct,
  PublicCatalogProductImage,
  PublicCatalogSubcategory,
} from "./types";

type ProductRow = {
  product: typeof productsTable.$inferSelect;
  category: {
    slug: string;
    name: string;
  };
  subcategory: {
    slug: string;
    name: string;
  } | null;
};

async function fetchCategories(): Promise<PublicCatalogCategory[]> {
  const db = getDb();
  const [categories, subcategories] = await Promise.all([
    db
      .select({
        slug: categoriesTable.slug,
        name: categoriesTable.name,
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name)),
    db
      .select({
        slug: subcategoriesTable.slug,
        name: subcategoriesTable.name,
        categorySlug: categoriesTable.slug,
      })
      .from(subcategoriesTable)
      .innerJoin(
        categoriesTable,
        eq(categoriesTable.id, subcategoriesTable.categoryId),
      )
      .where(
        and(
          eq(subcategoriesTable.isActive, true),
          eq(categoriesTable.isActive, true),
        ),
      )
      .orderBy(
        asc(categoriesTable.sortOrder),
        asc(subcategoriesTable.sortOrder),
        asc(subcategoriesTable.name),
      ),
  ]);

  const bucket = new Map<string, PublicCatalogSubcategory[]>();
  for (const subcategory of subcategories) {
    const arr = bucket.get(subcategory.categorySlug) ?? [];
    arr.push({
      id: subcategory.slug,
      name: subcategory.name,
      slug: subcategory.slug,
      parentCategory: subcategory.categorySlug,
    });
    bucket.set(subcategory.categorySlug, arr);
  }

  return getOrderedCatalogCategories(
    categories.map((category) => ({
      id: category.slug,
      name: category.name,
      slug: category.slug,
      subcategories: bucket.get(category.slug) ?? [],
    })),
  );
}

async function fetchProductRows(): Promise<ProductRow[]> {
  const db = getDb();
  return db
    .select({
      product: productsTable,
      category: {
        slug: categoriesTable.slug,
        name: categoriesTable.name,
      },
      subcategory: {
        slug: subcategoriesTable.slug,
        name: subcategoriesTable.name,
      },
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(
      subcategoriesTable,
      eq(subcategoriesTable.id, productsTable.subcategoryId),
    )
    .where(
      and(eq(productsTable.isActive, true), eq(categoriesTable.isActive, true)),
    )
    .orderBy(
      asc(categoriesTable.sortOrder),
      asc(productsTable.sortOrder),
      asc(productsTable.name),
    );
}

async function fetchPrimaryImageMap(
  productIds: number[],
): Promise<Map<number, { url: string; alt: string }>> {
  const map = new Map<number, { url: string; alt: string }>();
  if (!productIds.length) return map;

  const db = getDb();
  const rows = await db
    .select({
      productId: productImagesTable.productId,
      url: mediaAssetsTable.url,
      storageKey: mediaAssetsTable.storageKey,
      driver: mediaAssetsTable.driver,
      imageAlt: productImagesTable.alt,
      assetAlt: mediaAssetsTable.alt,
      isPrimary: productImagesTable.isPrimary,
      sortOrder: productImagesTable.sortOrder,
      id: productImagesTable.id,
    })
    .from(productImagesTable)
    .innerJoin(
      mediaAssetsTable,
      eq(mediaAssetsTable.id, productImagesTable.mediaId),
    )
    .where(inArray(productImagesTable.productId, productIds))
    .orderBy(
      asc(productImagesTable.productId),
      desc(productImagesTable.isPrimary),
      asc(productImagesTable.sortOrder),
      asc(productImagesTable.id),
    );

  for (const row of rows) {
    if (!map.has(row.productId)) {
      map.set(row.productId, {
        url: resolvePublicMediaUrl(row.url, row.storageKey, row.driver),
        alt: row.imageAlt || row.assetAlt || "",
      });
    }
  }

  return map;
}

function mapProductRow(
  row: ProductRow,
  primaryImage:
    | {
        url: string;
        alt: string;
      }
    | undefined,
  documents?: {
    specification?: PublicCatalogProductDocument;
    questionnaire?: PublicCatalogProductDocument;
    documentation?: PublicCatalogProductDocument;
  },
): PublicCatalogProduct {
  const product = row.product;
  const category = row.category;
  const subcategory = row.subcategory;
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    category: category.slug,
    subcategory: subcategory?.slug ?? "",
    subcategoryName: subcategory?.name ?? product.subcategoryName ?? "",
    categoryName: category.name,
    dn: product.dn ?? undefined,
    pn: product.pn ?? undefined,
    thread: product.thread ?? undefined,
    material: product.material || "Не указан",
    connectionType: product.connectionType || "Не указано",
    controlType: product.controlType || "Не указано",
    model: product.model || "",
    price: toNumber(product.price),
    priceByRequest: product.priceByRequest || product.price == null,
    weight: toNumber(product.weight),
    specs: {},
    shortDescription:
      product.shortDescription ||
      `${product.name}. Категория: ${category.name}.`,
    primaryImageUrl: primaryImage?.url,
    primaryImageAlt: primaryImage?.alt || undefined,
    documents,
  };
}

function toNumber(value: string | number | null): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

async function fetchProductImages(productId: number): Promise<PublicCatalogProductImage[]> {
  const db = getDb();
  const rows = await db
    .select({
      url: mediaAssetsTable.url,
      storageKey: mediaAssetsTable.storageKey,
      driver: mediaAssetsTable.driver,
      imageAlt: productImagesTable.alt,
      assetAlt: mediaAssetsTable.alt,
      isPrimary: productImagesTable.isPrimary,
      sortOrder: productImagesTable.sortOrder,
    })
    .from(productImagesTable)
    .innerJoin(
      mediaAssetsTable,
      eq(mediaAssetsTable.id, productImagesTable.mediaId),
    )
    .where(eq(productImagesTable.productId, productId))
    .orderBy(
      desc(productImagesTable.isPrimary),
      asc(productImagesTable.sortOrder),
      asc(productImagesTable.id),
    );

  return rows.map((row, index) => ({
    url: resolvePublicMediaUrl(row.url, row.storageKey, row.driver),
    alt: row.imageAlt || row.assetAlt || "",
    isPrimary: row.isPrimary || index === 0,
    sortOrder: row.sortOrder,
  }));
}

export const dbCatalogAdapter: PublicCatalogAdapter = {
  async getCategories() {
    return fetchCategories();
  },

  async getProducts() {
    const rows = await fetchProductRows();
    const primaryImageMap = await fetchPrimaryImageMap(
      rows.map((row) => row.product.id),
    );
    return rows.map((row) =>
      mapProductRow(row, primaryImageMap.get(row.product.id)),
    );
  },

  async getCategoryBySlug(slug) {
    const categories = await fetchCategories();
    return categories.find((category) => category.slug === slug);
  },

  async getCategoryById(id) {
    const categories = await fetchCategories();
    return categories.find((category) => category.id === id);
  },

  async getSubcategoryBySlug(slug) {
    const categories = await fetchCategories();
    for (const category of categories) {
      const subcategory = category.subcategories.find((sub) => sub.slug === slug);
      if (subcategory) return { category, subcategory };
    }
    return undefined;
  },

  async getProductBySlug(slug) {
    const db = getDb();
    const row = await db
      .select({
        product: productsTable,
        category: {
          slug: categoriesTable.slug,
          name: categoriesTable.name,
        },
        subcategory: {
          slug: subcategoriesTable.slug,
          name: subcategoriesTable.name,
        },
      })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
      .leftJoin(
        subcategoriesTable,
        eq(subcategoriesTable.id, productsTable.subcategoryId),
      )
      .where(and(eq(productsTable.slug, slug), eq(productsTable.isActive, true)))
      .limit(1);

    if (!row.length) return undefined;

    const productId = row[0].product.id;
    const productRow = row[0].product;
    const [specRows, images] = await Promise.all([
      db
        .select({
          key: productSpecsTable.key,
          value: productSpecsTable.value,
        })
        .from(productSpecsTable)
        .where(eq(productSpecsTable.productId, productId))
        .orderBy(asc(productSpecsTable.sortOrder), asc(productSpecsTable.id)),
      fetchProductImages(productId),
    ]);

    const documentIds = [
      productRow.specificationMediaId,
      productRow.questionnaireMediaId,
      productRow.documentationMediaId,
    ].filter((v): v is string => Boolean(v));

    let documentMap = new Map<
      string,
      {
        id: string;
        url: string;
        storageKey: string;
        driver: string;
        mimeType: string;
        sizeBytes: number;
        alt: string | null;
      }
    >();

    if (documentIds.length > 0) {
      const documentRows = await db
        .select({
          id: mediaAssetsTable.id,
          url: mediaAssetsTable.url,
          storageKey: mediaAssetsTable.storageKey,
          driver: mediaAssetsTable.driver,
          mimeType: mediaAssetsTable.mimeType,
          sizeBytes: mediaAssetsTable.sizeBytes,
          alt: mediaAssetsTable.alt,
        })
        .from(mediaAssetsTable)
        .where(inArray(mediaAssetsTable.id, documentIds));
      documentMap = new Map(documentRows.map((doc) => [doc.id, doc]));
    }

    const mapDocument = (
      mediaId: string | null,
    ): PublicCatalogProductDocument | undefined => {
      if (!mediaId) return undefined;
      const doc = documentMap.get(mediaId);
      if (!doc) return undefined;
      return {
        url: resolvePublicMediaUrl(doc.url, doc.storageKey, doc.driver),
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        label: doc.alt ?? undefined,
      };
    };

    const mapped = mapProductRow(row[0], images[0] ? { url: images[0].url, alt: images[0].alt } : undefined);
    mapped.specs = Object.fromEntries(specRows.map((spec) => [spec.key, spec.value]));
    mapped.images = images;
    mapped.documents = {
      specification: mapDocument(productRow.specificationMediaId),
      questionnaire: mapDocument(productRow.questionnaireMediaId),
      documentation: mapDocument(productRow.documentationMediaId),
    };
    return mapped;
  },

  async getProductsByCategory(categoryId) {
    const products = await this.getProducts();
    return products.filter((product) => product.category === categoryId);
  },

  async getProductsBySubcategory(subcategoryId) {
    const products = await this.getProducts();
    return products.filter((product) => product.subcategory === subcategoryId);
  },
};
