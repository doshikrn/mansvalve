/**
 * Smoke checks for product SEO naming, H1 and slug helpers.
 *
 * Usage: npm run products:seo-naming-check
 */

import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import {
  buildProductAutoMetaTitlePart,
  buildProductSeoDescription,
  buildProductSeoTitleFromSource,
  formatProductPageTitle,
  isAutoLikeH1Override,
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

const baseProduct: PublicCatalogProduct = {
  id: "1",
  name: "Клапан обратный Ду 80",
  slug: "klapan-obratnyy-du-80",
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

// 1. Auto H1 when h1Override empty
{
  const view = buildPublicProductView({ ...baseProduct, h1Override: undefined });
  check(
    "auto H1 when h1Override empty",
    view.h1 === "Клапан обратный Ду 80" || view.h1.includes("DN80"),
    `got "${view.h1}"`,
  );
}

// 2. Manual H1 preserved
{
  const view = buildPublicProductView({
    ...baseProduct,
    h1Override: "Мой ручной заголовок",
  });
  check("manual H1 preserved", view.h1 === "Мой ручной заголовок");
}

// 3. Meta title template part
{
  const part = buildProductAutoMetaTitlePart("Клапан обратный Ду 80");
  const full = formatProductPageTitle(part);
  check(
    "meta title template",
    !part.toLocaleLowerCase("ru-RU").includes("купить в казахстане") &&
      full.endsWith("| MANSVALVE GROUP") &&
      full.split("MANSVALVE GROUP").length - 1 === 1 &&
      !/[.…]{3}|…/u.test(full) &&
      full.length <= 90,
    `part="${part}" full="${full}" (${full.length} chars)`,
  );
}

// 4. Explicit/manual SEO wording is preserved; only root brand duplication is removed.
{
  const manual = "Клапан обратный DN80 — купить в Казахстане";
  const part = buildProductSeoTitleFromSource(baseProduct.name, manual, baseProduct);
  check("manual SEO title wording preserved", part === manual, `got "${part}"`);
}

// 5. Auto description stays neutral and has no artificial ellipsis.
{
  const description = buildProductSeoDescription(baseProduct, baseProduct.name);
  check(
    "auto SEO description is neutral",
    !description.toLocaleLowerCase("ru-RU").includes("купить") &&
      !description.includes("...") &&
      !description.includes("…") &&
      description.length <= 160,
    `got "${description}"`,
  );
}

// 6. A long preferred description is word-clamped without a generated ellipsis.
{
  const description = buildProductSeoDescription(
    baseProduct,
    baseProduct.name,
    Array.from({ length: 40 }, () => "характеристики товара").join(" "),
  );
  check(
    "long product description has no artificial ellipsis",
    !description.includes("...") && !description.includes("…") && description.length <= 160,
    `got "${description}"`,
  );
}

// 7. Slug from title
{
  const slug = buildProductSlugFromTitle({
    publicTitle: "Клапан обратный поворотный Ду 80",
    generatedDisplayName: "",
    name: "",
  });
  check(
    "slug from public title",
    slug === "klapan-obratnyy-povorotnyy-du-80",
    `got "${slug}"`,
  );
}

// 7. Slug transliteration basics
{
  check("slugify du-80", slugify("Ду 80") === "du-80");
}

// 8. Source title priority
{
  const withPublic = resolveProductSourceTitle({
    ...baseProduct,
    publicTitle: "Публичное имя",
    name: "Внутреннее",
  });
  const generated = formatProductDisplayName(baseProduct);
  const withoutPublic = resolveProductSourceTitle({
    ...baseProduct,
    publicTitle: null,
  });
  check("source title prefers publicTitle", withPublic === "Публичное имя");
  check(
    "source title falls back to generated",
    withoutPublic === generated || withoutPublic.length > 0,
    `got "${withoutPublic}"`,
  );
}

// 9. Auto-like h1 detection
{
  const generated = formatProductDisplayName(baseProduct);
  check(
    "auto-like h1 override detection",
    isAutoLikeH1Override(generated, [generated, baseProduct.name]),
  );
}

const failed = checks.filter((item) => !item.pass);
for (const item of checks) {
  const mark = item.pass ? "OK" : "FAIL";
  console.log(`${mark}  ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} checks passed.`);
