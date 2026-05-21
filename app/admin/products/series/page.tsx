import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import {
  buildMissingBlockPatch,
  computeSeriesDrift,
  gateValvePageToBlocks,
  listAllSeriesGroups,
  SERIES_BLOCK_LABEL,
  SERIES_BLOCK_STATE_LABEL,
  SERIES_SHARED_BLOCK_KEYS,
  type SeriesBlockState,
} from "@/lib/catalog/series-inheritance";
import { isDatabaseConfigured } from "@/lib/db/client";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import {
  findGateValveCatalogProduct,
  GATE_VALVE_SEO_PAGES,
} from "@/lib/seo-product-pages/gate-valves";
import type { ProductDetailBlockKey } from "@/lib/product-detail-blocks";

import { applyMissingSeriesBlocksAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_TONE: Record<SeriesBlockState, "auto" | "manual" | "readonly" | "generated"> = {
  inherited: "auto",
  match: "readonly",
  partial: "manual",
  override: "manual",
};

type SearchParams = Record<string, string | string[] | undefined>;

function readString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function readMulti(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

export default async function ProductSeriesAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin("/admin/products/series");

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена. Запустите миграции.
      </p>
    );
  }

  const query = await searchParams;
  const flash = readString(query.msg);
  const error = readString(query.error);
  const previewSeries = readString(query.previewSeries);
  const previewFieldsRaw = readMulti(query.fields);
  const previewFields = previewFieldsRaw.filter(
    (value): value is ProductDetailBlockKey =>
      (SERIES_SHARED_BLOCK_KEYS as readonly string[]).includes(value),
  );

  const products = await getPublicCatalogProducts();
  const groups = listAllSeriesGroups();

  const totals = GATE_VALVE_SEO_PAGES.reduce(
    (acc, page) => {
      const exists = Boolean(findGateValveCatalogProduct(products, page));
      return {
        total: acc.total + 1,
        present: acc.present + (exists ? 1 : 0),
      };
    },
    { total: 0, present: 0 },
  );
  const missingCount = totals.total - totals.present;

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs
        items={[
          { label: "Товары", href: "/admin/products" },
          { label: "Серии и шаблоны" },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Серии задвижек: аудит и bulk-операции
        </h1>
        <p className="text-sm text-slate-600">
          Read-only обзор шаблонов серий + безопасное заполнение пустых
          shared-блоков из шаблона. Никакие override-значения не перезаписываются.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <AdminStatusBadge tone="manual">{totals.present} в БД</AdminStatusBadge>
          <AdminStatusBadge tone="auto">{missingCount} нет SKU</AdminStatusBadge>
          <span className="text-xs text-slate-500">шаблонных страниц: {totals.total}</span>
        </div>
      </header>

      {flash ? <AdminInlineNotice tone="manual">{flash}</AdminInlineNotice> : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      <AdminInlineNotice tone="auto">
        Apply-to-series заполняет только <strong>пустые</strong> блоки SKU из шаблона.
        Если у товара уже есть значение в выбранном блоке — оно сохранится без изменений.
        Документация: <code>docs/catalog-templates.md</code>.
      </AdminInlineNotice>

      <div className="space-y-6">
        {groups.map((group) => {
          const rows = group.pages
            .slice()
            .sort((a, b) => a.dn - b.dn)
            .map((page) => {
              const product = findGateValveCatalogProduct(products, page);
              const templateBlocks = gateValvePageToBlocks(page);
              const drift = product
                ? computeSeriesDrift(product, { page, blocks: templateBlocks })
                : null;
              return { page, product, drift, templateBlocks } as const;
            });

          const groupMissing = rows.filter((row) => !row.product).length;
          const groupDrift = rows.filter((row) => row.drift?.hasDrift).length;
          const groupFallback = rows.filter((row) => row.drift?.isFullFallback).length;
          const isPreviewActive = previewSeries === group.key;

          // For preview, compute how many SKUs would be filled per chosen field.
          const previewRows = isPreviewActive
            ? rows
                .map((row) => {
                  if (!row.product || previewFields.length === 0) return null;
                  const { filledKeys } = buildMissingBlockPatch(
                    row.product.detailBlocks ?? null,
                    row.templateBlocks,
                    previewFields,
                  );
                  if (filledKeys.length === 0) return null;
                  return {
                    page: row.page,
                    product: row.product,
                    filledKeys,
                  };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null)
            : [];

          return (
            <section
              key={group.key}
              className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-slate-50/60 px-4 py-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-slate-900">{group.label}</h2>
                  <p className="text-xs text-slate-500">
                    series: <code>{group.series}</code> · model:{" "}
                    <code>{group.model}</code>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {groupFallback > 0 ? (
                    <AdminStatusBadge tone="auto">
                      {groupFallback} fallback-only
                    </AdminStatusBadge>
                  ) : null}
                  {groupDrift > 0 ? (
                    <AdminStatusBadge tone="manual">
                      {groupDrift} drift
                    </AdminStatusBadge>
                  ) : null}
                  <AdminStatusBadge tone={groupMissing > 0 ? "auto" : "readonly"}>
                    {groupMissing > 0
                      ? `${groupMissing} без SKU`
                      : `${rows.length} в БД`}
                  </AdminStatusBadge>
                </div>
              </header>

              {/* Bulk apply: preview + confirm. */}
              <form
                method="get"
                className="space-y-3 border-b border-[#E2E8F0] bg-slate-50/30 px-4 py-3"
              >
                <input type="hidden" name="previewSeries" value={group.key} />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Apply-to-series:
                  </span>
                  {SERIES_SHARED_BLOCK_KEYS.map((key) => (
                    <label
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        name="fields"
                        value={key}
                        defaultChecked={isPreviewActive && previewFields.includes(key)}
                        className="h-3.5 w-3.5"
                      />
                      {SERIES_BLOCK_LABEL[key]}
                    </label>
                  ))}
                  <Button type="submit" size="sm" variant="outline">
                    Превью
                  </Button>
                </div>
              </form>

              {isPreviewActive ? (
                <div className="border-b border-[#E2E8F0] bg-amber-50/50 px-4 py-3">
                  {previewFields.length === 0 ? (
                    <p className="text-xs text-amber-900">
                      Выберите хотя бы один блок для предпросмотра.
                    </p>
                  ) : previewRows.length === 0 ? (
                    <p className="text-xs text-emerald-900">
                      Заполнять нечего: все SKU серии уже содержат значения в
                      выбранных блоках, либо в серии нет товаров.
                    </p>
                  ) : (
                    <form action={applyMissingSeriesBlocksAction} className="space-y-3">
                      <input type="hidden" name="groupKey" value={group.key} />
                      {previewFields.map((field) => (
                        <input key={field} type="hidden" name="field" value={field} />
                      ))}
                      <div className="space-y-1.5 text-xs text-amber-950">
                        <p className="font-semibold">
                          Будет заполнено {previewRows.length} SKU. Поля:{" "}
                          {previewFields.map((f) => SERIES_BLOCK_LABEL[f]).join(", ")}.
                        </p>
                        <ul className="ml-4 list-disc space-y-0.5">
                          {previewRows.slice(0, 12).map((row) => (
                            <li key={row.product.id}>
                              <code>{row.product.slug}</code> ·{" "}
                              {row.filledKeys
                                .map((k) => SERIES_BLOCK_LABEL[k])
                                .join(", ")}
                            </li>
                          ))}
                          {previewRows.length > 12 ? (
                            <li className="text-amber-800">
                              … и ещё {previewRows.length - 12}
                            </li>
                          ) : null}
                        </ul>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit" size="sm">
                          Применить ({previewRows.length})
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href="/admin/products/series">Отмена</Link>
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              ) : null}

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2">DN/PN</th>
                    <th className="px-4 py-2">SEO-страница</th>
                    <th className="px-4 py-2">Товар</th>
                    <th className="px-4 py-2">Inheritance / drift</th>
                    <th className="px-4 py-2 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ page, product, drift }) => (
                    <tr key={page.slug} className="border-b border-[#E2E8F0] last:border-0 align-top">
                      <td className="px-4 py-2 font-medium text-slate-700">
                        DN{page.dn} · PN{page.pn}
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          href={`/${page.categorySlug}/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-site-primary hover:underline"
                        >
                          /{page.categorySlug}/{page.slug}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        {product ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-800">
                              {product.publicTitle ||
                                formatProductDisplayName(product) ||
                                product.slug}
                            </span>
                            <code className="text-xs text-slate-500">/{product.slug}</code>
                          </div>
                        ) : (
                          <AdminStatusBadge tone="auto">FALLBACK</AdminStatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {drift ? (
                          <div className="flex flex-wrap gap-1">
                            {drift.blocks.map((block) => (
                              <AdminStatusBadge key={block.key} tone={STATE_TONE[block.state]}>
                                {SERIES_BLOCK_LABEL[block.key]}:{" "}
                                {SERIES_BLOCK_STATE_LABEL[block.state]}
                              </AdminStatusBadge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {product ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/products?q=${encodeURIComponent(product.slug)}`}>
                              Открыть
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/admin/products/new?returnTo=${encodeURIComponent("/admin/products/series")}`}
                            >
                              Создать
                            </Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Используйте «Превью» → «Применить», чтобы заполнить пустые блоки SKU из
        шаблона серии. Ручные значения не перезаписываются.
      </p>
    </div>
  );
}
