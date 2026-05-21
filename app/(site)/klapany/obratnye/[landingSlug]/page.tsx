import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { getSeriesPagePath, getSeriesSeoPageByPath } from "@/lib/seo-product-pages/product-series";
import { toAbsoluteSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ landingSlug: string }>;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { landingSlug } = await params;
  const page = getSeriesSeoPageByPath(`/klapany/obratnye/${landingSlug}`);
  if (!page) return { title: "Страница не найдена" };
  const canonical = toAbsoluteSiteUrl(getSeriesPagePath(page));
  return { title: "Перенаправление…", alternates: { canonical } };
}

/** Старые URL `/klapany/obratnye/*` → канонический путь серии (сейчас `/catalog/klapany/...`). */
export default async function LegacyKlapanyObratnyeRedirect({ params }: PageProps) {
  const { landingSlug } = await params;
  const page = getSeriesSeoPageByPath(`/klapany/obratnye/${landingSlug}`);
  if (!page) notFound();
  permanentRedirect(getSeriesPagePath(page));
}
