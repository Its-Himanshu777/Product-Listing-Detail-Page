import { useCallback } from "react";
import { productsApi } from "../api/products";
import type { Product } from "../types/product";
import { getCachedValue, useFetch } from "./useFetch";

export function getProductsCacheKey(category: string): string {
  return category ? `products:category:${category}` : "products:all";
}

export function getCachedProducts(category: string): Product[] | undefined {
  return getCachedValue<Product[]>(getProductsCacheKey(category));
}

export function useProducts(category: string) {
  const key = getProductsCacheKey(category);

  const fetcher = useCallback(
    async (signal: AbortSignal) => {
      const response = category
        ? await productsApi.byCategory(category, signal)
        : await productsApi.list(signal);
      return response.products;
    },
    [category],
  );

  const { data, loading, error, retry } = useFetch<Product[]>(key, fetcher);

  return {
    products: data ?? [],
    loading,
    error,
    retry,
  };
}
