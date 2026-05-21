import "server-only";

import { revalidatePath } from "next/cache";

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
    revalidatePath(`/catalog/category/${target.categorySlug}`);
    revalidatePath(`/${target.categorySlug}`);
  }
  if (target.subcategorySlug) {
    revalidatePath(`/catalog/subcategory/${target.subcategorySlug}`);
  }
  if (target.canonicalPath && target.canonicalPath !== `/tovar/${target.slug}`) {
    revalidatePath(target.canonicalPath);
  }
}
