import type { Product } from "../types/product";

export const PAGE_SIZE = 12;

export type Filters = {
  min?: number;
  max?: number;
  brands: string[];
};

export type BrandOption = {
  name: string;
  count: number;
};

export function parsePriceInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, numeric);
}

export function isPriceRangeInvalid(min?: number, max?: number): boolean {
  return min !== undefined && max !== undefined && min > max;
}

export function filterProducts(
  products: Product[],
  filters: Filters,
): Product[] {
  const brandSet = new Set(filters.brands);
  const applyPrice = !isPriceRangeInvalid(filters.min, filters.max);

  return products.filter((product) => {
    const matchesMin =
      !applyPrice || filters.min === undefined || product.price >= filters.min;
    const matchesMax =
      !applyPrice || filters.max === undefined || product.price <= filters.max;
    const matchesBrand =
      brandSet.size === 0 ||
      Boolean(product.brand && brandSet.has(product.brand));
    return matchesMin && matchesMax && matchesBrand;
  });
}

export function extractBrands(products: Product[]): BrandOption[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const brand = product.brand?.trim();
    if (!brand) continue;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPriceBounds(
  products: Product[],
): { min: number; max: number } | null {
  if (products.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const product of products) {
    if (product.price < min) min = product.price;
    if (product.price > max) max = product.price;
  }
  return {
    min: Math.floor(min),
    max: Math.ceil(max),
  };
}

export function paginate<T>(items: T[], page: number, size: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * size, current * size),
    current,
    totalPages,
  };
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (let index = 0; index < sorted.length; index++) {
    const page = sorted[index];
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  }
  return items;
}
