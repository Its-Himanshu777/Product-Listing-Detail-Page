import { describe, expect, it } from "vitest";
import { extractBrands, filterProducts, paginate } from "../filterProducts";
import type { Product } from "../../types/product";

const sampleProducts: Product[] = [
  {
    id: 1,
    title: "Phone A",
    description: "Desc 1",
    category: "smartphones",
    brand: "Apple",
    price: 999,
    rating: 4.8,
    thumbnail: "https://example.com/1.jpg",
  },
  {
    id: 2,
    title: "Phone B",
    description: "Desc 2",
    category: "smartphones",
    brand: "Samsung",
    price: 799,
    rating: 4.5,
    thumbnail: "https://example.com/2.jpg",
  },
  {
    id: 3,
    title: "Phone C",
    description: "Desc 3",
    category: "smartphones",
    brand: "Apple",
    price: 499,
    rating: 4.2,
    thumbnail: "https://example.com/3.jpg",
  },
  {
    id: 4,
    title: "Generic Charger",
    description: "Desc 4",
    category: "smartphones",
    price: 25,
    rating: 4.0,
    thumbnail: "https://example.com/4.jpg",
  },
];

describe("filterProducts", () => {
  it("filters by price range only", () => {
    const result = filterProducts(sampleProducts, {
      min: 400,
      max: 850,
      brands: [],
    });
    expect(result.map((p) => p.id)).toEqual([2, 3]);
  });

  it("filters by brand only", () => {
    const result = filterProducts(sampleProducts, {
      brands: ["Apple"],
    });
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  it("combines price range and brand filters", () => {
    const result = filterProducts(sampleProducts, {
      min: 600,
      brands: ["Apple"],
    });
    expect(result.map((p) => p.id)).toEqual([1]);
  });

  it("ignores price bounds when min > max", () => {
    const result = filterProducts(sampleProducts, {
      min: 900,
      max: 100,
      brands: ["Apple"],
    });
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  it("returns all products when brands is empty and no price bounds are set", () => {
    const result = filterProducts(sampleProducts, { brands: [] });
    expect(result).toHaveLength(4);
  });

  it("filters by search query across title, description, brand, and category", () => {
    const result = filterProducts(sampleProducts, {
      brands: [],
      query: "charger",
    });
    expect(result.map((p) => p.id)).toEqual([4]);
  });
});

describe("extractBrands", () => {
  it("extracts unique brands with product counts in alphabetical order", () => {
    expect(extractBrands(sampleProducts)).toEqual([
      { name: "Apple", count: 2 },
      { name: "Samsung", count: 1 },
    ]);
  });
});

describe("paginate", () => {
  it("clamps page numbers below 1 and above totalPages", () => {
    const items = Array.from({ length: 15 }, (_, index) => index + 1);

    const low = paginate(items, 0, 12);
    expect(low.current).toBe(1);
    expect(low.totalPages).toBe(2);
    expect(low.items).toHaveLength(12);

    const high = paginate(items, 99, 12);
    expect(high.current).toBe(2);
    expect(high.items).toEqual([13, 14, 15]);
  });

  it("handles empty arrays with totalPages = 1", () => {
    const empty = paginate([], 2, 12);
    expect(empty).toEqual({ items: [], current: 1, totalPages: 1 });
  });
});
