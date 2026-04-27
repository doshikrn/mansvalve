import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import { getCategoryVisual } from "@/lib/category-visuals";

export async function Categories() {
  const [categories, products] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicCatalogProducts(),
  ]);

  const productCounts: Record<string, number> = products.reduce<Record<string, number>>(
    (acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const recommendedCategoryId = categories.reduce<{ id: string; count: number }>(
    (top, category) => {
      const count = productCounts[category.id] ?? 0;
      return count > top.count ? { id: category.id, count } : top;
    },
    { id: categories[0]?.id ?? "", count: 0 },
  ).id;

  return (
    <section className="bg-gradient-to-b from-slate-100/95 via-[#eef2f7] to-slate-100 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Каталог MANSVALVE GROUP
            </h2>
            <p className="mt-2 max-w-[700px] text-base leading-relaxed text-slate-700 sm:text-lg">
              700+ позиций в наличии и под заказ: задвижки, фланцы, дисковые затворы, обратные клапаны,
              электроприводы и комплектующие. DN15–DN1000, PN16–PN64. Официальные поставки с НДС и
              документами.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-slate-300/90 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:border-[#1e3a5f]/35 hover:bg-white hover:text-[#0c2342] hover:shadow-md sm:self-auto"
          >
            Все позиции <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const visual = getCategoryVisual(cat.id);
            const count = productCounts[cat.id] ?? 0;
            const isRecommended = cat.id === recommendedCategoryId;

            return (
              <Link
                key={cat.id}
                href={`/catalog/category/${cat.slug}`}
                className={`group relative flex items-center gap-4 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.08] ${
                  isRecommended
                    ? "border-[#93b4d9]/70 bg-white shadow-[0_12px_28px_-18px_rgba(14,52,94,0.35)] hover:border-[#2563eb]/55 hover:shadow-[0_16px_36px_-14px_rgba(14,52,94,0.22)]"
                    : "border-slate-300/85 bg-white hover:border-[#93b4d9]/90 hover:bg-white"
                }`}
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-300/70 bg-slate-100">
                  <Image
                    src={visual.imageSrc}
                    alt={visual.imageAlt}
                    fill
                    quality={100}
                    sizes="96px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {isRecommended && (
                    <span className="mb-1 inline-flex rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                      Рекомендуем
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-slate-950 transition-colors group-hover:text-[#0c2342] sm:text-lg">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {count > 0 ? `${count} позиций` : "под заказ"}
                    <span className="mx-1.5 text-slate-300">·</span>
                    {cat.subcategories.length} подкатегори
                    {cat.subcategories.length === 1 ? "я" : "и"}
                  </p>
                </div>
                <ArrowRight
                  className={`h-5 w-5 shrink-0 transition-all group-hover:translate-x-1 group-hover:text-[#0c2342] ${
                    isRecommended ? "text-[#2563eb]" : "text-slate-400"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
