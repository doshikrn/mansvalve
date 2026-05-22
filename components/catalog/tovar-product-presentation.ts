import type { PublicCatalogCategory, PublicCatalogProduct } from "@/lib/public-catalog";
import { getPublicCategoryById } from "@/lib/public-catalog";
import { buildPublicProductView, type PublicProductView } from "@/lib/public-catalog/product-view";
import { buildProductBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/structured-data";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { buildCompanyProductInquiryWhatsAppUrl } from "@/lib/company";
import { warnInvalidMediaUrl } from "@/lib/media-url";

export type TovarProductPageData = {
  product: PublicCatalogProduct;
  category: PublicCatalogCategory | null;
  related: PublicCatalogProduct[];
  view: PublicProductView;
  waUrl: string;
  breadcrumbJsonLd: ReturnType<typeof buildProductBreadcrumbJsonLd>;
  productJsonLd: ReturnType<typeof buildProductJsonLd>;
  showActuatorBlock: boolean;
  actuatorHref: string;
  formattedPrice: string | null;
  productDocuments: ReadonlyArray<{
    id: string;
    label: string;
    doc: { url: string } | undefined;
  }>;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

function getRelatedProducts(
  allProducts: PublicCatalogProduct[],
  productId: string,
  subcategory: string,
  category: string,
  count: number,
) {
  let pool = allProducts.filter((p) => p.subcategory === subcategory && p.id !== productId);
  if (pool.length < count) {
    const extra = allProducts.filter(
      (p) =>
        p.category === category &&
        p.id !== productId &&
        !pool.some((r) => r.id === p.id),
    );
    pool = [...pool, ...extra];
  }
  return pool.slice(0, count);
}

function getActuatorSubcategorySlug(
  categoryId: string,
  categories: PublicCatalogCategory[],
): string | undefined {
  const targetSubcategoryIdByCategory: Record<string, string> = {
    zadvizhki: "elektroprivody-dlya-zadvizhek",
    zatvory: "elektroprivody-dlya-zatvorov",
    klapany: "elektroprivody-dlya-klapanov",
  };
  const subcategoryId = targetSubcategoryIdByCategory[categoryId];
  if (!subcategoryId) return undefined;

  for (const category of categories) {
    const subcategory = category.subcategories.find((sub) => sub.id === subcategoryId);
    if (subcategory) return subcategory.slug;
  }
  return undefined;
}

export async function prepareTovarProductPageData(
  product: PublicCatalogProduct,
  categories: PublicCatalogCategory[],
  allProducts: PublicCatalogProduct[],
): Promise<TovarProductPageData> {
  const category = (await getPublicCategoryById(product.category)) ?? null;
  const related = getRelatedProducts(
    allProducts,
    product.id,
    product.subcategory,
    product.category,
    4,
  );
  const view = buildPublicProductView(product);
  const productName = view.displayName;
  const waUrl = buildCompanyProductInquiryWhatsAppUrl(productName, {
    dn: product.dn,
    pn: product.pn,
  });
  const breadcrumbJsonLd = buildProductBreadcrumbJsonLd(product);
  const productJsonLd = buildProductJsonLd(product);
  const actuatorSubcategorySlug = getActuatorSubcategorySlug(product.category, categories);
  const showActuatorBlock =
    Boolean(actuatorSubcategorySlug) && product.controlType !== "Электропривод";
  const actuatorHref = actuatorSubcategorySlug
    ? (() => {
        for (const c of categories) {
          const sub = c.subcategories.find((s) => s.slug === actuatorSubcategorySlug);
          if (sub) return catalogSubcategoryPath(c.slug, sub.slug);
        }
        return `/catalog/subcategory/${actuatorSubcategorySlug}`;
      })()
    : catalogCategoryPath("elektroprivody");
  warnInvalidMediaUrl(view.primaryImageUrl, `ProductPage.hero:${product.slug}`);
  const formattedPrice =
    product.price && !product.priceByRequest ? formatPrice(product.price) : null;
  const productDocuments = [
    {
      id: "specification",
      label: "Скачать файл-спецификацию",
      doc: product.documents?.specification?.url
        ? { url: product.documents.specification.url }
        : undefined,
    },
    {
      id: "questionnaire",
      label: "Скачать опросный лист",
      doc: product.documents?.questionnaire?.url
        ? { url: product.documents.questionnaire.url }
        : undefined,
    },
    {
      id: "documentation",
      label: "Документация",
      doc: product.documents?.documentation?.url
        ? { url: product.documents.documentation.url }
        : undefined,
    },
  ] as const;

  return {
    product,
    category,
    related,
    view,
    waUrl,
    breadcrumbJsonLd,
    productJsonLd,
    showActuatorBlock,
    actuatorHref,
    formattedPrice,
    productDocuments,
  };
}
