import "server-only";

import { permanentRedirect } from "next/navigation";

import {
  buildCleanProductRedirectUrl,
  type SearchParamsLike,
} from "@/lib/catalog-redirect";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getPublicProductBySlug } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { resolveProductSlugAliasTarget } from "@/lib/public-catalog/slug-aliases";

/**
 * Legacy `/catalog/[productSlug]` → canonical product URL (308).
 * Returns only when no product/alias matches (caller should render category or notFound).
 */
export async function redirectLegacyCatalogProductIfNeeded(
  slug: string,
  searchParams?: SearchParamsLike,
): Promise<void> {
  const product = await getPublicProductBySlug(slug);
  if (product) {
    const view = buildPublicProductView(product);
    permanentRedirect(
      buildCleanProductRedirectUrl(view.canonicalPath, searchParams),
    );
  }

  if (isDatabaseConfigured()) {
    const aliasTarget = await resolveProductSlugAliasTarget(slug);
    if (aliasTarget) {
      permanentRedirect(buildCleanProductRedirectUrl(aliasTarget, searchParams));
    }
  }
}
