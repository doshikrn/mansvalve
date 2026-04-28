import { CategoriesClient } from "@/components/sections/CategoriesClient";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import { pickProductsBySlugs } from "@/lib/product-showcase";
import { resolveHomeCategories, resolveHomeProductShowcases } from "@/lib/site-content/public";

export async function Categories() {
  const [products, showcaseContent, copy] = await Promise.all([
    getPublicCatalogProducts(),
    resolveHomeProductShowcases(),
    resolveHomeCategories(),
  ]);

  const hits = pickProductsBySlugs(products, showcaseContent.catalogHitSlugs, 7);

  return (
    <CategoriesClient
      products={hits}
      copy={{
        sectionEyebrow: copy.sectionEyebrow,
        sectionTitle: copy.sectionTitle,
        sectionLead: copy.sectionLead,
        sectionCtaHref: copy.sectionCtaHref,
        sectionCtaLabel: copy.sectionCtaLabel,
        carouselEyebrow: copy.carouselEyebrow,
        carouselTitle: copy.carouselTitle,
        carouselLinkLabel: copy.carouselLinkLabel,
        carouselLinkHref: copy.carouselLinkHref,
        carouselBadgeLabel: copy.carouselBadgeLabel,
      }}
    />
  );
}
