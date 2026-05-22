import type { Metadata } from "next";
import { COMPANY, COMPANY_BRAND_SEO } from "@/lib/company";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
} from "@/lib/public-catalog";
import {
  applyAboutCounts,
  applyPlaceholders,
  MARKETING_CATALOG_LINK_COUNT,
  resolveAboutStatDisplayValue,
} from "@/lib/site-content/models";
import { resolveAboutPage } from "@/lib/site-content/public";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { AboutIntro } from "@/components/sections/about/AboutIntro";
import { AboutIndustries } from "@/components/sections/about/AboutIndustries";
import { AboutCategories } from "@/components/sections/about/AboutCategories";
import { AboutWhyUs } from "@/components/sections/about/AboutWhyUs";
import { AboutStats } from "@/components/sections/about/AboutStats";
import { AboutValues } from "@/components/sections/about/AboutValues";
import { AboutCTA } from "@/components/sections/about/AboutCTA";
import { warnInvalidMediaUrl } from "@/lib/media-url";

export async function generateMetadata(): Promise<Metadata> {
  const about = await resolveAboutPage();
  return {
    title: about.metaTitle,
    description: about.metaDescription,
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      title: about.metaTitle,
      description: about.metaDescription,
      url: "/about",
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: about.metaTitle,
      description: about.metaDescription,
    },
  };
}

export default async function AboutPage() {
  const [categories, products, about] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicCatalogListingProducts(),
    resolveAboutPage(),
  ]);

  const headerImageList = about.headerImageSrc
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
  const galleryFromAbout = "heroGalleryImageSrcs" in about ? about.heroGalleryImageSrcs : [];
  const heroImages = [...headerImageList, ...galleryFromAbout].slice(0, 5);
  heroImages.forEach((imageSrc, index) => {
    warnInvalidMediaUrl(imageSrc, `AboutPage:heroImage:${index}`);
  });

  const headerLead = applyPlaceholders(about.headerLead, COMPANY.name);
  const overviewParagraphs = about.overviewParagraphs.map((paragraph) =>
    applyPlaceholders(paragraph, COMPANY.name),
  );
  const h1 = applyPlaceholders(about.h1Template, COMPANY.name);
  const whyTitle = applyPlaceholders(about.whyChooseTitleTemplate, COMPANY.name);
  const productGroupsLine = applyAboutCounts(about.productGroupsLine, {
    company: COMPANY.name,
    categories: categories.length,
    products: products.length,
    productsMarketing: MARKETING_CATALOG_LINK_COUNT,
  });
  const statValues = about.statSlots.map((slot) =>
    resolveAboutStatDisplayValue(slot, {
      marketingDisplay: MARKETING_CATALOG_LINK_COUNT,
      categories: categories.length,
    }),
  );
  const topCategories = categories.slice(0, 8);
  const supplyDirections = topCategories.map((category) => category.name);

  return (
    <div className="min-h-screen bg-white">
      <AboutHero
        breadcrumbCurrent={about.breadcrumbCurrent}
        title={h1}
        subtitle={headerLead}
        description={overviewParagraphs[0] ?? headerLead}
        imageAlt={about.headerImageAlt}
        heroImages={heroImages}
      />
      <AboutIntro
        title={applyPlaceholders(about.whoWeTitle, COMPANY.name)}
        paragraphs={overviewParagraphs.slice(1)}
        cards={about.b2bCards}
      />
      <AboutIndustries />
      <AboutCategories
        title={applyPlaceholders(about.whatWeSupplyTitle, COMPANY.name)}
        description={productGroupsLine}
        linkLabel={about.catalogLinkLabel}
        categories={topCategories}
        directions={supplyDirections}
      />
      <AboutWhyUs title={whyTitle} items={about.advantages} />
      <AboutStats slots={about.statSlots} values={statValues} />
      <AboutValues standardsEyebrow={about.standardsEyebrow} certifications={about.certifications} />
      <AboutCTA
        title={about.ctaTitle}
        subtitle={about.ctaSubtitle}
        catalogLabel={about.ctaCatalogLabel}
        contactsLabel={about.ctaContactsLabel}
      />
    </div>
  );
}
