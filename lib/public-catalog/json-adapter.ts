import {
  categories as jsonCategories,
  products as jsonProducts,
  getCategoryById as jsonGetCategoryById,
  getCategoryBySlug as jsonGetCategoryBySlug,
  getProductBySlug as jsonGetProductBySlug,
  getProductsByCategory as jsonGetProductsByCategory,
  getProductsBySubcategory as jsonGetProductsBySubcategory,
} from "@/lib/catalog-data";
import { getOrderedCatalogCategories } from "@/lib/catalog-seo";

import type {
  PublicCatalogAdapter,
  PublicCatalogCategory,
  PublicCatalogProduct,
  PublicCatalogSubcategory,
} from "./types";
import { toCatalogListProduct } from "./catalog-list-product";

function toPublicCategory(
  category: (typeof jsonCategories)[number],
): PublicCatalogCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    subcategories: category.subcategories.map(
      (subcategory): PublicCatalogSubcategory => ({
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        parentCategory: subcategory.parentCategory,
      }),
    ),
  };
}

function toPublicProduct(
  product: (typeof jsonProducts)[number],
): PublicCatalogProduct {
  return {
    ...product,
  };
}

export const jsonCatalogAdapter: PublicCatalogAdapter = {
  async getCategories() {
    return getOrderedCatalogCategories(jsonCategories.map(toPublicCategory));
  },

  async getProducts() {
    return jsonProducts.map(toPublicProduct);
  },

  async getListingProducts() {
    return jsonProducts.map((p) => toCatalogListProduct(toPublicProduct(p)));
  },

  async getCategoryBySlug(slug) {
    const category = jsonGetCategoryBySlug(slug);
    return category ? toPublicCategory(category) : undefined;
  },

  async getCategoryById(id) {
    const category = jsonGetCategoryById(id);
    return category ? toPublicCategory(category) : undefined;
  },

  async getSubcategoryBySlug(slug) {
    for (const category of jsonCategories) {
      const subcategory = category.subcategories.find((sub) => sub.slug === slug);
      if (subcategory) {
        return {
          category: toPublicCategory(category),
          subcategory: {
            id: subcategory.id,
            name: subcategory.name,
            slug: subcategory.slug,
            parentCategory: subcategory.parentCategory,
          },
        };
      }
    }
    return undefined;
  },

  async getProductBySlug(slug) {
    const product = jsonGetProductBySlug(slug);
    return product ? toPublicProduct(product) : undefined;
  },

  async getProductsByCategory(categoryId) {
    return jsonGetProductsByCategory(categoryId).map((p) =>
      toCatalogListProduct(toPublicProduct(p)),
    );
  },

  async getProductsBySubcategory(subcategoryId) {
    return jsonGetProductsBySubcategory(subcategoryId).map((p) =>
      toCatalogListProduct(toPublicProduct(p)),
    );
  },
};
