import type { CategoryWithSubcategories } from "@/lib/services/categories";

export type ProductFormCategoryContext = {
  categoryId: number;
  subcategoryId: number | null;
  categorySlug?: string;
  categoryName?: string;
  subcategorySlug?: string | null;
  subcategoryName?: string | null;
};

export function readProductFormCategoryContext(
  formData: FormData,
  categories: CategoryWithSubcategories[],
): { ok: true; context: ProductFormCategoryContext } | { ok: false; fieldErrors: Record<string, string> } {
  const categoryId = Number(formData.get("categoryId"));
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return {
      ok: false,
      fieldErrors: { categoryId: "Выберите категорию." },
    };
  }

  const subcategoryRaw = String(formData.get("subcategoryId") ?? "").trim();
  const subcategoryId =
    subcategoryRaw && Number.isInteger(Number(subcategoryRaw)) && Number(subcategoryRaw) > 0
      ? Number(subcategoryRaw)
      : null;

  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: "Категория не найдена. Обновите страницу." },
    };
  }

  const subcategory = subcategoryId
    ? category.subcategories.find((item) => item.id === subcategoryId)
    : undefined;

  if (subcategoryId && !subcategory) {
    return {
      ok: false,
      fieldErrors: {
        subcategoryId: "Подкатегория не относится к выбранной категории.",
      },
    };
  }

  return {
    ok: true,
    context: {
      categoryId,
      subcategoryId,
      categorySlug: category.slug,
      categoryName: category.name,
      subcategorySlug: subcategory?.slug ?? null,
      subcategoryName: subcategory?.name ?? null,
    },
  };
}
