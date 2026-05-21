import "server-only";

import { findProductIdBySlugAlias, getProductSlugById } from "@/lib/services/products";

import { getPublicProductBySlug } from "./index";
import { buildPublicProductView } from "./product-view";

/**
 * Resolves a (possibly historical) product slug to its current canonical
 * public path. Used by `/tovar/[slug]` and `/catalog/[slug]` to keep old URLs
 * alive after a manual slug edit via a permanent redirect.
 *
 * Returns `null` when the slug is not found in the alias table or when the
 * underlying product can no longer be loaded.
 */
export async function resolveProductSlugAliasTarget(
  slug: string,
): Promise<string | null> {
  const productId = await findProductIdBySlugAlias(slug);
  if (!productId) return null;

  const currentSlug = await getProductSlugById(productId);
  if (!currentSlug || currentSlug === slug) return null;

  const product = await getPublicProductBySlug(currentSlug);
  if (!product) return null;

  const view = buildPublicProductView(product);
  return view.canonicalPath;
}
