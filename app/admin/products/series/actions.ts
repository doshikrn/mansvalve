"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/current-user";
import {
  buildMissingBlockPatch,
  listAllSeriesGroups,
  SERIES_SHARED_BLOCK_KEYS,
  seriesPageToBlocks,
} from "@/lib/catalog/series-inheritance";
import { revalidateSingleProductPaths } from "@/lib/catalog/revalidate-products";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import {
  findSeriesCatalogProduct,
  getSeriesPageGroupKey,
  getSeriesSeoPageForProduct,
} from "@/lib/seo-product-pages/product-series";
import type { ProductDetailBlockKey } from "@/lib/product-detail-blocks";
import { settleRevalidation } from "@/lib/revalidation";
import { patchProductDetailBlocks } from "@/lib/services/products";

const blockKeySchema = z
  .string()
  .refine((value): value is ProductDetailBlockKey =>
    (SERIES_SHARED_BLOCK_KEYS as readonly string[]).includes(value),
  );

const schema = z.object({
  groupKey: z.string().min(3),
  fields: z.array(blockKeySchema).min(1),
});

function withStatus(href: string, key: "msg" | "error", value: string): string {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${path}?${params.toString()}`;
}

function returnHref(groupKey?: string): string {
  const base = "/admin/products/series";
  return groupKey
    ? `${base}?previewSeries=${encodeURIComponent(groupKey)}`
    : base;
}

/**
 * Fill **missing** shared blocks for every SKU of a product series group
 * from its template. Never overwrites existing values. Safe to re-run.
 */
export async function applyMissingSeriesBlocksAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin("/admin/products/series");

  const parsed = schema.safeParse({
    groupKey: String(formData.get("groupKey") ?? ""),
    fields: formData.getAll("field").map((v) => String(v ?? "")),
  });
  if (!parsed.success) {
    redirect(withStatus(returnHref(), "error", "Не выбраны поля для применения."));
  }

  const { groupKey: targetGroupKey, fields } = parsed.data;
  const group = listAllSeriesGroups().find((g) => g.key === targetGroupKey);
  if (!group) {
    redirect(withStatus(returnHref(), "error", "Серия не найдена."));
  }

  const products = await getPublicCatalogProducts();

  let touched = 0;
  let skipped = 0;

  for (const page of group.pages) {
    const product = findSeriesCatalogProduct(products, page);
    if (!product) {
      skipped += 1;
      continue;
    }
    const templateBlocks = seriesPageToBlocks(page);
    const { patch, filledKeys } = buildMissingBlockPatch(
      product.detailBlocks ?? null,
      templateBlocks,
      fields,
    );
    if (filledKeys.length === 0) {
      skipped += 1;
      continue;
    }
    const updated = await patchProductDetailBlocks(Number(product.id), patch);
    if (!updated) {
      skipped += 1;
      continue;
    }
    touched += 1;
    const view = buildPublicProductView(product);
    revalidateSingleProductPaths({
      slug: updated.slug,
      categorySlug: updated.categorySlug,
      subcategorySlug: updated.subcategorySlug,
      canonicalPath: view.canonicalPath,
    });
  }

  if (touched > 0) {
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/sitemap.xml");
  }
  await settleRevalidation();

  const message =
    touched === 0
      ? `Изменений не потребовалось. Все SKU серии уже имеют выбранные блоки (пропущено ${skipped}).`
      : `Заполнено ${touched} SKU (поля: ${fields.join(", ")}). Пропущено: ${skipped}. Изменения применятся на сайте в течение нескольких минут.`;

  redirect(withStatus(returnHref(targetGroupKey), "msg", message));
}

/**
 * Helper exposed for the dashboard: returns the series template for a single
 * product (useful for an inline "посмотреть, что бы заполнилось" preview).
 */
export async function getSeriesPreviewForProductAction(
  productId: string,
): Promise<{ slug: string; templateLabel: string } | null> {
  const products = await getPublicCatalogProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  const page = getSeriesSeoPageForProduct(product);
  if (!page) return null;
  return {
    slug: page.slug,
    templateLabel: `${page.model} · DN${page.dn} · PN${page.pn} · ${getSeriesPageGroupKey(page)}`,
  };
}
