import type { Metadata } from "next";

import { getPublicCatalogCategories } from "@/lib/public-catalog";
import {
  CatalogSubcategoryPage,
  getCatalogSubcategoryMetadata,
} from "@/components/catalog/CatalogSubcategoryPage";
import type { CatalogSearchParams } from "@/components/catalog/CatalogShell";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getPublicCatalogCategories();
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      slug: category.slug,
      subcategorySlug: subcategory.slug,
    })),
  );
}

interface PageProps {
  params: Promise<{ slug: string; subcategorySlug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subcategorySlug } = await params;
  return getCatalogSubcategoryMetadata(slug, subcategorySlug);
}

export default async function CatalogNestedSubcategoryPage({ params, searchParams }: PageProps) {
  const { slug, subcategorySlug } = await params;
  return (
    <CatalogSubcategoryPage
      categorySlug={slug}
      subcategorySlug={subcategorySlug}
      searchParams={searchParams}
    />
  );
}
