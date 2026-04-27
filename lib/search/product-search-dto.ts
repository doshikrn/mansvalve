/**
 * `GET /api/search/products` response items — minimal, client-safe.
 */
export type ProductSearchItemDto = {
  slug: string;
  name: string;
  categoryName: string;
  subcategoryName: string;
  price: number | null;
  priceByRequest: boolean;
  primaryImageUrl: string | null;
};
