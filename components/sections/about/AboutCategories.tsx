import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import type { PublicCatalogCategory } from "@/lib/public-catalog";

type AboutCategoriesProps = {
  title: string;
  description: string;
  linkLabel: string;
  categories: PublicCatalogCategory[];
  directions: string[];
};

export function AboutCategories({
  title,
  description,
  linkLabel,
  categories,
  directions,
}: AboutCategoriesProps) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-site-ink sm:text-3xl">{title}</h2>
            <p className="mt-2 text-site-muted">{description}</p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-site-primary transition-colors hover:text-site-primary-hover"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-semibold text-site-ink">Основные направления поставок</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {directions.map((direction) => (
              <span
                key={direction}
                className="rounded-full border border-site-border bg-white px-3 py-1.5 text-xs font-medium text-site-muted"
              >
                {direction}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog/category/${category.slug}`}
              className="group flex min-h-28 flex-col justify-between rounded-xl border border-site-border bg-slate-50 p-5 transition-all hover:border-site-primary/35 hover:bg-white"
            >
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-site-primary/10 text-site-primary">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-site-ink transition-colors group-hover:text-site-primary">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-site-muted">
                  {category.subcategories.length} подкатегорий
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
