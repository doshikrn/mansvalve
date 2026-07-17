export type CatalogTaxonomySeoInput = {
  name: string;
  h1Override?: string | null;
  seoTitle?: string | null;
  seoMetaDescription?: string | null;
  autoH1?: string | null;
  autoTitle: string;
  autoDescription: string;
};

export type ResolvedCatalogTaxonomySeo = {
  h1: string;
  title: string;
  description: string;
};

/** One precedence rule for category and subcategory public SEO fields. */
export function resolveCatalogTaxonomySeo(
  input: CatalogTaxonomySeoInput,
): ResolvedCatalogTaxonomySeo {
  return {
    h1: meaningful(input.h1Override) || meaningful(input.autoH1) || input.name.trim(),
    title: meaningful(input.seoTitle) || input.autoTitle.trim(),
    description:
      meaningful(input.seoMetaDescription) || input.autoDescription.trim(),
  };
}

function meaningful(value: string | null | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}
