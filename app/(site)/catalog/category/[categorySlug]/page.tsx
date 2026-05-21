import { permanentRedirect } from "next/navigation";

import { getPublicCatalogCategories } from "@/lib/public-catalog";
import { catalogCategoryPath } from "@/lib/catalog-routes";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getPublicCatalogCategories();
  return categories.map((cat) => ({ categorySlug: cat.slug }));
}

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

/** Старый URL `/catalog/category/[slug]` → канонический `/catalog/[slug]`. */
export default async function LegacyCatalogCategoryRedirect({ params }: PageProps) {
  const { categorySlug } = await params;
  permanentRedirect(catalogCategoryPath(categorySlug));
}
