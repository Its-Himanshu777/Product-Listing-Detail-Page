import type { Category, Product, ProductListResponse } from "../types/product";
import { http } from "./http";

const BASE = import.meta.env.VITE_API_URL ?? "https://dummyjson.com";

export const productsApi = {
  list: (signal?: AbortSignal) =>
    http<ProductListResponse>(
      `${BASE}/products?limit=0&select=id,title,description,price,rating,thumbnail,brand,category`,
      signal,
    ),
  byCategory: (slug: string, signal?: AbortSignal) =>
    http<ProductListResponse>(
      `${BASE}/products/category/${encodeURIComponent(slug)}?limit=0`,
      signal,
    ),
  categories: (signal?: AbortSignal) =>
    http<Array<Category | string>>(`${BASE}/products/categories`, signal),
  byId: (id: string, signal?: AbortSignal) =>
    http<Product>(`${BASE}/products/${encodeURIComponent(id)}`, signal),
};
