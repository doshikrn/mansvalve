import "server-only";

import { revalidatePath } from "next/cache";

import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";

/**
 * Revalidate the set of public paths that depend on a single product's content.
 * Lightweight version used by bulk operations — does not touch the homepage
 * showcase layout (the caller can call `revalidatePath("/")` once when needed).
 */
export function revalidateSingleProductPaths(target: {
  slug: string;
  categorySlug: string | null;
  subcategorySlug: string | null;
  canonicalPath?: string;
}): void {
  revalidatePath(`/tovar/${target.slug}`);
  revalidatePath(`/catalog/${target.slug}`);
  if (target.categorySlug) {
    revalidatePath(catalogCategoryPath(target.categorySlug));
    revalidatePath(`/catalog/category/${target.categorySlug}`);
  }
  if (target.subcategorySlug && target.categorySlug) {
    revalidatePath(catalogSubcategoryPath(target.categorySlug, target.subcategorySlug));
  }
  if (target.subcategorySlug) {
    revalidatePath(`/catalog/subcategory/${target.subcategorySlug}`);
  }
  if (target.canonicalPath && target.canonicalPath !== `/tovar/${target.slug}`) {
    revalidatePath(target.canonicalPath);
  }
}
