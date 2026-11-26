import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { extractBrands, parsePriceInput } from "../lib/filterProducts";
import { getCachedProducts } from "./useProducts";

export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";
  const brands = searchParams.getAll("brand");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setCategory = useCallback(
    (nextCategory: string) => {
      const next = new URLSearchParams(searchParams);
      if (nextCategory) next.set("category", nextCategory);
      else next.delete("category");

      const cachedProducts = getCachedProducts(nextCategory);
      if (cachedProducts) {
        const validBrands = new Set(
          extractBrands(cachedProducts).map((option) => option.name),
        );
        const keptBrands = next
          .getAll("brand")
          .filter((brand) => validBrands.has(brand));
        next.delete("brand");
        for (const brand of keptBrands) {
          next.append("brand", brand);
        }
      } else {
        next.delete("brand");
      }

      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setPriceRange = useCallback(
    (nextMinRaw: string, nextMaxRaw: string) => {
      const next = new URLSearchParams(searchParams);
      const parsedMin = parsePriceInput(nextMinRaw);
      const parsedMax = parsePriceInput(nextMaxRaw);

      if (parsedMin !== undefined) next.set("min", String(parsedMin));
      else next.delete("min");

      if (parsedMax !== undefined) next.set("max", String(parsedMax));
      else next.delete("max");

      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setBrands = useCallback(
    (nextBrands: string[]) => {
      const next = new URLSearchParams(searchParams);
      next.delete("brand");
      for (const brand of nextBrands) {
        next.append("brand", brand);
      }
      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setPage = useCallback(
    (value: number) => {
      const next = new URLSearchParams(searchParams);
      if (value > 1) next.set("page", String(value));
      else next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    category,
    minPrice,
    maxPrice,
    brands,
    page,
    setCategory,
    setPriceRange,
    setBrands,
    setPage,
    clearFilters,
  };
}
