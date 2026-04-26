// Auto-generated from Excel files.
// DO NOT EDIT MANUALLY — run `python scripts/rebuild_catalog.py`

import catalogData from "@/data/catalog-products.json";

export interface Product {
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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parentCategory: string;
}

type RawProduct = Omit<Product, "dn" | "pn" | "thread" | "price" | "weight"> & {
  dn: number | null;
  pn: number | null;
  thread: string | null;
  price: number | null;
  weight: number | null;
};

const rawCategories = (catalogData.categories ?? []) as Category[];
const rawProducts = (catalogData.products ?? []) as unknown as RawProduct[];

export const categories: Category[] = rawCategories;

export const products: Product[] = rawProducts.map((product) => ({
  ...product,
  dn: product.dn ?? undefined,
  pn: product.pn ?? undefined,
  thread: product.thread ?? undefined,
  price: product.price ?? undefined,
  weight: product.weight ?? undefined,
}));

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function getProductsBySubcategory(subcategoryId: string): Product[] {
  return products.filter((p) => p.subcategory === subcategoryId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;

  return products.filter((p) => {
    const haystack = [
      p.name,
      p.material,
      p.connectionType,
      p.controlType,
      p.model,
      p.categoryName,
      p.subcategoryName,
      p.shortDescription,
      p.dn != null ? String(p.dn) : "",
      p.pn != null ? String(p.pn) : "",
      p.thread ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
