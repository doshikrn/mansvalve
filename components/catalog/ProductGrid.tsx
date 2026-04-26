import { PackageSearch } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { PublicCatalogProduct as Product } from "@/lib/public-catalog";

interface ProductGridProps {
  products: Product[];
  total: number;
}

export function ProductGrid({ products, total }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <PackageSearch
          size={64}
          strokeWidth={1}
          className="mb-5 text-slate-300"
        />
        <h3 className="mb-2 text-xl font-semibold text-slate-900">
          Ничего не найдено
        </h3>
        <p className="max-w-sm text-base text-slate-500">
          По выбранным фильтрам товары не найдены. Попробуйте изменить параметры
          фильтрации.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-sm text-slate-500">
        Найдено{" "}
        <span className="font-semibold text-slate-900">{total}</span>{" "}
        {pluralize(total)}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function pluralize(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "позиция";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "позиции";
  return "позиций";
}
