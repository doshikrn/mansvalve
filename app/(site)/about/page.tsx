import type { Metadata } from "next";
import { COMPANY, COMPANY_BRAND_SEO } from "@/lib/company";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import {
  applyAboutCounts,
  applyPlaceholders,
  MARKETING_CATALOG_LINK_COUNT,
  resolveAboutStatDisplayValue,
} from "@/lib/site-content/models";
import { resolveAboutCopy, resolveAboutPage } from "@/lib/site-content/public";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { AboutIntro } from "@/components/sections/about/AboutIntro";
import { AboutIndustries } from "@/components/sections/about/AboutIndustries";
import { AboutCategories } from "@/components/sections/about/AboutCategories";
import { AboutWhyUs } from "@/components/sections/about/AboutWhyUs";
import { AboutStats } from "@/components/sections/about/AboutStats";
import { AboutValues } from "@/components/sections/about/AboutValues";
import { AboutCTA } from "@/components/sections/about/AboutCTA";
import { warnInvalidMediaUrl } from "@/lib/media-url";

const ABOUT_PARAGRAPHS = [
  "MANSVALVE GROUP — современная казахстанская компания, более 5 лет работающая на рынке комплексных поставок промышленной трубопроводной арматуры, инженерного оборудования и комплектующих для предприятий Казахстана и стран СНГ.",
  "Мы сотрудничаем с государственными организациями, промышленными предприятиями, строительными и подрядными компаниями, объектами энергетики, водоснабжения, нефтегазового сектора и другими стратегически важными направлениями экономики.",
  "Для наших клиентов мы являемся не просто поставщиком, а надежным партнером, который понимает цену времени, важность качества продукции и ответственность за соблюдение сроков.",
] as const;

const SUPPLY_DIRECTIONS = [
  "Задвижки чугунные и стальные",
  "Затворы дисковые",
  "Краны шаровые",
  "Обратные клапаны",
  "Фланцы и соединительные элементы",
  "Электроприводы",
  "Детали трубопроводов",
  "Комплектующие и нестандартные решения под проект",
] as const;

const WHY_US_ITEMS = [
  "Более 5 лет опыта на рынке",
  "Официальная работа с НДС",
  "Полный пакет документов и сертификатов",
  "Поставка со склада и под заказ",
  "Быстрый расчет коммерческого предложения",
  "Подбор оборудования и технические консультации",
  "Доставка по всему Казахстану и СНГ",
  "Контроль качества на каждом этапе",
  "Индивидуальный подход к каждому заказчику",
] as const;

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
  const [categories, products, aboutCopy, about] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicCatalogProducts(),
    resolveAboutCopy(),
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

  const headerLead = "MANSVALVE GROUP — надежный партнер в сфере промышленной арматуры и инженерных поставок";
  const overviewParagraphs = ABOUT_PARAGRAPHS.slice();
  const h1 = "О компании";
  const whyTitle = "Почему выбирают MANSVALVE GROUP";
  const productGroupsLine = applyAboutCounts(aboutCopy.productGroupsLine, {
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

  return (
    <div className="min-h-screen bg-white">
      <AboutHero
        breadcrumbCurrent={about.breadcrumbCurrent}
        title={h1}
        subtitle={headerLead}
        description={overviewParagraphs[0] ?? applyPlaceholders(aboutCopy.headerLead, COMPANY.name)}
        heroImages={heroImages}
      />
      <AboutIntro title="MANSVALVE GROUP" paragraphs={overviewParagraphs} />
      <AboutIndustries />
      <AboutCategories
        title="Основные направления поставок"
        description={productGroupsLine}
        linkLabel={about.catalogLinkLabel}
        categories={topCategories}
        directions={[...SUPPLY_DIRECTIONS]}
      />
      <AboutWhyUs title={whyTitle} items={[...WHY_US_ITEMS]} />
      <AboutStats slots={about.statSlots} values={statValues} />
      <AboutValues />
      <AboutCTA
        title={aboutCopy.ctaTitle}
        subtitle={aboutCopy.ctaSubtitle}
        catalogLabel={about.ctaCatalogLabel}
        contactsLabel={about.ctaContactsLabel}
      />
    </div>
  );
}
