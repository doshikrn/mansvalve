import type { ProductDetailBlocks } from "@/lib/product-detail-blocks";

export interface PublicCatalogProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PublicCatalogProductDocument {
  url: string;
  mimeType: string;
  sizeBytes: number;
  label?: string;
}

export interface PublicCatalogProduct {
  id: string;
  name: string;
  publicTitle?: string;
  h1Override?: string;
  slug: string;
  category: string;
  subcategory: string;
  subcategoryName: string;
  categoryName: string;
  dn: number | undefined;
  pn: number | undefined;
  thread: string | undefined;
  material: string;
  connectionType: string;
  controlType: string;
  model: string;
  price: number | undefined;
  priceByRequest: boolean;
  weight: number | undefined;
  specs: Record<string, string>;
  shortDescription: string;
  longDescription?: string;
  detailBlocks?: ProductDetailBlocks;
  primaryImageUrl?: string;
  primaryImageAlt?: string;
  images?: PublicCatalogProductImage[];
  documents?: {
    specification?: PublicCatalogProductDocument;
    questionnaire?: PublicCatalogProductDocument;
    documentation?: PublicCatalogProductDocument;
  };
}

export interface PublicCatalogSubcategory {
  id: string;
  name: string;
  slug: string;
  parentCategory: string;
  sortOrder?: number;
}

export interface PublicCatalogCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  subcategories: PublicCatalogSubcategory[];
}

export interface PublicCatalogAdapter {
  getCategories(): Promise<PublicCatalogCategory[]>;
  getProducts(): Promise<PublicCatalogProduct[]>;
  /** Listing / filters / search: no long bodies, documents, or image galleries. */
  getListingProducts(): Promise<PublicCatalogProduct[]>;
  getCategoryBySlug(slug: string): Promise<PublicCatalogCategory | undefined>;
  getCategoryById(id: string): Promise<PublicCatalogCategory | undefined>;
  getSubcategoryBySlug(
    slug: string,
  ): Promise<
    | {
        category: PublicCatalogCategory;
        subcategory: PublicCatalogSubcategory;
      }
    | undefined
  >;
  getProductBySlug(slug: string): Promise<PublicCatalogProduct | undefined>;
  getProductsByCategory(categoryId: string): Promise<PublicCatalogProduct[]>;
  getProductsBySubcategory(subcategoryId: string): Promise<PublicCatalogProduct[]>;
  /** Active listing products in category (id/slug). */
  countProductsByCategory(categoryIdOrSlug: string): Promise<number>;
  /** Active listing products in subcategory (id/slug). */
  countProductsBySubcategory(subcategoryIdOrSlug: string): Promise<number>;
}

export type PublicCatalogSource = "json" | "db";
