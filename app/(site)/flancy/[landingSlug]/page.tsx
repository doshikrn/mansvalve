import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  CATALOG_LANDING_PAGES,
  LEGACY_CATALOG_LANDING_CATEGORY_SLUGS,
} from "@/lib/catalog-seo";
import { toAbsoluteSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ landingSlug: string }>;
};

export function generateStaticParams() {
  const legacyPrefix = "flancy";
  const targetCategorySlug = LEGACY_CATALOG_LANDING_CATEGORY_SLUGS[legacyPrefix];
  if (!targetCategorySlug) return [];

  return CATALOG_LANDING_PAGES.filter(
    (page) => page.categorySlug === targetCategorySlug,
  ).map((page) => ({ landingSlug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { landingSlug } = await params;
  const canonical = toAbsoluteSiteUrl(
    `/${LEGACY_CATALOG_LANDING_CATEGORY_SLUGS.flancy}/${landingSlug}`,
  );
  return { title: "Перенаправление", alternates: { canonical } };
}

/** Старые URL `/flancy/*` → канонический SEO landing `/flansy-i-otvody/*`. */
export default async function LegacyFlancyLandingRedirect({ params }: PageProps) {
  const { landingSlug } = await params;
  const targetCategorySlug = LEGACY_CATALOG_LANDING_CATEGORY_SLUGS.flancy;
  if (!targetCategorySlug) notFound();

  const landing = CATALOG_LANDING_PAGES.find(
    (page) =>
      page.categorySlug === targetCategorySlug && page.slug === landingSlug,
  );
  if (!landing) notFound();

  permanentRedirect(`/${targetCategorySlug}/${landingSlug}`);
}
