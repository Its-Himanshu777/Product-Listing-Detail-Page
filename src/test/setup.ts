import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { clearFetchCache } from "../hooks/useFetch";
import { clearRecentlyViewed } from "../hooks/useRecentlyViewed";

Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

afterEach(() => {
  cleanup();
  clearFetchCache();
  clearRecentlyViewed();
});
