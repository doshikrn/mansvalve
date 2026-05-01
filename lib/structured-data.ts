import type {
  PublicCatalogCategory as Category,
  PublicCatalogProduct as Product,
  PublicCatalogSubcategory as Subcategory,
} from "@/lib/public-catalog"
import { getSiteBaseUrl } from "@/lib/site-url"
import { COMPANY } from "@/lib/company"

interface BreadcrumbItem {
  name: string
  path: string
}

interface ItemListEntry {
  position: number
  name: string
  path: string
}

function toAbsoluteUrl(path: string): string {
  const base = getSiteBaseUrl()
  return new URL(path, `${base}/`).toString()
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: toAbsoluteUrl("/"),
    logo: toAbsoluteUrl("/icon.png"),
    image: toAbsoluteUrl("/icon.png"),
    email: COMPANY.email,
    telephone: COMPANY.phoneE164,
    address: {
      "@type": "PostalAddress",
      addressLocality: COMPANY.address.city,
      streetAddress: COMPANY.address.street,
      addressCountry: "KZ",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: COMPANY.phoneE164,
        email: COMPANY.email,
        areaServed: "KZ",
      },
    ],
    areaServed: "KZ",
  }
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY.name,
    url: toAbsoluteUrl("/"),
    inLanguage: "ru-KZ",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: toAbsoluteUrl("/catalog?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function buildItemListJsonLd(items: ItemListEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      url: toAbsoluteUrl(item.path),
      name: item.name,
    })),
  }
}

interface CatalogItemListOptions {
  startPosition?: number
  maxItems?: number
}

interface CollectionPageOptions {
  name: string
  description: string
  path: string
}

export function buildCatalogItemListJsonLd(
  products: Product[],
  options: CatalogItemListOptions = {},
): Record<string, unknown> {
  const startPosition = options.startPosition ?? 1
  const maxItems = options.maxItems ?? 20
  const limitedProducts = products.slice(0, Math.max(0, maxItems))

  const entries: ItemListEntry[] = limitedProducts.map((product, index) => ({
    position: startPosition + index,
    name: product.name,
    path: `/catalog/${product.slug}`,
  }))

  return buildItemListJsonLd(entries)
}

export function buildCollectionPageJsonLd(
  options: CollectionPageOptions,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: toAbsoluteUrl(options.path),
    isPartOf: {
      "@type": "WebSite",
      name: COMPANY.name,
      url: toAbsoluteUrl("/"),
    },
  }
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}

export function buildCategoryBreadcrumbJsonLd(category: Category): Record<string, unknown> {
  return buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
    { name: category.name, path: `/catalog/category/${category.slug}` },
  ])
}

export function buildSubcategoryBreadcrumbJsonLd(
  category: Category,
  subcategory: Subcategory,
): Record<string, unknown> {
  return buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
    { name: category.name, path: `/catalog/category/${category.slug}` },
    { name: subcategory.name, path: `/catalog/subcategory/${subcategory.slug}` },
  ])
}

export function buildProductBreadcrumbJsonLd(product: Product): Record<string, unknown> {
  return buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
    { name: product.categoryName, path: `/catalog/category/${product.category}` },
    { name: product.name, path: `/catalog/${product.slug}` },
  ])
}

export function buildProductJsonLd(product: Product): Record<string, unknown> {
  const additionalProperty: Array<Record<string, string>> = []

  if (product.subcategoryName) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Подкатегория",
      value: product.subcategoryName,
    })
  }

  if (product.dn != null) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "DN",
      value: String(product.dn),
    })
  }

  if (product.pn != null) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "PN",
      value: String(product.pn),
    })
  }

  if (product.thread) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Резьба",
      value: product.thread,
    })
  }

  const standard = product.specs["Стандарт"]
  if (standard) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Стандарт",
      value: standard,
    })
  }

  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.id,
    category: product.categoryName,
    material: product.material,
    url: toAbsoluteUrl(`/catalog/${product.slug}`),
  }

  if (additionalProperty.length > 0) {
    result.additionalProperty = additionalProperty
  }

  if (product.price != null && !product.priceByRequest) {
    result.offers = {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: String(product.price),
      url: toAbsoluteUrl(`/catalog/${product.slug}`),
      seller: {
        "@type": "Organization",
        name: COMPANY.name,
      },
    }
  }

  return result
}
