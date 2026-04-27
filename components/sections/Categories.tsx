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
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="site-heading">
              Каталог MANSVALVE GROUP
            </h2>
            <p className="site-copy mt-2 max-w-[700px]">
              700+ позиций в наличии и под заказ: задвижки, фланцы, дисковые затворы, обратные клапаны,
              электроприводы и комплектующие. DN15–DN1000, PN16–PN64. Официальные поставки с НДС и
              документами.
            </p>
          </div>
          <Link
            href="/catalog"
            className="site-link-button self-start sm:self-auto"
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
                className={`site-card group relative flex items-center gap-4 p-5 ${
                  isRecommended ? "ring-1 ring-site-primary/25" : ""
                }`}
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-site-border bg-site-bg">
                  {/* 256px source for ~96×96 CSS box → sharp on 2–3× screens (fill+sizes alone often picks ~128px). */}
                  <Image
                    src={visual.imageSrc}
                    alt={visual.imageAlt}
                    width={256}
                    height={256}
                    quality={90}
                    sizes="96px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {isRecommended && (
                    <span className="mb-1 inline-flex rounded-lg border border-site-border bg-site-card px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-site-primary">
                      Рекомендуем
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-site-ink transition-colors group-hover:text-site-primary-hover sm:text-lg">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-site-muted">
                    {count > 0 ? `${count} позиций` : "под заказ"}
                    <span className="mx-1.5 text-site-border">·</span>
                    {cat.subcategories.length} подкатегори
                    {cat.subcategories.length === 1 ? "я" : "и"}
                  </p>
                </div>
                <ArrowRight
                  className={`h-5 w-5 shrink-0 transition-all group-hover:translate-x-1 group-hover:text-site-primary-hover ${
                    isRecommended ? "text-site-primary" : "text-site-muted"
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
