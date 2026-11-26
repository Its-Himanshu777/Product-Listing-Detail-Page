import { useCallback } from "react";
import { productsApi } from "../api/products";
import { formatCategoryLabel } from "../lib/format";
import type { Category } from "../types/product";
import { useFetch } from "./useFetch";

export function useCategories() {
  const fetcher = useCallback(async (signal: AbortSignal) => {
    const rawCategories = await productsApi.categories(signal);
    return rawCategories.map((entry) =>
      typeof entry === "string"
        ? { slug: entry, name: formatCategoryLabel(entry) }
        : { slug: entry.slug, name: entry.name },
    );
  }, []);

  const { data, loading, error, retry } = useFetch<Category[]>(
    "categories",
    fetcher,
  );

  return {
    categories: data ?? [],
    loading,
    error,
    retry,
  };
}
