import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductShowcaseCarousel } from "@/components/sections/ProductShowcaseCarousel";
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
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="site-eyebrow">{copy.sectionEyebrow}</p>
            <h2 className="site-heading mt-2">{copy.sectionTitle}</h2>
            <p className="site-copy mt-2 max-w-[760px]">{copy.sectionLead}</p>
          </div>
          <Link href={copy.sectionCtaHref} className="site-link-button self-start sm:self-auto">
            {copy.sectionCtaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductShowcaseCarousel
          products={hits}
          eyebrow={copy.carouselEyebrow}
          title={copy.carouselTitle}
          linkLabel={copy.carouselLinkLabel}
          linkHref={copy.carouselLinkHref}
          variant="catalog"
          catalogBadgeLabel={copy.carouselBadgeLabel}
        />
      </div>
    </section>
  );
}
