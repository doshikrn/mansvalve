/**
 * Production-safe verification for product SEO naming fix.
 *
 * Usage: npm run products:seo-production-check
 */

import { COMPANY_BRAND_SEO } from "@/lib/company";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { buildProductPreviewFromDraft } from "@/lib/catalog/product-preview-draft";
import {
  buildProductAutoMetaTitlePart,
  formatProductPageTitle,
  resolveProductAutoH1,
  resolveProductSourceTitle,
} from "@/lib/catalog/product-seo-naming";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";
import { buildProductSlugFromTitle } from "@/lib/products-import/slug-builder";
import { slugify } from "@/lib/services/slug";

type Check = { name: string; pass: boolean; detail?: string };
const checks: Check[] = [];

function check(name: string, pass: boolean, detail?: string) {
  checks.push({ name, pass, detail });
}

function resolveFormSlug(input: {
  existingSlug?: string;
  submittedSlug?: string;
  publicTitle?: string | null;
  generatedDisplayName: string;
  name: string;
}): string {
  const slugFromTitle = buildProductSlugFromTitle({
    publicTitle: input.publicTitle,
    generatedDisplayName: input.generatedDisplayName,
    name: input.name,
  });
  return input.existingSlug
    ? input.submittedSlug
      ? slugify(input.submittedSlug)
      : input.existingSlug
    : slugify(input.submittedSlug ?? "") || slugFromTitle || slugify(input.name);
}

const newProductName = "Клапан обратный поворотный Ду 80";
const newProductSlug = "klapan-obratnyy-povorotnyy-du-80";

const newProductBase: PublicCatalogProduct = {
  id: "draft",
  name: newProductName,
  publicTitle: newProductName,
  slug: newProductSlug,
  category: "klapany",
  subcategory: "podemnye",
  subcategoryName: "Подъёмные",
  categoryName: "Клапаны",
  dn: 80,
  pn: undefined,
  thread: undefined,
  material: "",
  connectionType: "",
  controlType: "",
  model: "",
  price: undefined,
  priceByRequest: true,
  weight: undefined,
  specs: {},
  shortDescription: "",
};

// 1. Brand casing
check("COMPANY_BRAND_SEO is MANSVALVE GROUP", COMPANY_BRAND_SEO === "MANSVALVE GROUP");

// 2. New product slug
{
  const slug = buildProductSlugFromTitle({
    publicTitle: newProductName,
    generatedDisplayName: "",
    name: newProductName,
  });
  check("new product slug from public title", slug === newProductSlug, `got "${slug}"`);
}

// 2. New product H1 + meta (public view)
{
  const view = buildPublicProductView({ ...newProductBase, h1Override: undefined });
  const titlePart = buildProductAutoMetaTitlePart(resolveProductSourceTitle(newProductBase));
  const browserTitle = `${view.seoTitle} | ${COMPANY_BRAND_SEO}`;
  const previewTitle = formatProductPageTitle(view.seoTitle);

  check(
    "new product auto H1 from public title",
    view.h1 === newProductName,
    `got "${view.h1}"`,
  );
  check(
    "new product meta title part",
    view.seoTitle.includes("купить в Казахстане"),
    `got "${view.seoTitle}"`,
  );
  check(
    "new product browser title brand",
    browserTitle.endsWith("| MANSVALVE GROUP"),
    `got "${browserTitle}"`,
  );
  check(
    "admin preview title matches browser title",
    previewTitle === browserTitle,
    `preview="${previewTitle}" browser="${browserTitle}"`,
  );
  check(
    "title part equals auto meta builder",
    view.seoTitle === titlePart,
    `view="${view.seoTitle}" part="${titlePart}"`,
  );
}

// 3. Existing product: slug unchanged when title changes
{
  const existingSlug = "legacy-klapan-80";
  const generated = formatProductDisplayName({
    name: "Старое внутреннее имя",
    category: "klapany",
    categoryName: "Клапаны",
    dn: 80,
  });
  const slugAfterTitleChange = resolveFormSlug({
    existingSlug,
    submittedSlug: existingSlug,
    publicTitle: "Новое публичное название",
    generatedDisplayName: generated,
    name: "Новое внутреннее имя",
  });
  check(
    "existing product slug not auto-changed",
    slugAfterTitleChange === existingSlug,
    `got "${slugAfterTitleChange}"`,
  );
}

// 3. Auto H1 updates when publicTitle changes (empty h1Override)
{
  const view = buildPublicProductView({
    ...newProductBase,
    publicTitle: "Новый публичный заголовок",
    h1Override: undefined,
  });
  check(
    "auto H1 follows new publicTitle",
    view.h1 === "Новый публичный заголовок",
    `got "${view.h1}"`,
  );
}

// 3. Manual H1 preserved
{
  const view = buildPublicProductView({
    ...newProductBase,
    publicTitle: "Новый публичный заголовок",
    h1Override: "Ручной H1 менеджера",
  });
  check("manual H1 not overwritten", view.h1 === "Ручной H1 менеджера");
}

// 4. Reset H1 to auto (draft preview)
{
  const before = buildProductPreviewFromDraft({
    name: newProductName,
    publicTitle: newProductName,
    h1Override: "Ручной H1",
    slug: newProductSlug,
    categorySlug: "klapany",
    categoryName: "Клапаны",
  });
  const after = buildProductPreviewFromDraft({
    name: newProductName,
    publicTitle: newProductName,
    h1Override: "",
    slug: newProductSlug,
    categorySlug: "klapany",
    categoryName: "Клапаны",
  });
  check("reset H1: manual before", before.h1IsManual === true);
  check("reset H1: auto after clear", after.h1IsManual === false);
  check(
    "reset H1: preview uses auto value",
    after.h1 ===
      resolveProductAutoH1({
        name: newProductBase.name,
        publicTitle: newProductBase.publicTitle,
        category: newProductBase.category,
        categoryName: newProductBase.categoryName,
        dn: newProductBase.dn,
      }),
    `got "${after.h1}"`,
  );
}

// 5. Explicit slug regeneration
{
  const existingSlug = "old-slug";
  const regenerated = buildProductSlugFromTitle({
    publicTitle: newProductName,
    generatedDisplayName: formatProductDisplayName(newProductBase),
    name: newProductName,
  });
  const slugAfterExplicit = resolveFormSlug({
    existingSlug,
    submittedSlug: regenerated,
    publicTitle: newProductName,
    generatedDisplayName: formatProductDisplayName(newProductBase),
    name: newProductName,
  });
  check(
    "explicit slug change only when submitted",
    slugAfterExplicit === newProductSlug,
    `got "${slugAfterExplicit}"`,
  );
}

// 6. Admin preview vs public view parity
{
  const product = { ...newProductBase, h1Override: undefined };
  const publicView = buildPublicProductView(product);
  const draftView = buildProductPreviewFromDraft({
    name: product.name,
    publicTitle: product.publicTitle ?? "",
    h1Override: "",
    slug: product.slug,
    categorySlug: product.category,
    categoryName: product.categoryName,
    subcategorySlug: product.subcategory,
    subcategoryName: product.subcategoryName,
    dn: product.dn,
  });
  check("preview H1 matches public H1", draftView.h1 === publicView.h1);
  check("preview seo title matches public seo title", draftView.seoTitle === publicView.seoTitle);
  check(
    "preview seo full title matches browser",
    draftView.seoTitleFull === `${publicView.seoTitle} | ${COMPANY_BRAND_SEO}`,
  );
}

const failed = checks.filter((item) => !item.pass);
for (const item of checks) {
  const mark = item.pass ? "OK" : "FAIL";
  console.log(`${mark}  ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} production check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} production-safe checks passed.`);
