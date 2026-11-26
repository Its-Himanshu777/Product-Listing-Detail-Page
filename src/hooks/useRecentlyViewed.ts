import { useSyncExternalStore } from "react";
import type { Product } from "../types/product";

let recentProducts: Product[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function addRecentlyViewed(product: Product): void {
  const filtered = recentProducts.filter((item) => item.id !== product.id);
  recentProducts = [product, ...filtered].slice(0, 5);
  emitChange();
}

export function clearRecentlyViewed(): void {
  recentProducts = [];
  emitChange();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Product[] {
  return recentProducts;
}

export function useRecentlyViewed(): Product[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
