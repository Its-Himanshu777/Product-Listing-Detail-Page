import { useCallback } from "react";
import { HttpError } from "../api/http";
import { productsApi } from "../api/products";
import type { Product } from "../types/product";
import { useFetch } from "./useFetch";

export function useProduct(id: string) {
  const fetcher = useCallback(
    (signal: AbortSignal) => productsApi.byId(id, signal),
    [id],
  );

  const { data, loading, error, retry } = useFetch<Product>(
    `product:${id}`,
    fetcher,
  );

  const isNotFound = error instanceof HttpError && error.status === 404;

  return {
    product: data ?? null,
    loading,
    error,
    isNotFound,
    retry,
  };
}
