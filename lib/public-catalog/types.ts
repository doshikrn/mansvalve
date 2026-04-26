export interface PublicCatalogProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PublicCatalogProduct {
  id: string;
  name: string;
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
  primaryImageUrl?: string;
  primaryImageAlt?: string;
  images?: PublicCatalogProductImage[];
}

export interface PublicCatalogSubcategory {
  id: string;
  name: string;
  slug: string;
  parentCategory: string;
}

export interface PublicCatalogCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: PublicCatalogSubcategory[];
}

export interface PublicCatalogAdapter {
  getCategories(): Promise<PublicCatalogCategory[]>;
  getProducts(): Promise<PublicCatalogProduct[]>;
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
}

export type PublicCatalogSource = "json" | "db";
