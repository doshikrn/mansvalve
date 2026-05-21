import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { getPublicSubcategoryBySlug } from "@/lib/public-catalog";
import { catalogSubcategoryPath } from "@/lib/catalog-routes";
import { resolveLegacyKlapanySubcategoryCanonicalPath } from "@/lib/catalog-subcategory-legacy-redirects";

export const revalidate = 300;

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ subcategorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategorySlug } = await params;
  const legacy = resolveLegacyKlapanySubcategoryCanonicalPath(subcategorySlug);
  if (legacy) {
    return { title: "Перенаправление…", alternates: { canonical: legacy } };
  }
  const context = await getPublicSubcategoryBySlug(subcategorySlug);
  if (!context) return { title: "Подкатегория не найдена" };
  const canonicalPath = catalogSubcategoryPath(context.category.slug, context.subcategory.slug);
  return { title: "Перенаправление…", alternates: { canonical: canonicalPath } };
}

/** `/catalog/subcategory/[slug]` → канонический `/catalog/[category]/[subcategory]`. */
export default async function LegacyCatalogSubcategoryRedirect({
  params,
  searchParams,
}: PageProps) {
  const { subcategorySlug } = await params;
  const query = await searchParams;

  const legacy = resolveLegacyKlapanySubcategoryCanonicalPath(subcategorySlug);
  if (legacy) {
    permanentRedirect(`${legacy}${buildQueryString(query)}`);
  }

  const context = await getPublicSubcategoryBySlug(subcategorySlug);
  if (!context) notFound();

  permanentRedirect(
    `${catalogSubcategoryPath(context.category.slug, context.subcategory.slug)}${buildQueryString(query)}`,
  );
}

function buildQueryString(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) params.append(key, item);
      }
      continue;
    }
    if (value) params.set(key, value);
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}
